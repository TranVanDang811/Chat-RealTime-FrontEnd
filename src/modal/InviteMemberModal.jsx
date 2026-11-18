import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { addRoomMembers } from "../features/chat/chatThunks";
import { useToast } from "../components/common/ToastContext";

const InviteMemberModal = ({ open, onClose, room }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { friends } = useSelector((s) => s.friend);
  const myInfo = useSelector((s) => s.user.myInfo);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ESC key support
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, loading]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIds([]);
      setError("");
    }
  }, [open]);

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

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    if (error) setError("");
  };

  const handleInvite = async () => {
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn ít nhất 1 thành viên để thêm vào nhóm.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await dispatch(
      addRoomMembers({
        roomId: room.id ?? room.roomId,
        memberIds: selectedIds,
      })
    );

    setLoading(false);

    if (addRoomMembers.fulfilled.match(result)) {
      toast.success("Đã thêm thành viên vào nhóm!");
      onClose();
    } else {
      setError(result.payload || "Thêm thành viên thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-members-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl shadow-blue-950/80 w-full max-w-[440px] max-h-[82vh] flex flex-col overflow-hidden border border-slate-700/80 text-white animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 id="invite-members-modal-title" className="font-bold text-white text-base leading-tight">
              Thêm thành viên vào nhóm
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn từ danh sách bạn bè để mời vào cuộc trò chuyện
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Đóng (Esc)"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Current Members Chips */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/40">
          <p className="text-xs font-semibold text-slate-400 mb-2">
            Thành viên hiện tại ({room?.members?.length || 0})
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {room?.members?.map((m) => (
              <div
                key={m.id}
                className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5"
              >
                <img
                  src={
                    m.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      m.fullName || "User"
                    )}&size=20&background=2563eb&color=fff`
                  }
                  alt={m.fullName}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span className="text-[11px] font-medium text-slate-300">
                  {m.id === myInfo?.id ? "Bạn" : m.fullName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Chips */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 py-2 border-b border-slate-800 bg-blue-950/30">
            {selectedIds.map((id) => {
              const u = friends.find((f) => f.user?.id === id)?.user;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 bg-blue-500/20 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-500/40"
                >
                  {u?.fullName}
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="hover:text-white transition"
                    aria-label={`Bỏ chọn ${u?.fullName}`}
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800">
          <MagnifyingGlassIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            className="flex-1 text-xs outline-none bg-transparent placeholder-slate-500 text-white"
          />
        </div>

        {/* Inline Error Alert */}
        {error && (
          <div className="mx-5 mt-2.5 p-2.5 rounded-xl bg-rose-950/40 text-rose-300 text-xs font-medium border border-rose-800/60 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* List of Friends */}
        <div className="flex-1 overflow-y-auto px-3 py-2 divide-y divide-slate-800/60">
          {invitableFriends.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-10">
              {friends.length === 0
                ? "Bạn chưa có bạn bè nào."
                : "Tất cả bạn bè đã có mặt trong nhóm."}
            </p>
          )}
          {invitableFriends.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <div
                key={user.id}
                onClick={() => !loading && toggle(user.id)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                  isSelected ? "bg-slate-800 text-white" : "hover:bg-slate-800/50"
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
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-slate-900 rounded-full" />
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

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 active:scale-98 transition disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleInvite}
            disabled={loading || selectedIds.length === 0}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="w-4 h-4" />
                <span>Mời {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
