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
import {
  addIncomingRequest,
  clearSearchUser,
} from "../features/friend/friendSlice";

// ─── CreateGroupModal ─────────────────────────────────────────────────────────
const CreateGroupModal = ({ open, onClose, onCreated }) => {
  const dispatch = useDispatch();
  // ✅ Dùng friends thay vì users
  const { friends } = useSelector((s) => s.friend);
  const myInfo = useSelector((s) => s.user.myInfo);
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
    if (!groupName.trim()) { setError("Vui lòng nhập tên nhóm."); return; }
    if (selectedIds.length < 2) { setError("Chọn ít nhất 2 thành viên."); return; }

    const result = await dispatch(
      createGroupRoom({ name: groupName.trim(), memberIds: selectedIds })
    );

    if (createGroupRoom.fulfilled.match(result)) {
      const newRoom = result.payload;
      dispatch(setCurrentRoom(newRoom));
      dispatch(getRooms());
      onCreated?.({ room: newRoom });
      onClose();
    } else {
      setError(result.payload || "Tạo nhóm thất bại.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800 text-base">Tạo nhóm mới</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Group name */}
          <div className="px-5 pt-4 pb-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tên nhóm</label>
            <input
              type="text"
              placeholder="VD: Team Frontend, Nhóm dự án..."
              value={groupName}
              onChange={(e) => { setGroupName(e.target.value); setError(""); }}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none
                focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
          </div>

          {/* Selected chips */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 py-2">
              {selectedIds.map((id) => {
                const u = friends.find((f) => f.user?.id === id)?.user;
                return (
                  <span key={id} className="flex items-center gap-1 bg-indigo-50 text-indigo-700
                    text-xs px-2.5 py-1 rounded-full border border-indigo-100">
                    {u?.fullName}
                    <button onClick={() => toggle(id)}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-gray-100">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm trong danh sách bạn bè..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            />
            <span className="text-xs text-gray-400 flex-shrink-0">{selectedIds.length} đã chọn</span>
          </div>

          {/* Friend list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 px-2 pb-2">
            {friendList.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                {friends.length === 0 ? "Bạn chưa có bạn bè nào." : "Không tìm thấy."}
              </p>
            )}
            {friendList.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggle(user.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition
                    ${isSelected ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=fff`}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {user.status === "ONLINE" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                    ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"}`}>
                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={roomsLoading || !groupName.trim() || selectedIds.length < 2}
              className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium
                hover:bg-indigo-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {roomsLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                `Tạo nhóm${selectedIds.length >= 2 ? ` (${selectedIds.length + 1} người)` : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PeopleTab — tìm user qua số điện thoại ───────────────────────────────────
const PeopleTab = () => {
  const dispatch = useDispatch();
  const myInfo = useSelector((s) => s.user.myInfo);
  const { searchUser, friends, outgoing, loading } = useSelector((s) => s.friend);

  const [phone, setPhone] = useState("");
  const [sentIds, setSentIds] = useState([]); // track vừa gửi trong session này
  const [error, setError] = useState("");

  // Clear kết quả khi unmount
  useEffect(() => {
    return () => dispatch(clearSearchUser());
  }, [dispatch]);

  const handleSearch = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { setError("Nhập số điện thoại để tìm kiếm."); return; }
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
    } else {
      setError(result.payload || "Gửi lời mời thất bại.");
    }
  };

  // Tính trạng thái của user tìm được
  const getRelationStatus = (userId) => {
    if (!userId || userId === myInfo?.id) return "self";
    if (friends.some((f) => f.user?.id === userId)) return "friend";
    if (outgoing.some((r) => r.receiverId === userId)) return "pending";
    if (sentIds.includes(userId)) return "pending";
    return "none";
  };

  const status = searchUser ? getRelationStatus(searchUser.id) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 bg-white">
          <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="tel"
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          />
          {phone && (
            <button
              onClick={() => { setPhone(""); setError(""); dispatch(clearSearchUser()); }}
              className="text-gray-300 hover:text-gray-500 transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-2 w-full py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 active:scale-95 transition disabled:opacity-40"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            "Tìm kiếm"
          )}
        </button>
        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>

      {/* Kết quả tìm kiếm */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {searchUser && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-400 mb-2">Kết quả</p>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={
                    searchUser.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(searchUser.fullName)}&background=3b82f6&color=fff`
                  }
                  alt={searchUser.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {searchUser.status === "ONLINE" && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{searchUser.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{searchUser.phone || phone}</p>
              </div>

              {/* Action */}
              {status === "self" && (
                <span className="text-xs text-gray-400 flex-shrink-0">Bạn</span>
              )}
              {status === "friend" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium flex-shrink-0">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Bạn bè
                </span>
              )}
              {status === "pending" && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0">
                  Đã gửi
                </span>
              )}
              {status === "none" && (
                <button
                  onClick={() => handleSend(searchUser.id)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium
                    hover:bg-blue-600 active:scale-95 transition disabled:opacity-40 flex-shrink-0"
                >
                  <UserPlusIcon className="w-3.5 h-3.5" />
                  Kết bạn
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state khi chưa tìm */}
        {!searchUser && !error && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <PhoneIcon className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Nhập số điện thoại</p>
            <p className="text-xs text-gray-300 mt-1">để tìm và kết bạn</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "chats",    label: "Chats",    icon: <UserIcon className="w-4 h-4" /> },
  { id: "groups",   label: "Groups",   icon: <UserGroupIcon className="w-4 h-4" /> },
  { id: "contacts", label: "Friends",  icon: <UserIcon className="w-4 h-4" /> },
  { id: "people",   label: "People",   icon: <UserPlusIcon className="w-4 h-4" /> },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ onSelectContact }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingFor, setCreatingFor] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const { friends, incoming, outgoing } = useSelector((s) => s.friend);
  const { rooms, currentRoom, roomsLoading } = useSelector((s) => s.chat);
  const { users, loading: userLoading } = useSelector((s) => s.user);
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
    return other?.fullName || "Unknown";
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
    const result = await dispatch(createPrivateRoom({ userA: myInfo.id, userB: user.id }));
    setCreatingFor(null);

    if (createPrivateRoom.fulfilled.match(result)) {
      const newRoom = result.payload;
      dispatch(setCurrentRoom(newRoom));
      dispatch(getRooms());
      onSelectContact?.({ room: newRoom, contact: user });
      setActiveTab("chats");
    }
  };

const sortByLatest = (a, b) =>
  new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0);

const privateRooms = rooms
  .filter((r) => {
    if (!searchQuery) return true;
    return getRoomDisplayName(r).toLowerCase().includes(searchQuery.toLowerCase());
  })
  .sort(sortByLatest);

const groupRooms = rooms
  .filter((r) => {
    if (r.type !== "GROUP") return false;
    if (!searchQuery) return true;
    return (r.roomName || "").toLowerCase().includes(searchQuery.toLowerCase());
  })
  .sort(sortByLatest);

  // ── Room card ──────────────────────────────────────────────────────────────
  const RoomCard = ({ room, isGroup }) => {
  const isActive =
    (currentRoom?.id ?? currentRoom?.roomId) === (room?.id ?? room?.roomId);

  const other = room.members?.find((m) => m.id !== myInfo?.id);

  return (
    <div
      onClick={() => handleSelectRoom(room)}
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition
        ${isActive ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"}`}
    >
      <div className="flex items-center gap-3">
        
        {/* ✅ Avatar */}
        {isGroup ? (
          <img
            src={
              room.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(room.roomName || "G")}`
            }
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <img
            src={
              other?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.fullName || "U")}`
            }
            className="w-12 h-12 rounded-full object-cover"
          />
        )}

        {/* Info */}
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {getRoomDisplayName(room)}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[120px]">
            {isGroup
              ? `${room.members?.length || 0} thành viên`
              : room.lastMessage || "Chưa có tin nhắn"}
          </p>
        </div>
      </div>

      {room.unreadCount > 0 && (
        <span className="min-w-[20px] h-5 bg-blue-500 text-white text-xs flex items-center justify-center rounded-full px-1">
          {room.unreadCount}
        </span>
      )}
    </div>
  );
};

  return (
    <>
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-lg">
        {/* Tabs — 4 tab nên dùng icon nhỏ hơn */}
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
  <button
    key={tab.id}
    onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-xs font-medium transition-colors
      ${activeTab === tab.id
        ? "border-b-2 border-blue-500 text-blue-600"
        : "text-gray-500 hover:text-blue-500"}`}
  >
    <div className="relative">
      {tab.icon}
      {tab.id === "contacts" && incoming.length > 0 && (
        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-0.5 leading-none">
          {incoming.length}
        </span>
      )}
    </div>
    <span className="mt-0.5">{tab.label}</span>
  </button>
))}
        </div>

        {/* Search — ẩn ở tab People vì nó có search riêng */}
        {activeTab !== "people" && (
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === "contacts" ? "Tìm bạn bè..." : "Tìm phòng..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 ml-3 text-sm outline-none rounded-full px-3 py-1 bg-gray-100 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        {/* Tab: People — render riêng, không cần wrapper skeleton */}
        {activeTab === "people" && <PeopleTab />}

        {/* List — chỉ render cho các tab còn lại */}
        {activeTab !== "people" && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Skeleton */}
            {isLoading && (
              <div className="space-y-2 px-2 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Chats */}
            {activeTab === "chats" && !isLoading && (
              <>
                {privateRooms.map((room) => (
                  <RoomCard key={room.id ?? room.roomId} room={room} isGroup={room.type === "GROUP"} />
                ))}
                {privateRooms.length === 0 && (
                  <div className="text-center text-sm text-gray-400 pt-10">
                    Chưa có cuộc trò chuyện nào.
                    <br />
                    <span className="text-xs">Vào tab Friends để bắt đầu chat.</span>
                  </div>
                )}
              </>
            )}

            {/* Tab: Groups */}
            {activeTab === "groups" && !isLoading && (
              <>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1
                    border-2 border-dashed border-indigo-200 text-indigo-500
                    hover:bg-indigo-50 hover:border-indigo-400 transition text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tạo nhóm mới
                </button>
                {groupRooms.map((room) => (
                  <RoomCard key={room.id} room={room} isGroup={true} />
                ))}
                {groupRooms.length === 0 && (
                  <div className="text-center text-sm text-gray-400 pt-6">Chưa có nhóm nào.</div>
                )}
              </>
            )}

            {/* Tab: Friends (Contacts) */}
            {activeTab === "contacts" && !isLoading && (
              <>
                {/* Incoming */}
                {incoming.length > 0 && (
                  <div className="px-1 pb-2">
                    <p className="text-xs font-semibold text-gray-400 px-2 mb-1">
                      Lời mời kết bạn
                      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] rounded-full">
                        {incoming.length}
                      </span>
                    </p>
                    {incoming.map((req) => (
                      <div key={req.id} className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 border border-blue-100 mb-1">
                        <img
                          src={
                            req.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.fullName || "U")}&background=3b82f6&color=fff`
                          }
                          className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                        />
                        <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
                          {req.user?.fullName}
                        </span>
                        <button
                          onClick={() => dispatch(acceptFriend(req.id))}
                          className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex-shrink-0"
                          title="Chấp nhận"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => dispatch(rejectFriend(req.id))}
                          className="p-1.5 rounded-lg bg-red-400 text-white hover:bg-red-500 transition flex-shrink-0"
                          title="Từ chối"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Outgoing */}
                {outgoing.length > 0 && (
                  <div className="px-1 pb-2">
                    <p className="text-xs font-semibold text-gray-400 px-2 mb-1">Đã gửi lời mời</p>
                    {outgoing.map((req) => (
                      <div key={req.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 mb-1">
                        <img
                          src={
                            req.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.fullName || "U")}`
                          }
                          className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                        />
                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                          {req.user?.fullName}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Friends list */}
                <div className="px-1">
                  {(incoming.length > 0 || outgoing.length > 0) && filteredFriends.length > 0 && (
                    <p className="text-xs font-semibold text-gray-400 px-2 mb-1">Bạn bè</p>
                  )}
                  {filteredFriends.map((f) => {
                    const user = f.user;
                    const isCreating = creatingFor === user.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => !isCreating && handleSelectUser(user)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {user.status === "ONLINE" && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
                          {user.fullName}
                        </span>
                        {isCreating && (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                  {filteredFriends.length === 0 && incoming.length === 0 && outgoing.length === 0 && (
                    <div className="text-center text-sm text-gray-400 pt-10">
                      Chưa có bạn bè nào.
                      <br />
                      <span className="text-xs">Vào tab People để tìm và kết bạn.</span>
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