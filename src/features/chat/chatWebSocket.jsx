import { Client } from "@stomp/stompjs";
import {
  receiveMessage,
  updateRoomMembers,
  setSummary,
  setSummaryLoading,
  receiveNotification
} from "./chatSlice";
import { sendMessage } from "./chatThunks";

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
  if (stompClient?.active) return; // already connected

  const client = createClient();
  if (!client) return;

  client.onConnect = () => {
    subscribeSummary(dispatch);        // listen summary
    subscribeUserQueue(dispatch, userId); // listen notifications
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
export const summarizeWS = (roomId, dispatch) => {
  if (!stompClient?.connected) return;

  dispatch(setSummary(null));
  dispatch(setSummaryLoading(true));

  stompClient.publish({
    destination: "/app/chat.summarize",
    body: JSON.stringify({ roomId, limit: 30 }),
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

  subscribe("userQueue", `/topic/user/${userId}/notifications`, (msg) => {
    try {
      const data = JSON.parse(msg.body);

      if (data.senderId !== undefined) {
        dispatch(receiveNotification(data)); // update unread
      }
    } catch (e) {
      console.error("Parse notification error:", e);
    }
  });
};