interface RoleBubbleProps {
  role: "user" | "assistant";
  children: React.ReactNode;
}

export default function RoleBubble({ role, children }: RoleBubbleProps) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[820px] rounded-2xl border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-white/5 border-white/10 text-gray-100"
            : "bg-blue-600/20 border-blue-500/20 text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
