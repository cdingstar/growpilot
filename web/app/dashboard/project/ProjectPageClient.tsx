"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeDollarSign, Copy, Loader2, MoreHorizontal, Share2, Trash2, Video, X,
} from "lucide-react";
import NewProjectModal, { type ModeKey } from "@/components/NewProjectModal";
import ValueAddedServiceModal from "@/components/ValueAddedServiceModal";
import ProjectDetailPanel from "./ProjectDetailPanel";
import { projectsApi, type ProjectListItem, type ProjectDetail } from "@/lib/api/projects";

const formatProjectTime = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const buildStatusText = (p: ProjectListItem): string | undefined => {
  if (p.status !== "processing") return undefined;
  const mins = p.estimated_minutes ? `，预计${p.estimated_minutes}分钟` : "";
  return `生成中（${p.progress}%${mins}）`;
};

export default function ProjectPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openDetailIds, setOpenDetailIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | string>("list");
  const [detailCache, setDetailCache] = useState<Record<string, ProjectDetail>>({});
  const [detailLoading, setDetailLoading] = useState(false);

  const [createRequest, setCreateRequest] = useState<{ mode: ModeKey; signal: number } | null>(null);
  const [valueAddedOpen, setValueAddedOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const resp = await projectsApi.list({ page: 1, page_size: 99 });
      setProjects(resp.items);
      setTotal(resp.total);
    } catch (e: any) {
      setLoadError(e?.message || "加载失败，请检查后端服务");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  useEffect(() => {
    const rawMode = searchParams.get("create");
    const mode = rawMode === "video" || rawMode === "image" || rawMode === "avatar" ? rawMode : null;
    if (!mode) return;
    setCreateRequest({ mode, signal: Date.now() });
    router.replace("/dashboard/project");
  }, [router, searchParams]);

  const openDetail = useCallback(async (id: string) => {
    setOpenDetailIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveTab(id);
    if (!detailCache[id]) {
      setDetailLoading(true);
      try {
        const detail = await projectsApi.get(id);
        setDetailCache((prev) => ({ ...prev, [id]: detail }));
      } catch { /* fallback */ } finally { setDetailLoading(false); }
    }
  }, [detailCache]);

  const closeDetail = useCallback((id: string) => {
    setOpenDetailIds((prev) => {
      const next = prev.filter((x) => x !== id);
      if (activeTab === id) setActiveTab(next.length ? next[next.length - 1] : "list");
      return next;
    });
  }, [activeTab]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
      closeDetail(id);
    } catch { /* ignore */ }
  }, [closeDetail]);

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    } catch { /* ignore */ }
  };

  const activeId = activeTab !== "list" ? activeTab : null;
  const activeDetail = activeId ? detailCache[activeId] ?? null : null;
  const activeListItem = activeId ? projects.find((p) => p.id === activeId) ?? null : null;
  const projectNameById = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  const buildPanelDetails = (d: ProjectDetail) => {
    const modeLabel: Record<string, string> = {
      video: "视频生成", image: "图像生成", avatar: "数字人", marketing: "AI营销助手", faceswap: "AI换脸",
    };
    return {
      id: d.id, name: d.name, statusText: buildStatusText(d),
      updatedAt: d.updated_at, cover: d.cover_url ?? "",
      mode: (modeLabel[d.mode] ?? "图像生成") as any,
      model: d.model_used ?? "nano banane pro",
      ratio: d.aspect_ratio ?? "-", count: String(d.output_count ?? 1), advanced: "默认",
      prompt: d.prompt ?? "",
      resultTitle: d.mode === "video" ? "视频预览" : "图片结果",
      resultHint: "点击查看大图",
      attachments: (d.result_urls ?? []).map((a) => ({ type: a.type as "image" | "video", src: a.url, name: a.name })),
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
                <button type="button" onClick={() => { setActiveTab("list"); router.replace("/dashboard/project"); }}
                  className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${activeTab === "list" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
                  我的项目（{total}）
                </button>
                {openDetailIds.map((id) => (
                  <div key={id} className={`h-10 rounded-xl transition-colors ${activeTab === id ? "bg-white/10" : "hover:bg-white/5"}`}>
                    <div className="h-full flex items-center">
                      <button type="button" onClick={() => setActiveTab(id)}
                        className={`h-full pl-4 pr-2 rounded-l-xl text-sm font-bold transition-colors max-w-[260px] truncate ${activeTab === id ? "text-white" : "text-gray-300 hover:text-white"}`}>
                        {projectNameById.get(id) ?? "项目详情"}
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); closeDetail(id); }}
                        className={`h-full pr-3 pl-2 rounded-r-xl transition-colors ${activeTab === id ? "text-gray-200 hover:text-white" : "text-gray-400 hover:text-white"}`}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <button type="button" onClick={() => setValueAddedOpen(true)}
                className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-colors flex items-center gap-2">
                <BadgeDollarSign size={18} className="text-blue-200" />联系专属客服
              </button>
              <NewProjectModal
                defaultMode={createRequest?.mode}
                openSignal={createRequest?.signal}
                onProjectCreated={async (project: any) => {
                  try {
                    const created = await projectsApi.create({
                      name: project.name, mode: project.mode ?? "image",
                      model_used: project.model, aspect_ratio: project.ratio,
                      output_count: Number(project.count) || 1, prompt: project.prompt,
                    });
                    setProjects((prev) => [created, ...prev]);
                    setTotal((t) => t + 1);
                  } catch { loadProjects(); }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ValueAddedServiceModal open={valueAddedOpen} onClose={() => setValueAddedOpen(false)} defaultProjectName={activeListItem?.name} />

      {activeDetail ? (
        <ProjectDetailPanel details={buildPanelDetails(activeDetail)} onClose={() => { if (activeId) closeDetail(activeId); router.replace("/dashboard/project"); }} />
      ) : detailLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 size={32} className="animate-spin text-blue-400" /></div>
      ) : (
        <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 size={32} className="animate-spin text-blue-400" /></div>
          ) : loadError ? (
            <div className="text-center py-24 space-y-3">
              <p className="text-red-400">{loadError}</p>
              <button onClick={loadProjects} className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors">重试</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24 text-gray-500">暂无项目，点击右上角新建</div>
          ) : (
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const statusText = buildStatusText(project);
                  return (
                    <div key={project.id} onClick={() => openDetail(project.id)} className="text-left cursor-pointer group">
                      <div className="relative aspect-video rounded-xl border border-white/5 overflow-hidden bg-white/5">
                        {project.cover_url && <img src={project.cover_url} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />
                        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }} className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md flex items-center justify-center"><Trash2 size={18} className="text-white" /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); copyText(`${window.location.origin}/dashboard/project?id=${project.id}`); }} className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md flex items-center justify-center"><Share2 size={18} className="text-white" /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); openDetail(project.id); }} className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md flex items-center justify-center"><MoreHorizontal size={18} className="text-white" /></button>
                        </div>
                        {statusText && (
                          <>
                            <div className="pointer-events-none absolute left-3 top-14 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                              <div className="max-w-[260px] rounded-xl border border-white/10 bg-[#0F1115] ring-1 ring-white/10 px-3 py-2 text-xs text-white shadow-2xl">
                                <div className="font-semibold">{statusText}</div>
                                <div className="mt-1 text-white/80">提示：点击下方"立即加速"</div>
                              </div>
                            </div>
                            <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all">
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={(e) => e.stopPropagation()} className="px-5 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20">立即加速</button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); copyText(`${project.name}\n${statusText}`); }} className="px-5 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"><Copy size={16} />一键复制</button>
                                <button type="button" onClick={(e) => e.stopPropagation()} className="px-5 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"><Video size={16} />图生视频</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors truncate max-w-[80%]">{statusText ?? project.name}</div>
                        <div className="text-xs text-gray-500 shrink-0">{formatProjectTime(project.updated_at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
