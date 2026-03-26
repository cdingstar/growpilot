"use client";

import { Bot, ChevronDown, Image, RefreshCcw, Send } from "lucide-react";

interface ChatInputBoxProps {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}

export default function ChatInputBox({ draft, setDraft, onSend }: ChatInputBoxProps) {
  return (
    <div
      className="rounded-2xl p-px shadow-2xl shadow-violet-900/20"
      style={{ background: "linear-gradient(135deg,#7c3aed55,#2563eb55,#7c3aed55)" }}
    >
      <div className="rounded-[calc(1rem-1px)] bg-[#10121a] px-4 pt-4 pb-3">
        {/* 上行：图片图标 + 输入框 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-[#1a1d27] border border-white/10 flex items-center justify-center">
            <Image size={20} className="text-gray-400" />
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="询问您的问题"
            rows={2}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-200 placeholder:text-gray-500 leading-relaxed pt-1"
          />
        </div>

        {/* 下行：选择器 + 操作区 */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              <Bot size={12} className="text-gray-400" />
              <span>电商智能体</span>
              <ChevronDown size={11} className="text-gray-500" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              <span className="font-bold text-[#ff9900] text-xs">a</span>
              <span>亚马逊</span>
              <ChevronDown size={11} className="text-gray-500" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              <span className="text-sm">🇬🇧</span>
              <span>英文</span>
              <ChevronDown size={11} className="text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              模板库 <span className="text-gray-500">›</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-3 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              自定义模板
              <RefreshCcw size={11} className="text-gray-500 ml-0.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            />
            <button
              type="button"
              onClick={onSend}
              className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg shadow-violet-900/40"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
