interface ModeSwitcherProps {
  mode: "chat" | "canvas";
  onChange: (mode: "chat" | "canvas") => void;
}

export default function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1 select-none">
      <button
        type="button"
        onClick={() => onChange("chat")}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          mode === "chat" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        普通对话模式
      </button>
      <button
        type="button"
        onClick={() => onChange("canvas")}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          mode === "canvas" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        画布模式
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white leading-none">
          HOT
        </span>
      </button>
    </div>
  );
}
