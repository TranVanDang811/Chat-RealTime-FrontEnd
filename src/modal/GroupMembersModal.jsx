import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  XMarkIcon,
  UserGroupIcon,
  PencilSquareIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { updateNickname } from "../features/chat/chatThunks";
import { useToast } from "../components/common/ToastContext";

const GroupMembersModal = ({ open, onClose, room }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { rooms, currentRoom } = useSelector((s) => s.chat);

  const activeRoom = useMemo(() => {
    const targetId = room?.id ?? room?.roomId;
    if (!targetId) return room;
    return (
      rooms.find((r) => r.id === targetId || r.roomId === targetId) ||
      (currentRoom?.id === targetId || currentRoom?.roomId === targetId ? currentRoom : null) ||
      room
    );
  }, [room, rooms, currentRoom]);

  const [search, setSearch] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [saving, setSaving] = useState(false);

  // ESC key support
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !saving) {
        if (editingMemberId) {
          setEditingMemberId(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, saving, editingMemberId]);

  // Reset states when closed
  useEffect(() => {
    if (!open) {
      setSearch("");
      setEditingMemberId(null);
      setNicknameInput("");
    }
  }, [open]);

  const filteredMembers = useMemo(() => {
    const list = activeRoom?.members || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q) ||
        m.nickname?.toLowerCase().includes(q)
    );
  }, [activeRoom?.members, search]);

  const handleStartEdit = (m) => {
    setEditingMemberId(m.id);
    setNicknameInput(m.nickname || "");
  };

  const handleSaveNickname = async (targetUserId) => {
    const roomId = activeRoom?.id ?? activeRoom?.roomId;
    if (!roomId) return;

    try {
      setSaving(true);
      const res = await dispatch(
        updateNickname({
          roomId,
          targetUserId,
          nickname: nicknameInput.trim(),
        })
      );

      if (updateNickname.fulfilled.match(res)) {
        toast.success(
          nicknameInput.trim()
            ? "Đã lưu biệt danh thành công!"
            : "Đã xóa biệt danh thành công!"
        );
        setEditingMemberId(null);
        setNicknameInput("");
      } else {
        toast.error(res.payload || "Không thể cập nhật biệt danh");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu biệt danh");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveNickname = async (targetUserId) => {
    setNicknameInput("");
    const roomId = activeRoom?.id ?? activeRoom?.roomId;
    if (!roomId) return;

    try {
      setSaving(true);
      const res = await dispatch(
        updateNickname({
          roomId,
          targetUserId,
          nickname: "",
        })
      );
      if (updateNickname.fulfilled.match(res)) {
        toast.success("Đã xóa biệt danh thành công!");
        setEditingMemberId(null);
        setNicknameInput("");
      } else {
        toast.error(res.payload || "Không thể xóa biệt danh");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa biệt danh");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-members-modal-title"
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="bg-[#0f172a] w-full max-w-[460px] max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/80 text-white animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-cyan-400 flex items-center justify-center border border-blue-500/30">
              <UserGroupIcon className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="group-members-modal-title"
                className="font-bold text-white text-sm leading-tight"
              >
                Thành viên & Biệt danh nhóm
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeRoom?.members?.length || 0} thành viên • Có thể đặt biệt danh cho nhau
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Đóng (Esc)"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/30">
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc biệt danh..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Không tìm thấy thành viên phù hợp
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isOnline = m.status === "ONLINE";
              const isEditing = editingMemberId === m.id;

              return (
                <div key={m.id} className="pt-2 first:pt-0">
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          m.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            m.fullName || "User"
                          )}&background=2563eb&color=fff&bold=true`
                        }
                        alt={m.fullName}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>

                    {/* Member Info & Nickname */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-white truncate">
                          {m.nickname || m.fullName}
                        </span>
                        {m.nickname && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold tracking-wide">
                            Biệt danh
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        {m.nickname ? (
                          <span>Tên gốc: {m.fullName}</span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Chưa có biệt danh
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit Nickname Button */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? setEditingMemberId(null) : handleStartEdit(m)
                        }
                        className={`p-1.5 rounded-lg border text-xs transition active:scale-95 flex items-center gap-1 cursor-pointer ${
                          isEditing
                            ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                            : "bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700"
                        }`}
                        title={
                          m.nickname
                            ? `Đổi biệt danh cho ${m.fullName}`
                            : `Đặt biệt danh cho ${m.fullName}`
                        }
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px] hidden sm:inline">
                          {m.nickname ? "Sửa" : "Đặt biệt danh"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Nickname Editor */}
                  {isEditing && (
                    <div className="mx-2 mb-2 p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 shadow-md animate-fade-in">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-300 font-medium">
                          Biệt danh trong nhóm cho{" "}
                          <strong className="text-white">{m.fullName}</strong>:
                        </span>
                        {m.nickname && (
                          <button
                            type="button"
                            onClick={() => handleRemoveNickname(m.id)}
                            disabled={saving}
                            className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline"
                          >
                            Xóa biệt danh
                          </button>
                        )}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveNickname(m.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={nicknameInput}
                          onChange={(e) => setNicknameInput(e.target.value)}
                          placeholder="Ví dụ: Đội trưởng, Dev Lead..."
                          maxLength={32}
                          autoFocus
                          className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                        />
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-md shadow-blue-600/30 disabled:opacity-50 transition cursor-pointer flex items-center gap-1"
                        >
                          {saving ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckIcon className="w-3.5 h-3.5" />
                          )}
                          <span>Lưu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                        >
                          Hủy
                        </button>
                      </form>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        Biệt danh này chỉ hiển thị trong nhóm chat hiện tại.
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;