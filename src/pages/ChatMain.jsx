import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

import {
  receiveMessage,
  setCurrentRoom,
  removeTempMessage,
  clearMessages,
  setSummary,
  setSummaryLoading,
} from "../features/chat/chatSlice";

import {
  subscribeRoom,
  sendMessageWS,
  subscribeSummary,
  summarizeWS,
} from "../features/chat/chatWebSocket";

import {
  getMessages,
  markAsSeen,
  sendMessage,
  updateRoomName,
} from "../features/chat/chatThunks";
import InviteMemberModal from "../modal/InviteMemberModal";
import GroupMembersModal from "../modal/GroupMembersModal";



/* ================= Helpers ================= */

const formatTime = (time) => {
  const d = new Date(time);
  return isNaN(d)
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const groupByDate = (messages) => {
  const result = [];
  let last = null;

  messages.forEach((m) => {
    const d = new Date(m.createdAt);
    const label = isNaN(d)
      ? null
      : d.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

    if (label && label !== last) {
      result.push({ type: "date", label });
      last = label;
    }

    result.push({ type: "message", ...m });
  });

  return result;
};

/* ================= UI Components ================= */

const Avatar = ({ src, name, online, size = 40 }) => (
  <div className="relative flex-shrink-0">
    <img
      src={
        src ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}`
      }
      alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover ring-2 ring-white"
    />
    {online !== undefined && (
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
          online ? "bg-emerald-400" : "bg-gray-300"
        }`}
      />
    )}
  </div>
);

const MessageBubble = ({ msg, isMe, contact }) => (
  <div className={`flex  gap-2 ${isMe ? "justify-end" : ""}`}>
    {!isMe && (
      <Avatar src={contact?.avatar} name={contact?.fullName || "User"} size={32} />
    )}

    <div className="max-w-[65%]">
         {!isMe && (
        <div className="text-[12px] text-gray-500 font-medium mb-1">
          {contact?.fullName || "User"}
        </div>
      )}
      <div
        className={`px-4 py-2 rounded-2xl text-sm shadow ${
          isMe
            ? "bg-indigo-500 text-white"
            : "bg-white border text-gray-800"
        } ${msg.isTemp ? "opacity-60" : ""}`}
      >
        {msg.content}
      </div>

      <div className="text-[10px] text-gray-400 mt-1 flex gap-1">
        {formatTime(msg.createdAt)}
        {isMe && <span>{msg.isTemp ? "◷" : "✓"}</span>}
      </div>
    </div>
  </div>
);

/* ================= MAIN ================= */

const getSenderId = (msg) => msg.senderId ?? msg.sender?.id;

const ChatMain = ({ room, contact }) => {
  const dispatch = useDispatch();


  const { messages, messagesLoading, error } = useSelector((s) => s.chat);
  const myInfo = useSelector((s) => s.user.myInfo);
  const { summary, summaryLoading } = useSelector((s) => s.chat);

  const [content, setContent] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);

  // ── Dropdown state ──────────────────────────────────────────────────────────
  const [showMembers, setShowMembers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const menuRef = useRef(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  const getUser = (id) =>
    room?.members?.find((m) => String(m.id) === String(id)) || {};

  const isGroupOnline = (room, myId) =>
    room?.members?.some(
      (m) => String(m.id) !== String(myId) && m.status === "ONLINE"
    );

  const currentContact = useMemo(() => {
    if (!room?.members) return contact;
    return room.members.find((m) => String(m.id) !== String(myInfo?.id)) || contact;
  }, [room?.members, myInfo?.id, contact]);

  
  /* ===== Close menu khi click ngoài ===== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===== LOAD + SUBSCRIBE ROOM ===== */
  const roomId = room?.id ?? room?.roomId;

  useEffect(() => {
    if (!roomId) return;

    dispatch(setCurrentRoom(room));
    dispatch(getMessages({ roomId }));
    dispatch(markAsSeen(roomId));

    subscribeRoom(roomId, dispatch);
    subscribeSummary(dispatch);
    dispatch(setSummary(null));

    inputRef.current?.focus();  
  }, [roomId]);

  /* ===== SCROLL ===== */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===== SEND ===== */
  const handleSend = () => {
    const trimmed = content.trim();
    const roomId = room?.id ?? room?.roomId;
    if (!trimmed || !roomId) return;

    const tempId = String(Date.now());
    const payload = { roomId, content: trimmed, type: "TEXT", tempId };

    dispatch(
      receiveMessage({
        id: tempId,
        tempId,
        content: trimmed,
        createdAt: new Date().toISOString(),
        senderId: myInfo?.id,
        isMine: true,
        isTemp: true,
      })
    );

    setContent("");
    sendMessageWS(payload, dispatch);
  };

  /* ===== RENAME ===== */
  const handleRename = async () => {
    if (!newName.trim() || renaming) return;
    setRenaming(true);

    const res = await dispatch(
      updateRoomName({ roomId: room?.id ?? room?.roomId, roomName: newName.trim() })
    );

    setRenaming(false);
    if (updateRoomName.fulfilled.match(res)) setShowRenameModal(false);
  };

  /* ===== GROUP MESSAGE ===== */
  const groupedMessages = useMemo(() => {
    const seen = new Set();
    const unique = messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    return groupByDate(unique);
  }, [messages]);

  if (!room || !roomId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Chọn cuộc trò chuyện
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="flex-1 flex flex-col bg-gray-50">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <Avatar
            src={room.type === "GROUP" ? null : currentContact?.avatar}
            name={room.type === "GROUP" ? room.roomName : currentContact?.fullName}
            online={
              room.type === "GROUP"
                ? isGroupOnline(room, myInfo?.id)
                : currentContact?.status === "ONLINE"
            }
          />

          <div>
            <div
              className={`font-semibold ${
                room.type === "GROUP" ? "cursor-pointer hover:underline" : ""
              }`}
              onClick={() => {
                if (room.type === "GROUP") {
                  setNewName(room.roomName || "");
                  setShowRenameModal(true);
                }
              }}
            >
              {room.type === "GROUP" ? room.roomName : currentContact?.fullName}
            </div>

            <div className="text-xs text-gray-400">
              {room.type === "GROUP"
                ? isGroupOnline(room, myInfo?.id)
                  ? "Đang hoạt động"
                  : "Không ai hoạt động"
                : currentContact?.status === "ONLINE"
                ? "Đang hoạt động"
                : "Ngoại tuyến"}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-1">
<button
  onClick={() => {
    console.log("🧠 Bấm tóm tắt roomId:", roomId);
    summarizeWS(roomId, dispatch);
  }}
  className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition"
>
  🧠 Tóm tắt
</button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <PhoneIcon className="w-5 h-5 text-gray-500" />
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <VideoCameraIcon className="w-5 h-5 text-gray-500" />
          </button>

          {/* ── Dropdown menu ── */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className={`p-2 rounded-lg transition ${
                showMenu ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">

                {/* Thêm thành viên — chỉ hiện với GROUP */}
                {room.type === "GROUP" && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowInvite(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                      hover:bg-gray-50 transition text-left"
                  >
                    <UserPlusIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    Thêm thành viên
                  </button>
                )}

                {/* Đổi tên nhóm — chỉ hiện với GROUP */}
                {room.type === "GROUP" && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setNewName(room.roomName || "");
                      setShowRenameModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                      hover:bg-gray-50 transition text-left"
                  >
                    <PencilIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    Đổi tên nhóm
                  </button>
                )}

                {/* Divider nếu có cả 2 group action */}
                {room.type === "GROUP" && (
                  <div className="mx-3 my-1 border-t border-gray-100" />
                )}

                <button
                    onClick={() => {
    setShowMenu(false);
    setShowMembers(true);
  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                    hover:bg-gray-50 transition text-left"
                >
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  Danh sách thành viên
                </button>

                {/* Xem thông tin — hiện với tất cả */}
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                    hover:bg-gray-50 transition text-left"
                >
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  Xem thông tin
                </button>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messagesLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-9 w-40 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
            {groupedMessages.map((item, i) =>
              item.type === "date" ? (
                <div key={i} className="text-center text-xs text-gray-400">
                  {item.label}
                </div>
              ) : (
                <MessageBubble
                  key={String(item.id)}
                  msg={item}
                  isMe={String(getSenderId(item)) === String(myInfo?.id)}
                  contact={getUser(getSenderId(item))}
                />
              )
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2 p-3 bg-white border-t">
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full disabled:opacity-40 transition"
        >
          Gửi
        </button>
      </div>

      {/* RENAME MODAL */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl w-[350px] shadow-xl">
            <h2 className="font-semibold mb-3">Đổi tên nhóm</h2>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="w-full border px-3 py-2 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRename}
                disabled={!newName.trim() || renaming}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition"
              >
                {renaming ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

{/* SUMMARY SECTION */}
{(summaryLoading || summary) && (
  <div className="mx-4 mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm">
    {summaryLoading ? (
      <div className="flex items-center gap-3 text-yellow-600">
        <span>🧠</span>
        <p>AI đang tóm tắt cuộc trò chuyện...</p>
      </div>
    ) : (
      <>
        <div className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
          📌 Tóm tắt cuộc trò chuyện
        </div>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {summary}
        </div>
        
        <button
          onClick={() => dispatch(setSummary(null))}
          className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline transition"
        >
          Ẩn tóm tắt
        </button>
      </>
    )}
  </div>
)}

      {/* INVITE MODAL */}
      <InviteMemberModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        room={room}
      />

      <GroupMembersModal
  open={showMembers}
  onClose={() => setShowMembers(false)}
  room={room}
/>
    </div>
  );
};

export default ChatMain;