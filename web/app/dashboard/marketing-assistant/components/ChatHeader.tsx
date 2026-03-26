"use client";

import {
  Bot,
  Clapperboard,
  FileText,
  Megaphone,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const TOOL_PRESETS = [
  { key: "chat", label: "智能问答", icon: Bot },
  { key: "copy", label: "产生文案", icon: FileText },
  { key: "script", label: "拍摄脚本", icon: Clapperboard },
  { key: "ecom", label: "电商卖点", icon: ShoppingBag },
  { key: "ad", label: "创作素材", icon: Megaphone },
];

interface ChatHeaderProps {
  activeTool: string;
  onToolChange: (key: string) => void;
  recommendedTools: string[];
  onRefreshRecommend: () => void;
  onUseRecommend: (title: string) => void;
}

export default function ChatHeader({
  activeTool,
  onToolChange,
  recommendedTools,
  onRefreshRecommend,
  onUseRecommend,
}: ChatHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-white/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex flex-col gap-4">
          <div>
            <div className="text-lg font-bold text-white">AI营销助手</div>
            <div className="mt-1 text-sm text-gray-400">
              一站式对话式创作：文案、脚本、电商、投放素材
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TOOL_PRESETS.map(({ key, label, icon: Icon }) => {
              const active = key === activeTool;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToolChange(key)}
                  className={`h-10 px-4 rounded-full border transition-colors flex items-center gap-2 ${
                    active
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} className={active ? "text-blue-200" : "text-gray-400"} />
                  <span className="text-sm font-bold">{label}</span>
                </button>
              );
            })}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 ml-2">
              <Sparkles size={14} className="text-blue-300" />
              <span>支持多模态与结构化输出</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[360px] rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Sparkles size={16} className="text-blue-200" />
              推荐工具
            </div>
            <button
              type="button"
              onClick={onRefreshRecommend}
              className="h-8 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <RefreshCcw size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-200">换一换</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {recommendedTools.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => onUseRecommend(title)}
                className="h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold text-gray-200"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
