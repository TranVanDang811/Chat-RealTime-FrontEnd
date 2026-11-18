import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  PencilIcon,
  UserGroupIcon,
  XMarkIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  FaceSmileIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useToast } from "../components/common/ToastContext";

import {
  receiveMessage,
  setCurrentRoom,
  setSummary,
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
  updateRoomName,
  recallMessage,
} from "../features/chat/chatThunks";
import InviteMemberModal from "../modal/InviteMemberModal";
import GroupMembersModal from "../modal/GroupMembersModal";
import EmojiPicker from "../components/chat/EmojiPicker";
import { QUICK_EMOJIS } from "../components/chat/emojiData";

/* ================= Helpers ================= */

const isOnlyEmoji = (text) => {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  const emojiOnlyRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\s)+$/u;
  if (!emojiOnlyRegex.test(trimmed)) return false;

  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = [...segmenter.segment(trimmed)].filter(
      (s) => s.segment.trim().length > 0
    );
    return segments.length > 0 && segments.length <= 4;
  } catch {
    const chars = Array.from(trimmed.replace(/\s+/g, ""));
    return chars.length > 0 && chars.length <= 6;
  }
};

const formatTime = (time) => {
  const d = new Date(time);
  return isNaN(d)
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const isWithin24Hours = (time) => {
  if (!time) return false;
  const createdAt = new Date(time).getTime();
  if (isNaN(createdAt)) return false;
  const diffHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours < 24;
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

const Avatar = ({ src, name, online, size = 42 }) => (
  <div className="relative flex-shrink-0">
    <img
      src={
        src ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name || "User"
        )}&background=2563eb&color=fff&bold=true`
      }
      alt={name || "Avatar"}
      style={{ width: size, height: size }}
      className="rounded-2xl object-cover ring-2 ring-slate-700 shadow-xs"
    />
    {online !== undefined && (
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0b1120] shadow-xs ${
          online ? "bg-emerald-400" : "bg-slate-600"
        }`}
      />
    )}
  </div>
);

const MessageBubble = ({ msg, isMe, sender, onCopy, onRecall }) => {
  const [copied, setCopied] = useState(false);
  const isRecalled = Boolean(msg.isRecalled);
  const onlyEmoji = !isRecalled && isOnlyEmoji(msg.content);
  const canRecall = isMe && !msg.isTemp && !isRecalled && isWithin24Hours(msg.createdAt);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!msg.content || isRecalled) return;
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    onCopy?.(msg.content);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-2.5 my-1.5 ${isMe ? "justify-end" : "justify-start"} group relative`}>
      {!isMe && (
        <div className="flex-shrink-0 self-end mb-1">
          <Avatar
            src={sender?.avatar}
            name={sender?.fullName || "User"}
            size={32}
          />
        </div>
      )}

      <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && (sender?.nickname || sender?.fullName) && (
          <span className="text-[11px] font-semibold text-cyan-400 mb-1 px-1 flex items-center gap-1.5 flex-wrap">
            <span>{sender.nickname || sender.fullName}</span>
            {sender.nickname && (
              <span className="text-[10px] text-slate-400 font-normal">
                ({sender.fullName})
              </span>
            )}
          </span>
        )}

        <div className={`relative flex items-center ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          {isRecalled ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs italic text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl select-none">
              <ArrowUturnLeftIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Tin nhắn đã được thu hồi</span>
            </div>
          ) : (
            <div
              className={`break-words select-text transition-all duration-150 ${
                onlyEmoji
                  ? "text-3xl sm:text-4xl py-1 px-1 bg-transparent border-0 shadow-none hover:scale-110 leading-tight"
                  : isMe
                  ? "px-4 py-2.5 text-sm shadow-md leading-relaxed bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-2xl rounded-br-xs shadow-blue-950/60 hover:shadow-lg"
                  : "px-4 py-2.5 text-sm shadow-md leading-relaxed bg-[#0f172a] text-slate-100 border border-slate-700/80 rounded-2xl rounded-bl-xs shadow-xs hover:shadow-lg"
              } ${msg.isTemp ? "opacity-70 italic" : ""}`}
            >
              {msg.content}
            </div>
          )}

          {/* Micro-interaction: Floating Copy & Recall Buttons on Bubble Hover */}
          {!msg.isTemp && !isRecalled && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 transform scale-90 group-hover:scale-100 flex items-center gap-1 mx-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className={`p-1.5 rounded-lg border text-xs shadow-md transition-all active:scale-95 ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-[#0f172a]/95 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/80"
                }`}
                title={copied ? "Đã sao chép!" : "Sao chép tin nhắn"}
                aria-label="Sao chép tin nhắn"
              >
                {copied ? (
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                ) : (
                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                )}
              </button>

              {canRecall && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRecall?.(msg);
                  }}
                  className="p-1.5 rounded-lg border text-xs shadow-md transition-all active:scale-95 bg-[#0f172a]/95 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border-slate-700/80"
                  title="Thu hồi tin nhắn (trong vòng 24h)"
                  aria-label="Thu hồi tin nhắn"
                >
                  <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
          <span>{formatTime(msg.createdAt)}</span>
          {isMe && (
            <span className="text-cyan-300">
              {msg.isTemp ? "•••" : <CheckIcon className="w-3 h-3 stroke-[2.5]" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN ================= */

const getSenderId = (msg) => msg.senderId ?? msg.sender?.id;

const ChatMain = ({ room: propRoom, contact, onBack }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { messages, messagesLoading, error, rooms, currentRoom } = useSelector((s) => s.chat);
  const myInfo = useSelector((s) => s.user.myInfo);
  const { summary, summaryLoading } = useSelector((s) => s.chat);

  const room = useMemo(() => {
    const targetId = propRoom?.id ?? propRoom?.roomId;
    if (!targetId) return propRoom;
    return (
      rooms.find((r) => r.id === targetId || r.roomId === targetId) ||
      (currentRoom?.id === targetId || currentRoom?.roomId === targetId ? currentRoom : null) ||
      propRoom
    );
  }, [propRoom, rooms, currentRoom]);

  const [content, setContent] = useState("");
  const [page, setPage] = useState(0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recallingMessage, setRecallingMessage] = useState(null);
  const [isRecalling, setIsRecalling] = useState(false);

  // ── Dropdown & Modal state ────────────────────────────────────────────────
  const [showMembers, setShowMembers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const menuRef = useRef(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelectEmoji = (emoji) => {
    const input = inputRef.current;
    if (!input) {
      setContent((prev) => prev + emoji);
      return;
    }

    const start = input.selectionStart ?? content.length;
    const end = input.selectionEnd ?? content.length;
    const next = content.substring(0, start) + emoji + content.substring(end);
    setContent(next);

    requestAnimationFrame(() => {
      input.focus();
      const newPos = start + emoji.length;
      input.setSelectionRange(newPos, newPos);
    });
  };

  const getUser = (id) =>
    room?.members?.find((m) => String(m.id) === String(id)) || {};

  const isGroupOnline = (room, myId) =>
    room?.members?.some(
      (m) => String(m.id) !== String(myId) && m.status === "ONLINE"
    );

  const currentContact = useMemo(() => {
    if (!room?.members) return contact;
    return (
      room.members.find((m) => String(m.id) !== String(myInfo?.id)) || contact
    );
  }, [room?.members, myInfo?.id, contact]);

  /* ===== Close menu khi click ngoài hoặc bấm Escape ===== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* ===== LOAD + SUBSCRIBE ROOM ===== */
  const roomId = room?.id ?? room?.roomId;

  useEffect(() => {
    if (!roomId) return;

    setPage(0);
    dispatch(setCurrentRoom(room));
    dispatch(getMessages({ roomId, page: 0, size: 20 }));
    dispatch(markAsSeen(roomId));

    subscribeRoom(roomId, dispatch);
    subscribeSummary(dispatch);
    dispatch(setSummary(null));
    setIsSummaryCollapsed(false);

    inputRef.current?.focus();
  }, [roomId]);

  /* ===== SCROLL ===== */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===== SEND ===== */
  const handleSend = () => {
    const trimmed = content.trim();
    const currentRoomId = room?.id ?? room?.roomId;
    if (!trimmed || !currentRoomId) return;

    const tempId = String(Date.now());
    const payload = { roomId: currentRoomId, content: trimmed, type: "TEXT", tempId };

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
    setShowEmojiPicker(false);
    sendMessageWS(payload, dispatch);
  };

  /* ===== RENAME ===== */
  const handleRename = async () => {
    if (!newName.trim() || renaming) return;
    setRenaming(true);

    const res = await dispatch(
      updateRoomName({
        roomId: room?.id ?? room?.roomId,
        roomName: newName.trim(),
      })
    );

    setRenaming(false);
    if (updateRoomName.fulfilled.match(res)) {
      setShowRenameModal(false);
      toast.success("Đổi tên nhóm thành công!");
    } else {
      toast.error(res.payload || "Đổi tên nhóm thất bại");
    }
  };

  /* ===== RECALL MESSAGE ===== */
  const handleConfirmRecall = async () => {
    if (!recallingMessage || isRecalling) return;
    setIsRecalling(true);
    try {
      await dispatch(recallMessage(recallingMessage.id)).unwrap();
      toast.success("Đã thu hồi tin nhắn thành công!");
      setRecallingMessage(null);
    } catch (err) {
      toast.error(err || "Không thể thu hồi tin nhắn");
    } finally {
      setIsRecalling(false);
    }
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

  // ── EMPTY STATE ───────────────────────────────────────────────────────────
  if (!room || !roomId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#080d1a] p-8 text-center select-none text-slate-100 h-full">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-5 shadow-xl shadow-blue-950/80">
          <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Chào mừng đến với Realtime Chat SaaS
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
          Không gian làm việc Midnight Dark sang trọng, đồng bộ tin nhắn thời gian thực và hỗ
          trợ AI tóm tắt nội dung thông minh.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 max-w-lg w-full">
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-md text-left">
            <span className="text-base">🌌</span>
            <p className="text-xs font-semibold text-white mt-1">
              Midnight Blue Dark
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Giao diện tối chuẩn thương mại
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-md text-left">
            <span className="text-base">🧠</span>
            <p className="text-xs font-semibold text-white mt-1">
              AI Tóm tắt thông minh
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nắm bắt nội dung với 1 click
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-md text-left">
            <span className="text-base">⚡</span>
            <p className="text-xs font-semibold text-white mt-1">
              Realtime WebSocket
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Đồng bộ tin nhắn tức thì
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isGroup = room.type === "GROUP";
  const onlineStatus = isGroup
    ? isGroupOnline(room, myInfo?.id)
    : currentContact?.status === "ONLINE";

  /* ================= ACTIVE CHAT UI ================= */
  return (
    <div className="flex-1 flex flex-col bg-[#080d1a] h-full overflow-hidden text-slate-100">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-2.5 sm:py-3.5 bg-[#0b1120] border-b border-slate-800 shadow-md z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          {/* Responsive Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 flex-shrink-0"
              title="Quay lại danh sách"
              aria-label="Quay lại danh sách hội thoại"
            >
              <ArrowLeftIcon className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          {isGroup ? (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md shadow-blue-950/60 flex-shrink-0">
              {(room.roomName || "G")[0]?.toUpperCase()}
            </div>
          ) : (
            <Avatar
              src={currentContact?.avatar}
              name={currentContact?.fullName}
              online={onlineStatus}
              size={38}
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2
                className={`font-bold text-white text-sm sm:text-base leading-tight truncate ${
                  isGroup ? "cursor-pointer hover:text-cyan-400 transition" : ""
                }`}
                onClick={() => {
                  if (isGroup) {
                    setNewName(room.roomName || "");
                    setShowRenameModal(true);
                  }
                }}
              >
                {isGroup
                  ? room.roomName
                  : currentContact?.nickname || currentContact?.fullName}
              </h2>
              {isGroup && (
                <button
                  onClick={() => {
                    setNewName(room.roomName || "");
                    setShowRenameModal(true);
                  }}
                  className="text-slate-400 hover:text-cyan-400 transition flex-shrink-0"
                  title="Đổi tên nhóm"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              {onlineStatus && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-400/50 flex-shrink-0" />
              )}
              <span className="truncate">
                {isGroup
                  ? `${room.members?.length || 0} thành viên • ${
                      onlineStatus ? "Có người đang online" : "Tất cả offline"
                    }`
                  : onlineStatus
                  ? "Đang hoạt động"
                  : "Ngoại tuyến"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* AI Summarize Button */}
          <button
            onClick={() => {
              console.log("🧠 Bấm tóm tắt roomId:", roomId);
              summarizeWS(roomId, dispatch);
            }}
            disabled={summaryLoading}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs font-semibold hover:from-blue-500 hover:to-cyan-400 active:scale-95 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
            title="Tóm tắt nội dung cuộc trò chuyện bằng AI"
          >
            <SparklesIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />
            <span className="hidden sm:inline">AI Tóm tắt</span>
          </button>

          <button
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Gọi thoại (Tính năng SaaS mở rộng)"
          >
            <PhoneIcon className="w-5 h-5" />
          </button>

          <button
            className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Gọi video (Tính năng SaaS mở rộng)"
          >
            <VideoCameraIcon className="w-5 h-5" />
          </button>

          {/* More options dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              title="Tùy chọn khác"
              aria-label="Tùy chọn cuộc trò chuyện"
              aria-expanded={showMenu}
              aria-haspopup="menu"
              className={`p-2 rounded-xl transition ${
                showMenu
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                role="menu"
                aria-label="Tùy chọn phòng chat"
                className="absolute right-0 top-11 w-56 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-700/80 py-1.5 z-50 animate-dropdown origin-top-right"
              >
                {/* Mobile call options */}
                <div className="sm:hidden border-b border-slate-800/80 pb-1 mb-1">
                  <button
                    role="menuitem"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                  >
                    <PhoneIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    Gọi thoại
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                  >
                    <VideoCameraIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    Gọi video
                  </button>
                </div>
                {isGroup && (
                  <>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        setShowInvite(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                    >
                      <UserPlusIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      Mời thành viên mới
                    </button>

                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        setNewName(room.roomName || "");
                        setShowRenameModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                    >
                      <PencilIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      Đổi tên nhóm
                    </button>

                    <div className="mx-3 my-1 border-t border-slate-800" />
                  </>
                )}

                <button
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false);
                    setShowMembers(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                >
                  <UserGroupIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  Danh sách thành viên ({room?.members?.length || 0})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AI SUMMARY NOTIFICATION CARD (Positioned neatly under header) ──── */}
      {(summaryLoading || summary) && (
        <div
          role="region"
          aria-label="Bản tóm tắt cuộc trò chuyện bằng AI"
          className="mx-4 md:mx-6 mt-3 p-4 bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-blue-500/40 rounded-2xl text-sm shadow-xl shadow-blue-950/60 animate-slide-down"
        >
          {summaryLoading ? (
            <div className="flex items-center gap-3 text-cyan-300 py-1">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-xs font-semibold">
                AI đang phân tích và tổng hợp nội dung cuộc trò chuyện...
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs uppercase tracking-wider">
                  <SparklesIcon className="w-4 h-4 text-cyan-400" />
                  Bản tóm tắt cuộc trò chuyện (AI Assistant)
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => summarizeWS(roomId, dispatch, true)}
                    disabled={summaryLoading}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20 transition flex items-center gap-1 cursor-pointer"
                    title="Tạo lại bản tóm tắt mới nhất"
                  >
                    <ArrowPathIcon className="w-3 h-3" />
                    Tóm tắt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                    className="px-2 py-0.5 text-[10px] rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    {isSummaryCollapsed ? "Mở rộng" : "Thu gọn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(setSummary(null))}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Ẩn tóm tắt"
                    aria-label="Ẩn tóm tắt AI"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {!isSummaryCollapsed && (
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80 font-normal select-text">
                  {summary}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MESSAGES CONTAINER ───────────────────────────────────────────── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Lịch sử tin nhắn cuộc trò chuyện"
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-1"
      >
        {messages.length >= 20 && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                dispatch(getMessages({ roomId, page: nextPage, size: 20 }));
              }}
              disabled={messagesLoading}
              className="text-xs text-cyan-300 hover:text-white bg-slate-800/90 border border-slate-700 rounded-full px-4 py-1.5 shadow-md transition disabled:opacity-50 font-semibold"
            >
              {messagesLoading ? "Đang tải thêm..." : "Tải thêm tin nhắn cũ"}
            </button>
          </div>
        )}

        {messagesLoading && messages.length === 0 ? (
          <div className="space-y-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                {i % 2 === 0 && (
                  <div className="w-9 h-9 rounded-2xl skeleton-shimmer flex-shrink-0" />
                )}
                <div
                  className={`h-11 rounded-2xl skeleton-shimmer ${
                    i % 2 === 0 ? "w-48" : "w-60"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {error && (
              <p className="text-center text-xs text-rose-400 bg-rose-950/40 p-2 rounded-xl my-2 border border-rose-800/60">
                {error}
              </p>
            )}
            {groupedMessages.map((item, i) =>
              item.type === "date" ? (
                <div key={i} className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-semibold rounded-full shadow-md">
                    {item.label}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  key={String(item.id)}
                  msg={item}
                  isMe={String(getSenderId(item)) === String(myInfo?.id)}
                  sender={getUser(getSenderId(item))}
                  onCopy={() => toast.success("Đã sao chép tin nhắn vào clipboard")}
                  onRecall={(msg) => setRecallingMessage(msg)}
                />
              )
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* ── INPUT BAR ────────────────────────────────────────────────────── */}
      <div className="p-2 sm:p-3 bg-[#0b1120] border-t border-slate-800 shadow-xl relative">
        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-1 mb-2 px-1 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] text-slate-500 font-medium mr-1 hidden sm:inline select-none">
            Nhanh:
          </span>
          {QUICK_EMOJIS.map((emo) => (
            <button
              key={emo}
              type="button"
              onClick={() => handleSelectEmoji(emo)}
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-sm sm:text-base flex items-center justify-center border border-slate-800 hover:border-slate-700 hover:scale-120 active:scale-95 transition-all shadow-xs cursor-pointer select-none"
              title={`Chèn ${emo}`}
              aria-label={`Chèn ${emo}`}
            >
              {emo}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`text-[11px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ml-1 flex-shrink-0 cursor-pointer ${
              showEmojiPicker
                ? "bg-blue-600/30 text-cyan-300 border-blue-500/50 shadow-xs"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800"
            }`}
            title="Mở bảng chọn emoji đầy đủ"
            aria-label="Mở bảng chọn emoji đầy đủ"
          >
            <FaceSmileIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium hidden sm:inline">Tất cả emoji</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 rounded-2xl p-1.5 pl-2 sm:pl-3 border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition relative"
        >
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-slate-400 flex-shrink-0">
            <button
              type="button"
              className="p-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title="Đính kèm tệp tin (Sắp ra mắt)"
              aria-label="Đính kèm tệp"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`p-1.5 rounded-lg transition active:scale-95 cursor-pointer ${
                  showEmojiPicker
                    ? "text-cyan-400 bg-slate-800 ring-1 ring-blue-500/40 shadow-xs"
                    : "hover:text-cyan-400 hover:bg-slate-800 text-slate-400"
                }`}
                title="Bảng chọn biểu tượng cảm xúc"
                aria-label="Chọn biểu tượng cảm xúc"
                aria-expanded={showEmojiPicker}
              >
                <FaceSmileIcon className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={handleSelectEmoji}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>
          </div>

          <label htmlFor="message-composer-input" className="sr-only">
            Nhập nội dung tin nhắn
          </label>
          <input
            id="message-composer-input"
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung tin nhắn..."
            className="flex-1 min-w-0 bg-transparent outline-none text-xs sm:text-sm text-white placeholder-slate-500 py-1"
          />

          <button
            type="submit"
            disabled={!content.trim()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center hover:from-blue-500 hover:to-cyan-400 active:scale-95 shadow-lg shadow-blue-600/30 transition disabled:opacity-30 disabled:shadow-none disabled:active:scale-100 flex-shrink-0 cursor-pointer"
            title="Gửi tin nhắn"
            aria-label="Gửi tin nhắn"
          >
            <PaperAirplaneIcon className="w-4 h-4 -rotate-45 -mr-0.5" />
          </button>
        </form>
      </div>

      {/* ── RENAME MODAL ─────────────────────────────────────────────────── */}
      {showRenameModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-modal-title"
          className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !renaming) setShowRenameModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !renaming) setShowRenameModal(false);
          }}
        >
          <div
            className="bg-[#0f172a] p-5 sm:p-6 rounded-2xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700/80 text-white animate-modal-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 id="rename-modal-title" className="font-bold text-white text-base">
                Đổi tên nhóm chat
              </h2>
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                disabled={renaming}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
                aria-label="Đóng"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tên mới sẽ cập nhật trực tiếp cho tất cả thành viên trong nhóm
            </p>

            <label htmlFor="rename-group-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên nhóm mới <span className="text-rose-400">*</span>
            </label>
            <input
              id="rename-group-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !renaming) handleRename();
                if (e.key === "Escape" && !renaming) setShowRenameModal(false);
              }}
              placeholder="Nhập tên nhóm mới..."
              disabled={renaming}
              className="w-full bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs rounded-xl mb-4 text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
              autoFocus
            />

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                disabled={renaming}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl active:scale-98 transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRename}
                disabled={!newName.trim() || renaming}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 shadow-md shadow-blue-600/30 active:scale-98 transition flex items-center gap-1.5"
              >
                {renaming ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thay đổi</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECALL CONFIRMATION MODAL ────────────────────────────────────── */}
      {recallingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ArrowUturnLeftIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Thu hồi tin nhắn</h3>
                <p className="text-xs text-slate-400">Chỉ có thể thu hồi trong vòng 24 giờ</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <p className="text-xs text-slate-300 italic break-words line-clamp-3">
                "{recallingMessage.content}"
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tin nhắn này sẽ được thu hồi với tất cả thành viên trong cuộc trò chuyện. Bạn có chắc chắn muốn thu hồi không?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setRecallingMessage(null)}
                disabled={isRecalling}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRecall}
                disabled={isRecalling}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRecalling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang thu hồi...</span>
                  </>
                ) : (
                  <span>Thu hồi tin nhắn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVITE MODAL ─────────────────────────────────────────────────── */}
      <InviteMemberModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        room={room}
      />

      {/* ── GROUP MEMBERS MODAL ──────────────────────────────────────────── */}
      <GroupMembersModal
        open={showMembers}
        onClose={() => setShowMembers(false)}
        room={room}
      />
    </div>
  );
};

export default ChatMain;
