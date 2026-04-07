import axiosInstance from "../../services/axiosInstance";

// get clean data from response
const unwrap = (res) => {
  const data = res?.data ?? res; // support res.data or res
  return data?.result ?? data ?? [];
};

export default {

  // ===== SEND MESSAGE =====
  sendMessage: (payload) =>
    axiosInstance.post("/chat/send", {
      roomId: payload.roomId,        // room id
      content: payload.content,      // message content
      type: payload.type || "TEXT",  // message type
      tempId: payload.tempId || null, // temp id (for UI)
    }).then(unwrap),

  // ===== GET MESSAGES =====
  getMessages: (roomId, page = 0, size = 20) =>
    axiosInstance
      .get(`/chat/${roomId}/messages?page=${page}&size=${size}`) // get messages (pagination)
      .then(unwrap),

  // ===== CREATE PRIVATE ROOM =====
  createPrivateRoom: (userId) =>
    axiosInstance
      .post(`/chat/private?userId=${userId}`) // create 1-1 chat
      .then(unwrap),

  // ===== CREATE GROUP ROOM =====
  createGroupRoom: (payload) =>
    axiosInstance
      .post("/chat/group", {
        roomName: payload.name,       // group name
        memberIds: payload.memberIds, // members
      })
      .then(unwrap),

  // ===== ADD MEMBERS =====
  addRoomMembers: ({ roomId, memberIds }) =>
    axiosInstance
      .post(`/chat/rooms/${roomId}/members`, { memberIds }) // add users to room
      .then(unwrap),

  // ===== GET ROOMS =====
  getRooms: () =>
    axiosInstance.get("/chat/rooms").then(unwrap), // get all rooms

  // ===== MARK AS SEEN =====
  markAsSeen: (roomId) =>
    axiosInstance.post(`/chat/${roomId}/seen`).then(unwrap), // mark messages as read

  // ===== UPDATE ROOM NAME =====
  updateRoomName: (payload) =>
    axiosInstance.put("/chat/room/name", {
      roomId: payload.roomId,   // room id
      roomName: payload.roomName, // new name
    }).then(unwrap),
};