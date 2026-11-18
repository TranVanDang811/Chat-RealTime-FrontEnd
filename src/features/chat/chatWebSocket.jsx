import { Client } from "@stomp/stompjs";
import {
  receiveMessage,
  updateRoomMembers,
  setSummary,
  setSummaryLoading,
  receiveNotification,
  receiveNewRoom
} from "./chatSlice";
import { getRooms, sendMessage } from "./chatThunks";
import { addFriend, addIncomingRequest, removeFriend, removeIncoming, removeOutgoing } from "../friend/friendSlice";

let stompClient = null;       // WebSocket client
let subscriptions = {};       // store all subscriptions

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
const getToken = () => localStorage.getItem("token");

/* ===== CREATE CLIENT ===== */
const createClient = () => {
  const token = getToken();
  if (!token) return null;

  return new Client({
    brokerURL: `${WS_URL}?token=${token}`, // connect with token
    reconnectDelay: 5000,                  // auto reconnect
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => console.log("WS connected"),
    onDisconnect: () => console.log("WS disconnected"),
    onStompError: (frame) => console.error("STOMP error:", frame.headers?.message),
    onWebSocketError: (event) => console.error("WebSocket error:", event),
  });
};

/* ===== CONNECT ===== */
export const connectSocket = (dispatch, userId) => {
 
  if (stompClient?.active) {
    subscribeUserQueue(dispatch, userId);
    return;
  }

  const client = createClient();
  if (!client) return;

  client.onConnect = () => {
    subscribeSummary(dispatch);
    subscribeUserQueue(dispatch, userId);
  };

  stompClient = client;
  stompClient.activate();
};

/* ===== SUBSCRIBE HELPER ===== */
const subscribe = (key, destination, callback) => {
  if (!stompClient) return;

  const trySub = () => {
    if (stompClient.connected) {
      if (subscriptions[key]) subscriptions[key].unsubscribe();
      subscriptions[key] = stompClient.subscribe(destination, callback);
    } else {
      setTimeout(trySub, 300); // wait until connected
    }
  };

  trySub();
};

// unsubscribe by key
export const unsubscribe = (key) => {
  if (subscriptions[key]) {
    subscriptions[key].unsubscribe();
    delete subscriptions[key];
  }
};

/* ===== SUBSCRIBE ROOM ===== */
export const subscribeRoom = (roomId, dispatch) => {
  if (!stompClient) return;

  unsubscribe("room");

  subscribe("room", `/topic/room/${roomId}`, (msg) => {
    try {
      const data = JSON.parse(msg.body);

      // message or room update
      if (data.senderId !== undefined) {
        dispatch(receiveMessage(data));
      } else {
        dispatch(updateRoomMembers(data));
      }
    } catch (e) {
      console.error("Parse message error:", e);
    }
  });
};

/* ===== SUBSCRIBE SUMMARY ===== */
export const subscribeSummary = (dispatch) => {
  if (!stompClient) return;

  unsubscribe("summary");

  subscribe("summary", `/user/queue/summary`, (msg) => {
    try {
      const data = JSON.parse(msg.body);

      if (data.status === "LOADING") {
        dispatch(setSummaryLoading(true));
      }

      if (data.status === "DONE") {
        dispatch(setSummaryLoading(false));
        const summaryText =
          data.data?.summary ||
          data.data?.content ||
          JSON.stringify(data.data);

        dispatch(setSummary(summaryText));
      }

      if (data.status === "ERROR") {
        dispatch(setSummaryLoading(false));
      }
    } catch (e) {}
  });
};

/* ===== SEND SUMMARY REQUEST ===== */
export const summarizeWS = (roomId, dispatch, forceRefresh = false) => {
  if (!stompClient?.connected) return;

  dispatch(setSummary(null));
  dispatch(setSummaryLoading(true));

  stompClient.publish({
    destination: "/app/chat.summarize",
    body: JSON.stringify({ roomId, limit: 30, forceRefresh }),
  });
};

/* ===== SEND MESSAGE ===== */
export const sendMessageWS = (payload, dispatch) => {
  if (!stompClient?.connected) {
    // fallback to REST API
    dispatch(sendMessage(payload));
    return false;
  }

  try {
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });
    return true;
  } catch (e) {
    // fallback if WS fails
    dispatch(sendMessage(payload));
    return false;
  }
};

/* ===== DISCONNECT ===== */
export const disconnectSocket = () => {
  if (stompClient) {
    Object.values(subscriptions).forEach((sub) => sub.unsubscribe());
    subscriptions = {};
    stompClient.deactivate();
    stompClient = null;
  }
};

/* ===== USER NOTIFICATIONS ===== */
export const subscribeUserQueue = (dispatch, userId) => {
  if (!stompClient || !userId) return;
  unsubscribe("userQueue");

  subscribe("userQueue", `/user/queue/notifications`, (msg) => {
    try {
      const { type, data } = JSON.parse(msg.body);

      switch (type) {
        case "NEW_MESSAGE":
          dispatch(receiveNotification(data));
          break;

        case "FRIEND_REQUEST":
          dispatch(addIncomingRequest(data));
          break;

        case "FRIEND_ACCEPTED":
          dispatch(removeOutgoing(data.id));
          dispatch(removeIncoming(data.id));
          dispatch(addFriend(data));
          dispatch(getRooms());
          break;

        case "FRIEND_REJECTED":
          dispatch(removeOutgoing(data));  
          break;

        case "FRIEND_REMOVED":
          dispatch(removeFriend(data));   
          break;

        case "NEW_ROOM":
          dispatch(receiveNewRoom(data));
          break;

        case "ROOM_UPDATED":
          dispatch(updateRoomMembers(data));
          break;

        default:
          console.warn("Unknown notification type:", type);
      }
    } catch (e) {
      console.error("Parse notification error:", e);
    }
  });
};