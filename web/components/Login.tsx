"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, User, X } from "lucide-react";
import { authApi } from "../lib/api/auth";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  canClose?: boolean; // 默认 true；false 时隐藏关闭按钮且遮罩不可关闭
}

const TEST_ACCOUNTS = [
  { label: "测试1", email: "test1@growpilot.com", password: "Test1234" },
  { label: "测试2", email: "test2@growpilot.com", password: "Test1234" },
  { label: "演示账号", email: "demo@growpilot.com", password: "Demo1234" },
];

export default function Login({ isOpen, onClose, onSuccess, canClose = true }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) { setError(""); setMode("login"); }
  }, [isOpen]);

  // 移除自动登录逻辑，避免在凭证失效或后端未就绪时导致死循环
  // 如果需要测试账号，建议在界面上提供“填充测试账号”的按钮，而不是自动提交
  /*
  useEffect(() => {
    if (!isOpen || !mounted) return;
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    // ...
  }, [isOpen, mounted]);
  */

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      let resp;
      if (mode === "login") {
        resp = await authApi.login({ email, password });
      } else {
        resp = await authApi.register({ email, password, name: name || email.split("@")[0] });
      }
      localStorage.setItem("access_token", resp.access_token);
      localStorage.setItem("refresh_token", resp.refresh_token);
      localStorage.setItem("growpilot_user", JSON.stringify(resp.user));
      // 通知所有组件（UserMenu、layout 等）登录态已更新
      window.dispatchEvent(new CustomEvent("growpilot:login", { detail: { user: resp.user } }));
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      {/* 背景遮罩：canClose 时可点击关闭 */}
      <div className="absolute inset-0" onClick={() => canClose && !loading && onClose()} />
      {/* 居中内容 */}
      <div className="relative flex items-center justify-center min-h-full p-4 md:p-8 pointer-events-none">
      <div className="pointer-events-auto relative w-[min(806px,95vw)] overflow-hidden rounded-[32px] border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10">
        {canClose && (
          <button type="button" aria-label="关闭" onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        )}

        <div className="grid md:grid-cols-2 max-h-[calc(100svh-2rem)] md:max-h-[calc(100svh-4rem)]">
          <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop)" }} />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-black/30" />
            <div className="relative text-sm text-white tracking-wide">Build Growth Once, Scale Everywhere</div>
          </div>

          <div className="min-h-0 overflow-y-auto p-6 md:p-10 text-white">
            <div className="mb-6">
              <div className="text-2xl md:text-3xl font-bold text-white">{mode === "login" ? "欢迎回来" : "创建账号"}</div>
              <div className="mt-2 text-sm text-gray-300 flex items-center gap-2">
                <span>{mode === "login" ? "还没有账号？" : "已有账号？"}</span>
                <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  {mode === "login" ? "立即注册" : "去登录"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-gray-500 mb-2">快速填入测试账号</div>
                <div className="flex flex-wrap gap-2">
                  {TEST_ACCOUNTS.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => { setEmail(a.email); setPassword(a.password); setError(""); }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-gray-200 transition-colors"
                    >
                      <span className="font-semibold">{a.label}</span>
                      <span className="ml-1.5 text-gray-400">{a.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === "register" && (
                <div className="h-12 flex items-center gap-3 px-4 bg-[#0B0E14] border border-white/10 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <User size={18} className="text-gray-400 shrink-0" />
                  <input type="text" placeholder="昵称（选填）" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none" />
                </div>
              )}
              <div className="h-12 flex items-center gap-3 px-4 bg-[#0B0E14] border border-white/10 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <User size={18} className="text-gray-400 shrink-0" />
                <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none" required />
              </div>
              <div className="h-12 flex items-center gap-3 px-4 bg-[#0B0E14] border border-white/10 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <Lock size={18} className="text-gray-400 shrink-0" />
                <input type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none" required minLength={6} />
              </div>

              {error && <div className="text-sm text-red-400 px-1">{error}</div>}

              <button type="submit" disabled={loading}
                className="mt-2 w-full h-12 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (mode === "login" ? "登录中..." : "注册中...") : (mode === "login" ? "登录" : "注册")}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
}
