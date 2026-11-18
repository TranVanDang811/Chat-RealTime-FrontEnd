import { createSlice } from "@reduxjs/toolkit";
import {
  sendMessage,
  getMessages,
  createPrivateRoom,
  createGroupRoom,
  getRooms,
  updateRoomName,
  addRoomMembers,
  updateNickname,
  recallMessage,
} from "./chatThunks";

// ===== INITIAL STATE =====
const initialState = {
  rooms: [],            // list of chat rooms
  currentRoom: null,    // current selected room
  messages: [],         // messages in current room
  messagesLoading: false,
  roomsLoading: false,
  error: null,

  summary: null,        // AI summary
  summaryLoading: false,
};

// normalize room id (handle id / roomId)
const normalizeRoom = (r) => ({
  ...r,
  id: r.id ?? r.roomId,
  roomId: r.roomId ?? r.id,
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {

    // ===== SUMMARY =====
    setSummaryLoading: (state, action) => {
      state.summaryLoading = action.payload;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
      state.summaryLoading = false;
    },

    // ===== NEW ROOM (realtime) =====
    receiveNewRoom(state, action) {
      const room = normalizeRoom(action.payload);
      if (!state.rooms.some((r) => r.id === room.id)) {
        state.rooms.unshift(room);
      }
    },

    // set current room
    setCurrentRoom(state, action) {
      state.currentRoom = normalizeRoom(action.payload);
    },

    // clear messages
    clearMessages(state) {
      state.messages = [];
    },

    // clear error
    clearChatError(state) {
      state.error = null;
    },

    // remove temp message (optimistic UI)
    removeTempMessage(state, action) {
      const tempId = action.payload;
      state.messages = state.messages.filter((m) => m.id !== tempId);
    },

    // ===== RECEIVE MESSAGE (WS realtime) =====
    receiveMessage: (state, action) => {
      const msg = action.payload;

      // update if message already exists (e.g. recalled or edited)
      const existingIndex = state.messages.findIndex(
        (m) => String(m.id) === String(msg.id)
      );
      if (existingIndex !== -1) {
        state.messages[existingIndex] = {
          ...state.messages[existingIndex],
          ...msg,
        };
        const room = state.rooms.find(
          (r) => r.id === msg.roomId || r.roomId === msg.roomId
        );
        if (room && (room.lastMessageId === msg.id || !room.lastMessageId)) {
          room.lastMessage = msg.content;
        }
        return;
      }

      // replace temp message
      if (msg.tempId) {
        const index = state.messages.findIndex(
          (m) =>
            String(m.id) === String(msg.tempId) ||
            String(m.tempId) === String(msg.tempId)
        );
        if (index !== -1) {
          state.messages[index] = { ...msg, isTemp: false };
          return;
        }
      }

      // add new message
      state.messages.push(msg);

      // ===== update room info =====
      const room = state.rooms.find(
        (r) => r.id === msg.roomId || r.roomId === msg.roomId
      );

      if (room) {
        const isCurrentRoom =
          state.currentRoom?.id === msg.roomId ||
          state.currentRoom?.roomId === msg.roomId;

        // update unread
        room.unreadCount = isCurrentRoom
          ? 0
          : (room.unreadCount || 0) + 1;

        room.lastMessage = msg.content;
        room.lastMessageTime = msg.createdAt;

        // move room to top
        const idx = state.rooms.findIndex(
          (r) => r.id === msg.roomId || r.roomId === msg.roomId
        );
        if (idx > 0) {
          state.rooms.unshift(state.rooms.splice(idx, 1)[0]);
        }
      }
    },

    // ===== RECEIVE NOTIFICATION =====
    receiveNotification(state, action) {
      const payload = action.payload;

      // handle recalled notification
      if (payload?.type === "MESSAGE_RECALLED" && payload?.data) {
        const recalledMsg = payload.data;
        const existingIndex = state.messages.findIndex(
          (m) => String(m.id) === String(recalledMsg.id)
        );
        if (existingIndex !== -1) {
          state.messages[existingIndex] = {
            ...state.messages[existingIndex],
            ...recalledMsg,
          };
        }
        const room = state.rooms.find(
          (r) => r.id === recalledMsg.roomId || r.roomId === recalledMsg.roomId
        );
        if (room) {
          room.lastMessage = recalledMsg.content;
        }
        return;
      }

      const msg = payload;
      if (!msg?.roomId) return;

      const isCurrentRoom =
        state.currentRoom?.id === msg.roomId ||
        state.currentRoom?.roomId === msg.roomId;

      if (isCurrentRoom) return;

      const room = state.rooms.find(
        (r) => r.id === msg.roomId || r.roomId === msg.roomId
      );

      if (room) {
        room.unreadCount = (room.unreadCount || 0) + 1;
        room.lastMessage = msg.content;
        room.lastMessageTime = msg.createdAt;
      }
    },

    // reset unread count
    resetUnread(state, action) {
      const roomId = action.payload;
      const room = state.rooms.find(
        (r) => r.id === roomId || r.roomId === roomId
      );
      if (room) room.unreadCount = 0;
    },

    // update user online/offline
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;

      state.rooms.forEach((room) => {
        room.members?.forEach((m) => {
          if (m.id === userId) {
            m.status = status;
          }
        });
      });
    },

    // update room members (add/remove)
    updateRoomMembers(state, action) {
      const updatedRoom = normalizeRoom(action.payload);
      const index = state.rooms.findIndex((r) => r.id === updatedRoom.id);

      if (index !== -1) {
        state.rooms[index] = { ...state.rooms[index], ...updatedRoom };
      } else {
        state.rooms.unshift(updatedRoom);
      }

      // update current room
      if (state.currentRoom?.id === updatedRoom.id) {
        state.currentRoom = { ...state.currentRoom, ...updatedRoom };
      }
    },
  },

  extraReducers: (builder) => {
    builder

      // ===== SEND MESSAGE =====
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ===== GET MESSAGES =====
      .addCase(getMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const payload = action.payload;
        const msgList = payload?.messages || (Array.isArray(payload) ? payload : []);
        const page = payload?.page || 0;

        if (page > 0) {
          const existingIds = new Set(state.messages.map((m) => String(m.id)));
          const older = msgList.filter((m) => !existingIds.has(String(m.id)));
          state.messages = [...older, ...state.messages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        } else {
          state.messages = [...msgList].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        }
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })

      // ===== CREATE ROOM =====
      .addCase(createPrivateRoom.fulfilled, (state, action) => {
        const room = normalizeRoom(action.payload);
        state.rooms.unshift(room);
        state.currentRoom = room;
      })
      .addCase(createGroupRoom.fulfilled, (state, action) => {
        const room = normalizeRoom(action.payload);
        state.rooms.unshift(room);
        state.currentRoom = room;
      })

      // ===== GET ROOMS =====
      .addCase(getRooms.pending, (state) => {
        state.roomsLoading = true;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.roomsLoading = false;
        state.rooms = (action.payload || []).map(normalizeRoom);
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.roomsLoading = false;
        state.error = action.payload;
      })

      // ===== UPDATE ROOM =====
      .addCase(updateRoomName.fulfilled, (state, action) => {
        const updated = normalizeRoom(action.payload);
        const index = state.rooms.findIndex((r) => r.id === updated.id || r.roomId === updated.id);
        if (index !== -1) {
          state.rooms[index] = { ...state.rooms[index], ...updated };
        }
        if (state.currentRoom?.id === updated.id || state.currentRoom?.roomId === updated.id) {
          state.currentRoom = { ...state.currentRoom, ...updated };
        }
      })

      .addCase(addRoomMembers.fulfilled, (state, action) => {
        const updated = normalizeRoom(action.payload);
        const index = state.rooms.findIndex((r) => r.id === updated.id || r.roomId === updated.id);
        if (index !== -1) {
          state.rooms[index] = { ...state.rooms[index], ...updated };
        }
        if (state.currentRoom?.id === updated.id || state.currentRoom?.roomId === updated.id) {
          state.currentRoom = { ...state.currentRoom, ...updated };
        }
      })

      .addCase(updateNickname.fulfilled, (state, action) => {
        const updated = normalizeRoom(action.payload);
        const index = state.rooms.findIndex((r) => r.id === updated.id || r.roomId === updated.id);
        if (index !== -1) {
          state.rooms[index] = { ...state.rooms[index], ...updated };
        }
        if (state.currentRoom?.id === updated.id || state.currentRoom?.roomId === updated.id) {
          state.currentRoom = { ...state.currentRoom, ...updated };
        }
      })

      // ===== RECALL MESSAGE =====
      .addCase(recallMessage.fulfilled, (state, action) => {
        const recalled = action.payload;
        if (!recalled?.id) return;
        const index = state.messages.findIndex(
          (m) => String(m.id) === String(recalled.id)
        );
        if (index !== -1) {
          state.messages[index] = {
            ...state.messages[index],
            ...recalled,
            isRecalled: true,
          };
        }
        const room = state.rooms.find(
          (r) => r.id === recalled.roomId || r.roomId === recalled.roomId
        );
        if (room) {
          room.lastMessage = recalled.content;
        }
      });
  },
});

export const {
  receiveMessage,
  setCurrentRoom,
  clearMessages,
  clearChatError,
  receiveNewRoom,
  removeTempMessage,
  resetUnread,
  receiveNotification,
  setSummary,
  setSummaryLoading,
  updateRoomMembers,
} = chatSlice.actions;

export default chatSlice.reducer;