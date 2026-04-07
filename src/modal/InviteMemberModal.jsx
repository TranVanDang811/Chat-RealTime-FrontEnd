import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { addRoomMembers } from "../features/chat/chatThunks";


const InviteMemberModal = ({ open, onClose, room }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector((s) => s.friend);
  const myInfo = useSelector((s) => s.user.myInfo);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  // ===== FILTER FRIENDS (not in room) =====
  const currentMemberIds = new Set(room?.members?.map((m) => m.id) || []);

  const invitableFriends = friends
    .map((f) => f.user)
    .filter(
      (u) =>
        u &&
        !currentMemberIds.has(u.id) &&
        u.fullName?.toLowerCase().includes(search.toLowerCase())
    );

  // toggle select user
  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

const handleInvite = async () => {
  if (selectedIds.length === 0) { setError("Chọn ít nhất 1 người."); return; }
  setLoading(true);
  setError("");

  const result = await dispatch(addRoomMembers({
    roomId: room.id ?? room.roomId,
    memberIds: selectedIds,
  }));

  setLoading(false);

  if (addRoomMembers.fulfilled.match(result)) {
    onClose();// success → close modal
  } else {
    setError(result.payload || "Invite failed");
  }
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800 text-base">Mời thành viên</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Chọn từ danh sách bạn bè của bạn
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Thành viên hiện tại */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Thành viên hiện tại ({room?.members?.length || 0})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {room?.members?.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1">
                <img
                  src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&size=20`}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs text-gray-600">
                  {m.id === myInfo?.id ? "Bạn" : m.fullName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected chips */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 py-2 border-b border-gray-100">
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
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm bạn bè để mời..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {invitableFriends.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              {friends.length === 0
                ? "Bạn chưa có bạn bè nào."
                : "Tất cả bạn bè đã có trong nhóm."}
            </p>
          )}
          {invitableFriends.map((user) => {
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

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button
              onClick={handleInvite}
              disabled={loading || selectedIds.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium
                hover:bg-indigo-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlusIcon className="w-4 h-4" />
                  Mời {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;