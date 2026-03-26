"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ChatInputBox from "@/components/chat/ChatInputBox";

const QUICK_TOOLS = [
  { label: "AI商品图", icon: "🎨" },
  { label: "AI模特", icon: "👤", isNew: true },
  { label: "AI主图", icon: "🖼️" },
  { label: "AI详情页", icon: "📄" },
  { label: "场景图设计", icon: "🏞️" },
  { label: "营销海报设计", icon: "📢" },
];

interface GuestOverlayProps {
  onOpenLogin: () => void;
  isSidebarOpen?: boolean;
}

export default function GuestOverlay({ onOpenLogin, isSidebarOpen = true }: GuestOverlayProps) {
  const [draft, setDraft] = useState("");

  const sidebarW = isSidebarOpen ? 256 : 80;
  const headerH = 64;

  return (
    <div
      className="fixed z-30 flex items-center justify-center pointer-events-none"
      style={{ left: sidebarW, top: headerH, right: 0, bottom: 0 }}
    >
      <div
        className="absolute inset-0 bg-[#0B0D10]/60 backdrop-blur-sm pointer-events-auto"
        onClick={onOpenLogin}
      />

      <div className="relative z-10 pointer-events-auto w-full max-w-2xl mx-6 flex flex-col items-center gap-8">
        {/* 标题 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Hi 您好，今天想{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
              创作
            </span>
            {" "}什么?
          </h2>
        </div>

        {/* 输入框（点击触发登录） */}
        <div className="w-full" onClick={onOpenLogin} style={{ cursor: "pointer" }}>
          <ChatInputBox draft={draft} setDraft={setDraft} onSend={onOpenLogin} />
        </div>

        {/* 快捷工具标签 */}
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors backdrop-blur-sm"
            >
              <span className="text-sm">{tool.icon}</span>
              <span className="font-medium">{tool.label}</span>
              {tool.isNew && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-500/80 text-white rounded-full leading-none">
                  new
                </span>
              )}
              <ArrowUpRight size={13} className="text-gray-500" />
            </button>
          ))}
        </div>

        {/* 登录提示 */}
        <button
          type="button"
          onClick={onOpenLogin}
          className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-2"
        >
          登录后即可开始创作
        </button>
      </div>
    </div>
  );
}
