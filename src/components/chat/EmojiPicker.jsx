import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { EMOJI_CATEGORIES, EMOJI_LIST } from "./emojiData";

const RECENT_KEY = "chat_recent_emojis";
const MAX_RECENTS = 24;

// Remove Vietnamese accents for fast fuzzy searching
const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

const getStoredRecents = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRecentEmoji = (emojiChar) => {
  try {
    const current = getStoredRecents();
    const updated = [emojiChar, ...current.filter((e) => e !== emojiChar)].slice(
      0,
      MAX_RECENTS
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
};

const EmojiPicker = ({ onSelect, onClose, position = "top" }) => {
  const [activeCategory, setActiveCategory] = useState("recent");
  const [search, setSearch] = useState("");
  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const [recents, setRecents] = useState(getStoredRecents);
  const pickerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Auto-focus search on desktop
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (!isMobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Update recents when picker opens
  useEffect(() => {
    setRecents(getStoredRecents());
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Filter emojis based on search or category
  const filteredEmojis = useMemo(() => {
    const q = removeVietnameseTones(search.trim());

    if (q) {
      return EMOJI_LIST.filter((item) => {
        const nameMatch = removeVietnameseTones(item.name).includes(q);
        const keywordMatch = item.keywords.some((k) =>
          removeVietnameseTones(k).includes(q)
        );
        return nameMatch || keywordMatch;
      });
    }

    if (activeCategory === "recent") {
      if (recents.length > 0) {
        return recents
          .map((char) => EMOJI_LIST.find((e) => e.emoji === char) || {
            emoji: char,
            name: "Gần đây",
            cat: "recent",
          })
          .filter(Boolean);
      }
      // If no recents yet, show popular smileys & hearts
      return EMOJI_LIST.filter((e) => e.cat === "smileys" || e.cat === "hearts").slice(
        0,
        32
      );
    }

    return EMOJI_LIST.filter((e) => e.cat === activeCategory);
  }, [search, activeCategory, recents]);

  const handleEmojiClick = (emoji) => {
    saveRecentEmoji(emoji.emoji);
    setRecents(getStoredRecents());
    onSelect(emoji.emoji);
  };

  return (
    <div
      ref={pickerRef}
      role="dialog"
      aria-label="Bảng chọn emoji"
      className="absolute bottom-full mb-3 left-0 sm:left-2 z-50 w-[310px] sm:w-[350px] bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/90 text-white flex flex-col overflow-hidden animate-modal-pop backdrop-blur-md select-none"
    >
      {/* ── Search Input ──────────────────────────────────────────────── */}
      <div className="p-2.5 pb-2 border-b border-slate-800 bg-slate-900/60">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm emoji (cười, tim, like, hoa...)"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 text-slate-400 hover:text-white p-0.5"
              title="Xóa tìm kiếm"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Tabs ──────────────────────────────────────────────── */}
      {!search && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto scrollbar-none">
          {EMOJI_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`p-1.5 rounded-lg text-sm transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? "bg-blue-600/25 text-cyan-300 ring-1 ring-blue-500/40 shadow-xs scale-105"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
                title={cat.name}
              >
                <span>{cat.icon}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Emoji Grid ─────────────────────────────────────────────────── */}
      <div className="p-2 h-56 sm:h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredEmojis.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
            <span className="text-2xl mb-1.5">🔍</span>
            <p className="font-medium text-slate-300">Không tìm thấy emoji nào</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Thử từ khóa khác: "cuoi", "tim", "vui", "hot"...
            </p>
          </div>
        ) : (
          <div>
            {!search && (
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1 uppercase tracking-wider">
                <span>
                  {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.name ||
                    "Biểu tượng"}
                </span>
                {activeCategory === "recent" && recents.length > 0 && (
                  <span className="text-[10px] text-cyan-400 font-normal lowercase">
                    {recents.length} gần đây
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
              {filteredEmojis.map((item, idx) => (
                <button
                  key={`${item.emoji}-${idx}`}
                  type="button"
                  onClick={() => handleEmojiClick(item)}
                  onMouseEnter={() => setHoveredEmoji(item)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl flex items-center justify-center text-xl sm:text-2xl hover:scale-125 hover:bg-slate-800/90 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title={item.name}
                >
                  <span className="transform transition-transform select-none">
                    {item.emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: Hover Preview Bar ──────────────────────────────────── */}
      <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs min-h-[38px]">
        {hoveredEmoji ? (
          <div className="flex items-center gap-2 animate-fade-in truncate">
            <span className="text-2xl">{hoveredEmoji.emoji}</span>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-white truncate text-[11px]">
                {hoveredEmoji.name}
              </span>
              <span className="text-[10px] text-cyan-400 truncate">
                Click để chèn vào tin nhắn
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Chọn emoji để gửi vào cuộc trò chuyện</span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-[11px] transition"
          title="Đóng (Esc)"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EmojiPicker;
