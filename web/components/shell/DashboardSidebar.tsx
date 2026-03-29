"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Camera,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderUp,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  Mic,
  type LucideIcon,
  Sprout,
  TrendingUp,
  Video,
  Wand2,
} from "lucide-react";

const formatBuildStamp = (value: string | undefined) => {
  if (!value) return "2026 03 26";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "2026 03 26";

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  isHot?: boolean;
  children?: SidebarItem[];
};

const PRODUCT_IMAGE_CHILDREN: SidebarItem[] = [
  { icon: ImageIcon, label: "卖点图设计", href: "/dashboard/product-image/selling-point" },
  { icon: ImageIcon, label: "白底图设计", href: "/dashboard/product-image/white-bg" },
  { icon: ImageIcon, label: "主图设计", href: "/dashboard/product-image/main" },
  { icon: ImageIcon, label: "尺寸图设计", href: "/dashboard/product-image/size" },
  { icon: ImageIcon, label: "细节图设计", href: "/dashboard/product-image/detail" },
  { icon: ImageIcon, label: "场景渲染图", href: "/dashboard/product-image/scene-render" },
  { icon: ImageIcon, label: "使用场景图", href: "/dashboard/product-image/scene-use" },
  { icon: ImageIcon, label: "营销海报", href: "/dashboard/product-image/poster" },
  { icon: ImageIcon, label: "场景替换", href: "/dashboard/product-image/scene-swap" },
  { icon: ImageIcon, label: "产品替换", href: "/dashboard/product-image/product-swap" },
];

const MODEL_CHILDREN: SidebarItem[] = [
  { icon: ImageIcon, label: "AI 模特", href: "/dashboard/model/ai-model", isHot: true },
  { icon: ImageIcon, label: "姿势裂变", href: "/dashboard/model/pose", isHot: true },
  { icon: ImageIcon, label: "产品数字人", href: "/dashboard/model/digital-human" },
  { icon: ImageIcon, label: "角色替换", href: "/dashboard/model/role-swap" },
  { icon: ImageIcon, label: "产品替换", href: "/dashboard/model/product-swap" },
  { icon: ImageIcon, label: "场景替换", href: "/dashboard/model/scene-swap" },
];

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "首页", href: "/dashboard" },
  { icon: Bot, label: "电商智能体", href: "/dashboard/marketing-assistant" },
  { icon: Camera, label: "商品图设计", href: "/dashboard/product-image", children: PRODUCT_IMAGE_CHILDREN },
  { icon: Mic, label: "产品模特", href: "/dashboard/model", children: MODEL_CHILDREN },
  { icon: Wand2, label: "AI创作工具", href: "/dashboard/tools" },
];

export default function DashboardSidebar({ isOpen }: { isOpen: boolean }) {
  const appVersion = "0.1.1209";
  const buildHHMM = process.env.NEXT_PUBLIC_BUILD_HHMM ?? "";
  const [buildStamp, setBuildStamp] = useState("未知");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const copyrightText = "Copyright © 2026 后起智能";

  useEffect(() => {
    setBuildStamp(formatBuildStamp(process.env.NEXT_PUBLIC_BUILD_TIME));
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0F1115] border-r border-white/5 transition-all duration-300 z-30 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-6 mb-8 relative group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sprout size={18} className="text-white/95" />
          </div>
          {isOpen && (
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              GrowPilot{buildHHMM ? ` (${buildHHMM})` : ""}
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute left-6 top-[66px] w-[260px] rounded-xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 px-4 py-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="text-sm font-semibold text-white">GrowPilot v{appVersion}</div>
          <div className="mt-1 text-xs text-white">Last Build: {buildStamp}</div>
          <div className="mt-1 text-xs text-white">{copyrightText}</div>
        </div>
      </div>

      <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const hasChildren = isOpen && !!item.children?.length;
          const isExpanded = !!expandedItems[item.label];

          return (
            <div key={item.label}>
              {hasChildren ? (
                /* 有子菜单：点击展开/收起，不跳转 */
                <button
                  type="button"
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                >
                  <item.icon size={22} className="group-hover:text-blue-400 transition-colors shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded
                    ? <ChevronDown size={15} className="text-gray-500" />
                    : <ChevronRight size={15} className="text-gray-500" />
                  }
                </button>
              ) : (
                /* 无子菜单：直接跳转 */
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                >
                  <item.icon size={22} className="group-hover:text-blue-400 transition-colors shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )}

              {/* 子菜单列表 */}
              {hasChildren && isExpanded && (
                <div className="mt-0.5 space-y-0.5">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors group ml-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{child.label}</span>
                        {child.isHot && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white leading-none">
                            HOT
                          </span>
                        )}
                      </div>
                      <ChevronRight size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
