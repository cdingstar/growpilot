"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, FolderUp, Sparkles } from "lucide-react";
import { authApi, type UserSummary } from "@/lib/api/auth";

export default function DashboardHomePage() {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [userName, setUserName] = useState("Anna");

  useEffect(() => {
    const saved = localStorage.getItem("growpilot_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.name) setUserName(u.name.split(" ")[0]);
      } catch {}
    }
    authApi.getUserSummary()
      .then((data) => {
        setSummary(data);
        if (data.user_name) setUserName(data.user_name.split(" ")[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold text-white">欢迎回来，{userName}</h1>
            <div className="text-sm font-semibold text-gray-400">今天准备创作什么内容？</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ideas"
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-bold transition-colors"
          >
            <Sparkles size={16} />
            打开收藏的灵感
          </Link>
          <Link
            href="/dashboard/assets/hot"
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-bold transition-colors"
          >
            <FolderUp size={16} />
            打开资产
          </Link>
        </div>
      </div>

      <Link
        href="/dashboard/marketing-assistant"
        className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-colors"
      >
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
          <Bot size={32} className="text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-white">电商智能体</div>
          <div className="text-sm text-gray-400 mt-0.5">AI 驱动的电商营销内容生成，帮你快速产出商品文案、营销素材</div>
        </div>
        <div className="shrink-0 text-violet-400 text-sm font-semibold">立即使用 →</div>
      </Link>
    </div>
  );
}

