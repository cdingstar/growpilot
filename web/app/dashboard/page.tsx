"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderUp, Plus, Sparkles, Video, Wand2, Zap, Bot, type LucideIcon } from "lucide-react";
import { authApi, type UserSummary } from "@/lib/api/auth";

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  trendClass: string;
  iconClassName?: string;
  iconWrapClassName?: string;
};

function buildStats(summary: UserSummary | null): StatItem[] {
  const creationsDeltaPositive = summary?.weekly_creations_delta?.startsWith("+");
  const computeDeltaPositive = summary?.compute_delta?.startsWith("+");
  return [
    {
      icon: Video,
      label: "本周创作",
      value: summary ? String(summary.weekly_creations) : "12",
      trend: summary?.weekly_creations_delta ?? "+20%",
      trendClass: creationsDeltaPositive ? "text-green-400" : "text-red-400",
      iconClassName: "text-purple-300",
      iconWrapClassName: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: FolderUp,
      label: "资产容量",
      value: summary ? `${summary.storage_used_gb} GB` : "2.4 GB",
      trend: summary ? `${Math.round(summary.storage_used_pct)}% used` : "75% used",
      trendClass: "text-gray-400",
      iconClassName: "text-emerald-300",
      iconWrapClassName: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Sparkles,
      label: "获得积分",
      value: summary ? summary.points.toLocaleString() : "1,250",
      trend: summary?.points_delta ?? "+150",
      trendClass: "text-green-400",
      iconClassName: "text-amber-300",
      iconWrapClassName: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Zap,
      label: "算力消耗",
      value: summary ? String(summary.compute_consumed) : "45",
      trend: summary?.compute_delta ?? "-15%",
      trendClass: computeDeltaPositive ? "text-red-400" : "text-green-400",
      iconClassName: "text-blue-300",
    },
  ];
}

export default function DashboardHomePage() {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [userName, setUserName] = useState("Anna");

  useEffect(() => {
    // 先从 localStorage 读取用户名快速显示
    const saved = localStorage.getItem("growpilot_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.name) setUserName(u.name.split(" ")[0]);
      } catch {}
    }
    // 拉取真实汇总数据
    authApi.getUserSummary()
      .then((data) => {
        setSummary(data);
        if (data.user_name) setUserName(data.user_name.split(" ")[0]);
      })
      .catch(() => {}); // 未登录或网络问题时静默降级，显示默认值
  }, []);

  const stats = buildStats(summary);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-[#0F1115] border border-white/5 rounded-2xl">
            <div className="flex items-stretch gap-4">
              <div
                className={`shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center ${
                  stat.iconWrapClassName ?? "bg-white/5 border-white/10"
                }`}
              >
                <stat.icon size={32} className={stat.iconClassName ?? "text-blue-300"} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-gray-400 text-sm mb-2">
                  <span>{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-white flex items-end gap-2">
                    <span>{stat.value}</span>
                  </div>
                  <span className={`text-sm ${stat.trendClass}`}>{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Plus, title: "新建项目", desc: "进入项目列表并快速创建", href: "/dashboard/project" },
          { icon: FolderUp, title: "添加素材", desc: "上传/收藏你的创作素材", href: "/dashboard/assets" },
          { icon: Video, title: "AI 视频工场", desc: "一键生成短视频", href: "/dashboard/project?create=video" },
          { icon: Wand2, title: "AI创作工具", desc: "写文案、处理图片", href: "/dashboard/tools" },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-stretch gap-4 p-6 rounded-2xl bg-[#0F1115] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors"
          >
            <div className="shrink-0 w-16 h-16 rounded-2xl border bg-white/5 border-white/10 flex items-center justify-center">
              <item.icon size={32} className="text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{item.title}</div>
              <div className="text-xs text-gray-400 truncate">{item.desc}</div>
            </div>
          </Link>
        ))}
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
