import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  PhoneIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { resetUnread, setCurrentRoom } from "../features/chat/chatSlice";
import {
  createPrivateRoom,
  createGroupRoom,
  getRooms,
} from "../features/chat/chatThunks";
import {
  getFriends,
  getIncoming,
  getOutgoing,
  acceptFriend,
  rejectFriend,
  findUserByPhone,
  sendFriendRequest,
} from "../features/friend/friendThunks";
import { clearSearchUser } from "../features/friend/friendSlice";
import { useToast } from "../components/common/ToastContext";

// ─── Timestamp Formatting Helper ──────────────────────────────────────────────
const formatConversationTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Hôm qua";

  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

// ─── CreateGroupModal (SaaS Dashboard Style) ───────────────────────────────────
const CreateGroupModal = ({ open, onClose, onCreated }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { friends } = useSelector((s) => s.friend);
  const { roomsLoading } = useSelector((s) => s.chat);

  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setGroupName("");
      setSearch("");
      setSelectedIds([]);
      setError("");
    }
  }, [open]);

  // ESC key support
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !roomsLoading) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, roomsLoading]);

  if (!open) return null;

  const friendList = friends
    .map((f) => f.user)
    .filter((u) => u?.fullName?.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError("Vui lòng nhập tên nhóm chat.");
      return;
    }
    if (selectedIds.length < 2) {
      setError("Vui lòng chọn ít nhất 2 thành viên để tạo nhóm.");
      return;
    }

    const result = await dispatch(
      createGroupRoom({ name: groupName.trim(), memberIds: selectedIds })
    );

    if (createGroupRoom.fulfilled.match(result)) {
      const newRoom = result.payload;
      dispatch(setCurrentRoom(newRoom));
      dispatch(getRooms());
      onCreated?.({ room: newRoom });
      toast.success("Đã tạo nhóm chat mới!");
      onClose();
    } else {
      setError(result.payload || "Tạo nhóm thất bại.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl shadow-blue-950/80 w-full max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden border border-slate-700/80 text-white animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-cyan-400 flex items-center justify-center border border-blue-500/30">
              <UserGroupIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 id="create-group-modal-title" className="font-semibold text-white text-sm leading-tight">
                Tạo nhóm mới
              </h2>
              <p className="text-[11px] text-slate-400">Chọn thành viên từ danh sách bạn bè</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ tạo nhóm"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Group name input */}
          <div className="px-5 pt-4 pb-2">
            <label htmlFor="create-group-name-input" className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Tên nhóm <span className="text-cyan-400">*</span>
            </label>
            <input
              id="create-group-name-input"
              type="text"
              placeholder="VD: Dự án SaaS, Team Frontend..."
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setError("");
              }}
              className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              autoFocus
            />
          </div>

          {/* Selected chips */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 py-2">
              {selectedIds.map((id) => {
                const u = friends.find((f) => f.user?.id === id)?.user;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 bg-blue-500/15 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-500/30 shadow-2xs"
                  >
                    {u?.fullName}
                    <button
                      onClick={() => toggle(id)}
                      aria-label={`Bỏ chọn ${u?.fullName}`}
                      className="hover:text-white transition"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Search friends input */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-800">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              aria-label="Tìm kiếm thành viên trong danh sách bạn bè"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 text-xs outline-none bg-transparent placeholder-slate-500 text-white"
            />
            <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">
              Đã chọn: <strong className="text-cyan-300">{selectedIds.length}</strong>
            </span>
          </div>

          {/* Friend list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 px-3 pb-3">
            {friendList.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-8">
                {friends.length === 0
                  ? "Bạn chưa có bạn bè nào để tạo nhóm."
                  : "Không tìm thấy bạn bè phù hợp."}
              </p>
            )}
            {friendList.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => toggle(user.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(user.id);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                    isSelected
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800/50 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.fullName
                          )}&background=2563eb&color=fff&bold=true`
                        }
                        alt={user.fullName}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700"
                      />
                      {user.status === "ONLINE" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-600"
                    }`}
                  >
                    {isSelected && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2">
          {error && (
            <p className="text-xs text-rose-400 font-medium">
              {error}
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={
                roomsLoading || !groupName.trim() || selectedIds.length < 2
              }
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold active:scale-98 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {roomsLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                `Tạo nhóm${
                  selectedIds.length >= 2 ? ` (${selectedIds.length + 1})` : ""
                }`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PeopleTab — Tìm kiếm qua số điện thoại ──────────────────────────────────
const PeopleTab = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const myInfo = useSelector((s) => s.user.myInfo);
  const { searchUser, friends, outgoing, loading } = useSelector(
    (s) => s.friend
  );

  const [phone, setPhone] = useState("");
  const [sentIds, setSentIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => dispatch(clearSearchUser());
  }, [dispatch]);

  const handleSearch = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }
    setError("");
    dispatch(clearSearchUser());
    const result = await dispatch(findUserByPhone(trimmed));
    if (findUserByPhone.rejected.match(result)) {
      setError(result.payload || "Không tìm thấy người dùng.");
    }
  };

  const handleSend = async (receiverId) => {
    const result = await dispatch(sendFriendRequest(receiverId));
    if (sendFriendRequest.fulfilled.match(result)) {
      setSentIds((prev) => [...prev, receiverId]);
      toast.success("Đã gửi lời mời kết bạn!");
    } else {
      setError(result.payload || "Gửi lời mời thất bại.");
      toast.error(result.payload || "Gửi lời mời thất bại.");
    }
  };

  const getRelationStatus = (userId) => {
    if (!userId || userId === myInfo?.id) return "self";
    if (friends.some((f) => f.user?.id === userId)) return "friend";
    if (outgoing.some((r) => r.user?.id === userId)) return "pending";
    if (sentIds.includes(userId)) return "pending";
    return "none";
  };

  const status = searchUser ? getRelationStatus(searchUser.id) : null;

  return (
    <div className="flex flex-col h-full bg-[#0b1120]">
      {/* Search Input Box */}
      <div className="p-3">
        <div className="flex items-center gap-2 border border-slate-700/80 rounded-xl px-3 py-2 bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition shadow-inner">
          <PhoneIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="tel"
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 min-w-0 text-xs outline-none bg-transparent placeholder-slate-500 text-white"
          />
          {phone && (
            <button
              onClick={() => {
                setPhone("");
                setError("");
                dispatch(clearSearchUser());
              }}
              className="text-slate-400 hover:text-white transition"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !phone.trim()}
          className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold active:scale-98 shadow-sm transition disabled:opacity-40"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            "Tìm kiếm người dùng"
          )}
        </button>

        {error && (
          <p className="text-[11px] text-rose-400 mt-2 text-center bg-rose-950/40 py-1.5 px-2 rounded-lg border border-rose-800/60 font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Search Result */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {searchUser && (
          <div className="mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kết quả tìm kiếm
            </p>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md">
              <div className="relative flex-shrink-0">
                <img
                  src={
                    searchUser.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      searchUser.fullName
                    )}&background=2563eb&color=fff&bold=true`
                  }
                  alt={searchUser.fullName}
                  className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700"
                />
                {searchUser.status === "ONLINE" && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {searchUser.fullName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {searchUser.phoneNumber || searchUser.phone || phone}
                </p>
              </div>

              {/* Action Buttons */}
              {status === "self" && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md flex-shrink-0">
                  Bạn
                </span>
              )}
              {status === "friend" && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-blue-500/15 font-semibold px-2 py-0.5 rounded-md border border-blue-500/30 flex-shrink-0">
                  <CheckIcon className="w-3 h-3" />
                  Bạn bè
                </span>
              )}
              {status === "pending" && (
                <span className="text-[10px] font-medium text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 flex-shrink-0">
                  Đã gửi
                </span>
              )}
              {status === "none" && (
                <button
                  onClick={() => handleSend(searchUser.id)}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold active:scale-95 shadow-xs transition disabled:opacity-40 flex-shrink-0"
                >
                  <UserPlusIcon className="w-3 h-3" />
                  Kết bạn
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!searchUser && !error && (
          <div className="flex flex-col items-center justify-center h-44 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 mb-2.5 border border-slate-800">
              <PhoneIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-white">
              Tìm kiếm bạn bè qua số điện thoại
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Nhập số điện thoại để gửi lời mời kết bạn tức thì
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "chats", label: "Đoạn chat", icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> },
  { id: "groups", label: "Nhóm", icon: <UserGroupIcon className="w-4 h-4" /> },
  { id: "contacts", label: "Bạn bè", icon: <UserIcon className="w-4 h-4" /> },
  { id: "people", label: "Tìm kiếm", icon: <UserPlusIcon className="w-4 h-4" /> },
];

// ─── SIDEBAR (SaaS Dashboard Navigation) ───────────────────────────────────────
const Sidebar = ({ onSelectContact }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingFor, setCreatingFor] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const { friends, incoming, outgoing } = useSelector((s) => s.friend);
  const { rooms, currentRoom, roomsLoading } = useSelector((s) => s.chat);
  const { loading: userLoading } = useSelector((s) => s.user);
  const myInfo = useSelector((s) => s.user.myInfo);
  const isLoading = roomsLoading || userLoading;

  useEffect(() => {
    if (myInfo?.id) {
      dispatch(getRooms());
      dispatch(getFriends());
      dispatch(getIncoming());
      dispatch(getOutgoing());
    }
  }, [dispatch, myInfo?.id]);

  const filteredFriends = friends.filter((f) =>
    f.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomDisplayName = (room) => {
    if (room.type === "GROUP") return room.roomName || "Nhóm chat";
    const other = room.members?.find((m) => m.id !== myInfo?.id);
    return other?.nickname || other?.fullName || "Người dùng";
  };

  const handleSelectRoom = (room) => {
    const roomId = room?.id ?? room?.roomId;
    dispatch(setCurrentRoom(room));
    dispatch(resetUnread(roomId));
    if (!myInfo?.id) return;
    const contact = room.members?.find((m) => m.id !== myInfo.id);
    onSelectContact?.({ room, contact });
  };

  const handleSelectUser = async (user) => {
    const existing = rooms.find(
      (r) =>
        r.type === "PRIVATE" &&
        r.members?.length === 2 &&
        r.members.some((m) => m.id === user.id) &&
        r.members.some((m) => m.id === myInfo?.id)
    );
    if (existing) {
      dispatch(setCurrentRoom(existing));
      dispatch(resetUnread(existing?.id ?? existing?.roomId));
      onSelectContact?.({ room: existing, contact: user });
      setActiveTab("chats");
      return;
    }

    setCreatingFor(user.id);
    const result = await dispatch(createPrivateRoom(user.id));
    setCreatingFor(null);

    if (createPrivateRoom.fulfilled.match(result)) {
      const newRoom = result.payload;
      dispatch(setCurrentRoom(newRoom));
      dispatch(getRooms());
      onSelectContact?.({ room: newRoom, contact: user });
      setActiveTab("chats");
    }
  };

  const handleAcceptFriend = async (reqId) => {
    const result = await dispatch(acceptFriend(reqId));
    if (acceptFriend.fulfilled.match(result)) {
      dispatch(getRooms());
      toast.success("Đã chấp nhận lời mời kết bạn!");
    } else {
      toast.error(result.payload || "Chấp nhận lời mời thất bại");
    }
  };

  const sortByLatest = (a, b) =>
    new Date(b.lastMessageAt || b.updatedAt || 0) -
    new Date(a.lastMessageAt || a.updatedAt || 0);

  const privateRooms = rooms
    .filter((r) => {
      if (!searchQuery) return true;
      return getRoomDisplayName(r)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .sort(sortByLatest);

  const groupRooms = rooms
    .filter((r) => {
      if (r.type !== "GROUP") return false;
      if (!searchQuery) return true;
      return (r.roomName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .sort(sortByLatest);

  // ── Room card (Professional SaaS Layout) ────────────────────────────────────
  const RoomCard = ({ room, isGroup }) => {
    const isActive =
      (currentRoom?.id ?? currentRoom?.roomId) ===
      (room?.id ?? room?.roomId);

    const other = room.members?.find((m) => m.id !== myInfo?.id);
    const timeFormatted = formatConversationTime(room.lastMessageAt || room.updatedAt);

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleSelectRoom(room)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelectRoom(room);
          }
        }}
        aria-label={`Cuộc trò chuyện với ${getRoomDisplayName(room)}${
          room.unreadCount > 0 ? `, ${room.unreadCount} tin nhắn chưa đọc` : ""
        }`}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
          isActive
            ? "bg-slate-800/90 text-white border-l-2 border-blue-500 pl-2 shadow-xs"
            : "hover:bg-slate-800/40 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Avatar with Status */}
          <div className="relative flex-shrink-0">
            {isGroup ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {(room.roomName || "G")[0]?.toUpperCase()}
              </div>
            ) : (
              <img
                src={
                  other?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    other?.fullName || "User"
                  )}&background=2563eb&color=fff&bold=true`
                }
                alt={other?.fullName || "Avatar"}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shadow-xs"
              />
            )}
            {!isGroup && other?.status === "ONLINE" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0b1120] rounded-full shadow-xs" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p
                className={`font-semibold text-xs truncate ${
                  isActive ? "text-cyan-300" : "text-slate-100"
                }`}
              >
                {getRoomDisplayName(room)}
              </p>
              {timeFormatted && (
                <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-1">
                  {timeFormatted}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-normal">
              {isGroup
                ? `${room.members?.length || 0} thành viên`
                : room.lastMessage || "Bắt đầu cuộc trò chuyện..."}
            </p>
          </div>
        </div>

        {/* Unread Badge */}
        {room.unreadCount > 0 && (
          <span className="ml-2 min-w-[18px] h-4.5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1.5 shadow-sm shadow-blue-500/30">
            {room.unreadCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full bg-[#0b1120] border-r border-slate-800 flex flex-col overflow-hidden select-none text-slate-200">
        {/* ── SaaS Workspace Title & Quick Actions ────────────────────────── */}
        <div className="px-3.5 pt-3.5 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h1 className="text-sm font-bold text-white tracking-tight uppercase">
                Hội thoại
              </h1>
            </div>
            {activeTab === "groups" && (
              <button
                onClick={() => setShowGroupModal(true)}
                className="p-1 rounded-lg bg-blue-500/15 text-cyan-300 hover:bg-blue-500/25 transition border border-blue-500/30"
                title="Tạo nhóm mới"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* ── Segmented Control Dashboard Tabs ──────────────────────────── */}
          <div className="bg-[#060b14] p-1 rounded-xl flex items-center justify-between gap-1 border border-slate-800/80 shadow-inner">
            {TABS.map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery("");
                  }}
                  title={tab.label}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
                    isCurrent
                      ? "bg-slate-800 text-white border border-slate-700/60 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="relative">
                    {tab.icon}
                    {tab.id === "contacts" && incoming.length > 0 && (
                      <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 shadow-sm">
                        {incoming.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:inline text-[11px] truncate max-w-[55px]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Global Search Bar ───────────────────────────────────────────── */}
        {activeTab !== "people" && (
          <div className="px-3.5 py-2 border-b border-slate-800/80">
            <div className="flex items-center bg-[#070b14] rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border border-slate-800 shadow-inner transition">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={
                  activeTab === "contacts"
                    ? "Tìm kiếm bạn bè..."
                    : "Tìm cuộc trò chuyện..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 ml-2 text-xs outline-none bg-transparent placeholder-slate-500 text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: People ─────────────────────────────────────────────────── */}
        {activeTab === "people" && <PeopleTab />}

        {/* ── Content List ────────────────────────────────────────────────── */}
        {activeTab !== "people" && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-2 px-2 pt-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60"
                  >
                    <div className="w-10 h-10 rounded-xl skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 skeleton-shimmer rounded w-2/3" />
                      <div className="h-2.5 skeleton-shimmer rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Chats */}
            {activeTab === "chats" && !isLoading && (
              <>
                <div className="px-2 pt-1 pb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Tất cả đoạn chat ({privateRooms.length})
                  </span>
                </div>
                {privateRooms.map((room) => (
                  <RoomCard
                    key={room.id ?? room.roomId}
                    room={room}
                    isGroup={room.type === "GROUP"}
                  />
                ))}
                {privateRooms.length === 0 && (
                  <div className="text-center text-xs text-slate-500 pt-16 px-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">
                      Chưa có cuộc trò chuyện nào
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Vào tab Bạn bè hoặc Tìm kiếm để bắt đầu chat
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Tab: Groups */}
            {activeTab === "groups" && !isLoading && (
              <>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl mb-1.5 border border-dashed border-slate-700 bg-slate-900/40 text-cyan-400 hover:bg-slate-800/80 hover:border-blue-500 transition text-xs font-medium"
                >
                  <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  Tạo nhóm trò chuyện mới
                </button>
                <div className="px-2 pt-1 pb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Nhóm đã tham gia ({groupRooms.length})
                  </span>
                </div>
                {groupRooms.map((room) => (
                  <RoomCard key={room.id} room={room} isGroup={true} />
                ))}
                {groupRooms.length === 0 && (
                  <div className="text-center text-xs text-slate-500 pt-10 px-4">
                    <UserGroupIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">Chưa có nhóm nào</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tạo nhóm để trao đổi công việc và học tập
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Tab: Friends */}
            {activeTab === "contacts" && !isLoading && (
              <>
                {/* Incoming Requests */}
                {incoming.length > 0 && (
                  <div className="mb-2 px-1">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Lời mời kết bạn
                      </span>
                      <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {incoming.length}
                      </span>
                    </div>
                    {incoming.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700/80 mb-1"
                      >
                        <img
                          src={
                            req.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              req.user?.fullName || "User"
                            )}&background=2563eb&color=fff&bold=true`
                          }
                          alt={req.user?.fullName}
                          className="w-8 h-8 rounded-lg flex-shrink-0 object-cover ring-1 ring-slate-700"
                        />
                        <span className="text-xs font-semibold text-white flex-1 min-w-0 truncate">
                          {req.user?.fullName}
                        </span>
                        <button
                          onClick={() => handleAcceptFriend(req.id)}
                          className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition flex-shrink-0"
                          title="Đồng ý"
                        >
                          <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={async () => {
                            await dispatch(rejectFriend(req.id));
                            toast.info("Đã từ chối lời mời kết bạn.");
                          }}
                          className="p-1 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 transition flex-shrink-0"
                          title="Từ chối"
                        >
                          <XMarkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Outgoing Requests */}
                {outgoing.length > 0 && (
                  <div className="mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 px-1">
                      Đã gửi lời mời ({outgoing.length})
                    </span>
                    {outgoing.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-1"
                      >
                        <img
                          src={
                            req.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              req.user?.fullName || "User"
                            )}&background=475569&color=fff`
                          }
                          alt={req.user?.fullName}
                          className="w-7 h-7 rounded-lg flex-shrink-0 object-cover"
                        />
                        <span className="text-xs font-medium text-slate-300 flex-1 min-w-0 truncate">
                          {req.user?.fullName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">
                          Chờ duyệt
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Friends List */}
                <div className="px-1">
                  <div className="px-1 pt-1 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Danh sách bạn bè ({filteredFriends.length})
                    </span>
                  </div>
                  {filteredFriends.map((f) => {
                    const user = f.user;
                    const isCreating = creatingFor === user?.id;
                    return (
                      <div
                        key={f.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => !isCreating && handleSelectUser(user)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !isCreating) {
                            e.preventDefault();
                            handleSelectUser(user);
                          }
                        }}
                        aria-label={`Bắt đầu nhắn tin với ${user?.fullName}`}
                        className="group flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-slate-800/50 transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              user?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user?.fullName || "User"
                              )}&background=2563eb&color=fff&bold=true`
                            }
                            alt={user?.fullName}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          {user?.status === "ONLINE" && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-slate-900 rounded-full" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white flex-1 min-w-0 truncate">
                          {user?.fullName}
                        </span>
                        {isCreating ? (
                          <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] font-medium text-cyan-300 bg-blue-500/15 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition border border-blue-500/25">
                            Nhắn tin
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {filteredFriends.length === 0 &&
                    incoming.length === 0 &&
                    outgoing.length === 0 && (
                      <div className="text-center text-xs text-slate-500 pt-16 px-4">
                        <UserIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-slate-300">
                          Chưa có bạn bè nào
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Vào tab Tìm kiếm bằng số điện thoại để kết nối thêm bạn bè
                        </p>
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <CreateGroupModal
        open={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreated={({ room }) => {
          onSelectContact?.({ room, contact: null });
          setActiveTab("groups");
        }}
      />
    </>
  );
};

export default Sidebar;
