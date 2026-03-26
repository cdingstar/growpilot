"use client";

import { Gift } from "lucide-react";
import { useEffect, useState } from "react";

export default function GuestCTAs({ onOpenLogin }) {
  const [authed, setAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
    setAuthed(Boolean(token));
    const onLogin = () => setAuthed(true);
    const onLogout = () => setAuthed(false);
    window.addEventListener("growpilot:login", onLogin);
    window.addEventListener("growpilot:logout", onLogout);
    window.addEventListener("growpilot:unauthorized", onLogout);
    return () => {
      window.removeEventListener("growpilot:login", onLogin);
      window.removeEventListener("growpilot:logout", onLogout);
      window.removeEventListener("growpilot:unauthorized", onLogout);
    };
  }, []);

  if (!mounted || authed) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="h-10 px-5 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2"
      >
        <Gift size={16} />
        免费得积分
      </button>
      <button
        type="button"
        onClick={() => onOpenLogin?.()}
        className="h-10 px-6 rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors text-sm font-semibold"
      >
        登录
      </button>
      <button
        type="button"
        onClick={() => onOpenLogin?.()}
        className="h-10 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-opacity"
      >
        开始创作
      </button>
    </div>
  );
}
