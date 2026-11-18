import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type = "info", duration = 3200 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg, duration) => addToast({ message: msg, type: "success", duration }),
    error: (msg, duration) => addToast({ message: msg, type: "error", duration }),
    info: (msg, duration) => addToast({ message: msg, type: "info", duration }),
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast, toast }}>
      {children}

      {/* Floating Toast Notification Stack */}
      <div
        role="region"
        aria-label="Thông báo hệ thống"
        className="fixed bottom-4 sm:bottom-5 inset-x-3 sm:inset-x-auto sm:right-5 z-[9999] flex flex-col gap-2 sm:max-w-sm pointer-events-none select-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border shadow-2xl animate-toast transition-all text-xs font-medium text-slate-100 ${
              t.type === "success"
                ? "border-emerald-500/40 shadow-emerald-950/40"
                : t.type === "error"
                ? "border-rose-500/40 shadow-rose-950/40"
                : "border-cyan-500/40 shadow-blue-950/50"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === "success" && (
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                  <CheckCircleIcon className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
              {t.type === "error" && (
                <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                  <ExclamationCircleIcon className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
              {t.type === "info" && (
                <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                  <InformationCircleIcon className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
              <span className="leading-snug break-words">{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 flex-shrink-0"
              title="Đóng thông báo"
              aria-label="Đóng thông báo"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
