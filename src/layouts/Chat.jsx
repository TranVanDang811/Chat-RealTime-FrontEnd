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
  const { rooms, currentRoom } = useSelector((s) => s.chat);

  const [activeChat, setActiveChat] = useState({ room: null, contact: null });
  const restoredRef = useRef(false);

  // Sync activeChat.room when rooms or currentRoom in Redux updates
  useEffect(() => {
    if (!activeChat.room) return;
    const currentId = activeChat.room.id ?? activeChat.room.roomId;
    if (!currentId) return;

    const freshRoom =
      rooms.find((r) => r.id === currentId || r.roomId === currentId) ||
      (currentRoom?.id === currentId || currentRoom?.roomId === currentId
        ? currentRoom
        : null);

    if (freshRoom && JSON.stringify(freshRoom.members) !== JSON.stringify(activeChat.room.members)) {
      setActiveChat((prev) => ({
        ...prev,
        room: {
          ...freshRoom,
          id: freshRoom.id ?? freshRoom.roomId,
          roomId: freshRoom.roomId ?? freshRoom.id,
        },
      }));
    }
  }, [rooms, currentRoom, activeChat.room]);

  // ===== STEP 1: LOAD USER =====
  useEffect(() => {
    dispatch(getMyInfo());
  }, []);

  // ===== STEP 2: CONNECT WS + LOAD ROOMS =====
  useEffect(() => {
    if (!myInfo?.id) return;

    connectSocket(dispatch, myInfo.id);
    dispatch(getRooms());

    return () => disconnectSocket();
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
      localStorage.setItem("lastRoomId", roomId);
    }
  };

  const handleBackToSidebar = () => {
    setActiveChat({ room: null, contact: null });
  };

  return (
    <div className="h-full w-full flex bg-[#080d1a] text-slate-100 antialiased overflow-hidden select-none">
      {/* 1. Left Navigation Rail (Hidden on mobile when chat is open to maximize space) */}
      <div
        className={`${
          activeChat.room ? "hidden md:flex" : "flex"
        } flex-shrink-0 h-full`}
      >
        <Topbar onOpenProfile={() => {}} />
      </div>

      {/* 2. Conversations Sidebar (Takes remaining width on mobile, fixed width on tablet/desktop) */}
      <div
        className={`h-full ${
          activeChat.room
            ? "hidden md:flex md:w-80 lg:w-88 md:flex-shrink-0 flex-col"
            : "flex-1 min-w-0 md:flex-none md:w-80 lg:w-88 flex flex-col"
        }`}
      >
        <Sidebar onSelectContact={handleSelectContact} />
      </div>

      {/* 3. Main Chat Viewport (Full width on mobile, responsive flex column on desktop) */}
      <div
        className={`flex-1 h-full min-w-0 ${
          !activeChat.room ? "hidden md:flex flex-col" : "flex flex-col w-full"
        }`}
      >
        <ChatMain
          room={activeChat.room}
          contact={activeChat.contact}
          onBack={handleBackToSidebar}
        />
      </div>
    </div>
  );
};

export default ChatPage;
