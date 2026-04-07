import React from "react";

const GroupMembersModal = ({ open, onClose, room }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[400px] max-h-[500px] rounded-xl shadow-xl flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b font-semibold">
          Thành viên nhóm ({room?.members?.length || 0})
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {room?.members?.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              
              <img
                src={
                  m.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    m.fullName || "U"
                  )}`
                }
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="text-sm font-medium">{m.fullName}</div>
                <div className="text-xs text-gray-400">
                  {m.status === "ONLINE" ? "Đang hoạt động" : "Offline"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;