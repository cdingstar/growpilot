"use client";

import { useState } from "react";
import {
  Hand,
  Image,
  MousePointer2,
  Pin,
  Plus,
  Square,
  Tag,
  Type,
} from "lucide-react";
import ChatInputBox from "@/components/chat/ChatInputBox";

const CANVAS_TOOLS = [
  { key: "select", icon: MousePointer2, label: "选择" },
  { key: "hand", icon: Hand, label: "拖拽" },
  { key: "pin", icon: Pin, label: "定位" },
  { key: "add", icon: Plus, label: "添加" },
  { key: "text", icon: Type, label: "文字" },
  { key: "rect", icon: Square, label: "矩形" },
  { key: "tag", icon: Tag, label: "标签" },
  { key: "image", icon: Image, label: "图片" },
];

interface CanvasViewProps {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}

function CanvasSidebar({ draft, setDraft, onSend }: CanvasViewProps) {
  return (
    <div className="w-[320px] flex flex-col justify-end bg-[#0B0D10] border-r border-white/5 p-4">
      <ChatInputBox draft={draft} setDraft={setDraft} onSend={onSend} />
    </div>
  );
}

function CanvasToolbar({ activeTool, onSelect }: { activeTool: string; onSelect: (k: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 px-1.5 bg-[#12151a] border-x border-white/5 z-10">
      {CANVAS_TOOLS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onSelect(key)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            activeTool === key
              ? "bg-white/15 text-white"
              : "text-gray-400 hover:bg-white/10 hover:text-gray-200"
          }`}
        >
          <Icon size={17} />
        </button>
      ))}
    </div>
  );
}

function CanvasPreview() {
  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        backgroundColor: "#0d0f13",
      }}
    >
      <div
        className="absolute rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -55%)", width: 320, height: 420 }}
      >
        <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center text-gray-500 text-sm">
          <Image size={48} className="opacity-30" />
        </div>
      </div>
    </div>
  );
}

export default function CanvasView({ draft, setDraft, onSend }: CanvasViewProps) {
  const [activeTool, setActiveTool] = useState("select");

  return (
    <div className="flex min-h-[680px] overflow-hidden">
      <CanvasSidebar draft={draft} setDraft={setDraft} onSend={onSend} />
      <CanvasToolbar activeTool={activeTool} onSelect={setActiveTool} />
      <CanvasPreview />
    </div>
  );
}
