"use client";

import { Bot, Plus, Search } from "lucide-react";

interface Thread {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  threads: Thread[];
  activeThreadId: string;
  query: string;
  onQueryChange: (q: string) => void;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
}

export default function ChatSidebar({
  threads,
  activeThreadId,
  query,
  onQueryChange,
  onSelectThread,
  onNewThread,
}: ChatSidebarProps) {
  return (
    <div className="border-r border-white/5 bg-[#0B0D10]">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <Bot size={18} className="text-blue-200" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">AI营销助手</div>
            <div className="text-xs text-gray-500 truncate">内容创作 · 流量增长</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewThread}
          className="mt-5 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          新对话
        </button>

        <div className="mt-4 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center px-3 gap-2">
          <Search size={16} className="text-gray-500" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索历史对话"
            className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="px-3 pb-4">
        <div className="px-2 text-xs font-semibold text-gray-500">历史对话</div>
        <div className="mt-2 space-y-1">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectThread(t.id)}
              className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                t.id === activeThreadId
                  ? "bg-white/10 border-white/10 text-white"
                  : "bg-transparent border-transparent text-gray-300 hover:bg-white/5"
              }`}
            >
              <div className="text-sm font-semibold truncate">{t.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
