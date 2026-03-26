"use client";

import { useMemo, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatInputBox from "@/components/chat/ChatInputBox";
import RoleBubble from "@/components/chat/RoleBubble";
import ModeSwitcher from "./components/ModeSwitcher";
import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import CanvasView from "./components/CanvasView";

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const RECOMMENDED_SETS = [
  ["直播话术生成", "带货脚本生成", "短视频拍摄脚本", "爆款脚本仿写"],
  ["小红书标题优化", "朋友圈种草文案", "评论区引导话术", "直播间开场白"],
  ["产品卖点提炼", "竞品对比表", "投放素材拆解", "落地页结构建议"],
  ["短视频选题库", "15 秒口播模板", "剧情反转脚本", "直播间复盘清单"],
  ["私域社群话术", "活动促销文案", "门店同城引流", "达人合作邀约"],
];

const INITIAL_THREADS = [
  { id: "t1", title: "智能体使用示例-亚马逊" },
  { id: "t2", title: "智能体使用示例-淘宝" },
  { id: "t3", title: "未命名" },
  { id: "t4", title: "未命名" },
];

const INITIAL_MESSAGES = [
  {
    id: "m1",
    role: "assistant",
    content: "我可以作为 AI营销助手，帮你把常用的内容与增长任务变成可复用的模板。你可以在上方选择一个类型开始。",
  },
  {
    id: "m2",
    role: "assistant",
    content: "你也可以直接选择右侧推荐工具：我会按你当前目标，给出结构化产出（标题/脚本/卖点/话术等）。",
  },
];

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function MarketingAssistantPageClient() {
  const [mode, setMode] = useState("chat");
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [activeTool, setActiveTool] = useState("chat");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [canvasDraft, setCanvasDraft] = useState("");
  const [query, setQuery] = useState("");
  const [recommendIndex, setRecommendIndex] = useState(0);

  const recommendedTools = useMemo(
    () => RECOMMENDED_SETS[recommendIndex % RECOMMENDED_SETS.length],
    [recommendIndex]
  );

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? INITIAL_THREADS.filter((t) => t.title.toLowerCase().includes(q)) : INITIAL_THREADS;
  }, [query]);

  const send = async (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    const apiKey = window.localStorage.getItem("gemini_api_key")?.trim();
    setDraft("");
    setCanvasDraft("");
    const now = Date.now();
    const aiMsgId = `a_${now}`;

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { id: `u_${now}`, role: "user", content: trimmed },
        { id: aiMsgId, role: "assistant", content: "请先在右上角头像 -> [我的资料] 中设置 Gemini API Key。" },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: `u_${now}`, role: "user", content: trimmed },
      { id: aiMsgId, role: "assistant", content: "思考中..." },
    ]);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: "你是一个专业的AI营销助手，擅长内容创作与流量增长。",
      });

      const history = messages
        .filter((m) => m.id !== "m1" && m.id !== "m2")
        .slice(-50)
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

      const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 8192 } });
      const result = await chat.sendMessageStream(trimmed);
      let fullText = "";
      for await (const chunk of result.stream) {
        fullText += chunk.text();
        setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: fullText } : m)));
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      let errMsg = error.message || "未知错误";
      if (errMsg.includes("404") || errMsg.includes("not found")) {
        errMsg += " (请检查：1. API Key 是否有多余空格；2. 代理节点是否为美国/新加坡，Gemini 不支持香港/CN 节点)";
      }
      setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: `请求失败: ${errMsg}` } : m)));
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-white/5 bg-[#0F1115] overflow-hidden">
      {/* 顶部模式切换 */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-4">
        <ModeSwitcher mode={mode} onChange={setMode} />
      </div>

      {mode === "chat" ? (
        /* ══ 对话模式 ══ */
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[680px]">
          <ChatSidebar
            threads={filteredThreads}
            activeThreadId={activeThreadId}
            query={query}
            onQueryChange={setQuery}
            onSelectThread={setActiveThreadId}
            onNewThread={() => setActiveThreadId(`t_${Date.now()}`)}
          />

          <div className="flex flex-col">
            <ChatHeader
              activeTool={activeTool}
              onToolChange={setActiveTool}
              recommendedTools={recommendedTools}
              onRefreshRecommend={() => setRecommendIndex((v) => v + 1)}
              onUseRecommend={(title) => setDraft((prev) => (prev.trim() ? prev : `${title}：`))}
            />

            <div className="flex-1 px-6 py-5 overflow-y-auto">
              <div className="space-y-3">
                {messages.map((m) => (
                  <RoleBubble key={m.id} role={m.role}>
                    {m.content}
                  </RoleBubble>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 bg-[#0B0D10]">
              <ChatInputBox draft={draft} setDraft={setDraft} onSend={() => send(draft)} />
            </div>
          </div>
        </div>
      ) : (
        /* ══ 画布模式 ══ */
        <CanvasView
          draft={canvasDraft}
          setDraft={setCanvasDraft}
          onSend={() => send(canvasDraft)}
        />
      )}
    </div>
  );
}
