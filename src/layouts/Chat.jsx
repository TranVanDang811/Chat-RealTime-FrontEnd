import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Topbar from "../pages/Topbar";
import Sidebar from "../pages/Sidebar";
import ChatMain from "../pages/ChatMain";

import { connectSocket, disconnectSocket } from "../features/chat/chatWebSocket";
import { getRooms } from "../features/chat/chatThunks";
import { getMyInfo } from "../features/user/userThunks";

const ChatPage = () => {
  const dispatch = useDispatch();
  const myInfo = useSelector((s) => s.user.myInfo);
  const { rooms } = useSelector((s) => s.chat);

  const [activeChat, setActiveChat] = useState({ room: null, contact: null });
  const restoredRef = useRef(false); // avoid restore multiple times

  // ===== STEP 1: LOAD USER =====
  useEffect(() => {
    dispatch(getMyInfo());
  }, []);

  // ===== STEP 2: CONNECT WS + LOAD ROOMS =====
  useEffect(() => {
    if (!myInfo?.id) return;

    connectSocket(dispatch, myInfo.id); // connect WebSocket
    dispatch(getRooms());               // load chat rooms

    return () => disconnectSocket();    // cleanup on unmount
  }, [myInfo?.id]);

  // ===== STEP 3: RESTORE LAST ROOM =====
  useEffect(() => {
    if (!rooms.length || restoredRef.current) return;

    const lastRoomId = localStorage.getItem("lastRoomId");
    if (!lastRoomId) return;

    const room = rooms.find(
      (r) => r.id === lastRoomId || r.roomId === lastRoomId
    );

    if (room) {
      const normalized = {
        ...room,
        id: room.id ?? room.roomId,
        roomId: room.roomId ?? room.id,
      };

      setActiveChat({ room: normalized, contact: null });
      restoredRef.current = true;
    }
  }, [rooms]);

  // ===== SELECT CHAT =====
  const handleSelectContact = (chat) => {
    setActiveChat(chat);

    const roomId = chat.room?.id ?? chat.room?.roomId;
    if (roomId) {
      localStorage.setItem("lastRoomId", roomId); // save last room
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Topbar />
      <Sidebar onSelectContact={handleSelectContact} />
      <ChatMain room={activeChat.room} contact={activeChat.contact} />
    </div>
  );
};

export default ChatPage;