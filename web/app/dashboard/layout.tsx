"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import CreateTeamModal from "@/components/shell/CreateTeamModal";
import DashboardSidebar from "@/components/shell/DashboardSidebar";
import Login from "@/components/Login";
import { projectsApi } from "@/lib/api/projects";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  // 检查登录态
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAuthed(true);
    }
  }, []);

  // 监听登录成功事件：更新 layout 的 authed 状态
  useEffect(() => {
    const handleLogin = () => {
      setAuthed(true);
      setIsLoginOpen(false);
    };
    window.addEventListener("growpilot:login", handleLogin);
    return () => window.removeEventListener("growpilot:login", handleLogin);
  }, []);

  // 监听 Token 失效 / 退出事件：弹出登录框，不强制刷新页面
  useEffect(() => {
    const showLogin = () => {
      setAuthed(false);
      setIsLoginOpen(true);
    };
    window.addEventListener("growpilot:unauthorized", showLogin);
    window.addEventListener("growpilot:logout", showLogin);
    return () => {
      window.removeEventListener("growpilot:unauthorized", showLogin);
      window.removeEventListener("growpilot:logout", showLogin);
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#0B0D10] text-white flex">
        <DashboardSidebar isOpen={isSidebarOpen} />

        <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
          <Header
            onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
            onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
          />

          <div className="flex-1 p-8 overflow-y-auto">{children}</div>
        </main>

        <CreateTeamModal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
      </div>

      <Login
        isOpen={isLoginOpen}
        canClose={true}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
          setAuthed(true);
          projectsApi.initDemo().catch(() => {});
        }}
      />
    </>
  );
}
