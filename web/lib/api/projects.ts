import apiClient from "./client";

// ─── 类型定义 ────────────────────────────────────────────────────

export type ProjectMode = "video" | "image" | "avatar" | "marketing" | "faceswap";
export type ProjectStatus = "draft" | "processing" | "completed" | "failed";

export interface ResultAttachment {
  type: "image" | "video";
  url: string;
  name: string;
}

/** 列表卡片数据（轻量） */
export interface ProjectListItem {
  id: string;
  name: string;
  mode: ProjectMode;
  cover_url?: string;
  status: ProjectStatus;
  progress: number;              // 0-100，processing 时有效
  estimated_minutes?: number;    // 预计剩余分钟
  category?: string;             // 房产 | 教育 | 餐饮
  is_demo: boolean;
  updated_at: string;
}

/** 详情面板数据（完整） */
export interface ProjectDetail extends ProjectListItem {
  model_used?: string;
  aspect_ratio?: string;
  output_count: number;
  prompt?: string;
  result_urls?: ResultAttachment[];
  created_at: string;
}

export interface ProjectListResponse {
  total: number;
  page: number;
  page_size: number;
  items: ProjectListItem[];
}

export interface CreateProjectRequest {
  name: string;
  mode: ProjectMode;
  model_used?: string;
  aspect_ratio?: string;
  output_count?: number;
  prompt?: string;
  cover_url?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: ProjectStatus;
  progress?: number;
  estimated_minutes?: number;
  cover_url?: string;
  result_urls?: string; // JSON string
}

// ─── API 方法 ────────────────────────────────────────────────────

export const projectsApi = {
  /** 分页列表 */
  list(params?: {
    page?: number;
    page_size?: number;
    status?: ProjectStatus;
    mode?: ProjectMode;
  }): Promise<ProjectListResponse> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.status) q.set("status", params.status);
    if (params?.mode) q.set("mode", params.mode);
    const qs = q.toString();
    return apiClient.get<ProjectListResponse>(`/api/projects${qs ? "?" + qs : ""}`);
  },

  /** 详情 */
  get(id: string): Promise<ProjectDetail> {
    return apiClient.get<ProjectDetail>(`/api/projects/${id}`);
  },

  /** 新建 */
  create(data: CreateProjectRequest): Promise<ProjectDetail> {
    return apiClient.post<ProjectDetail>("/api/projects", data);
  },

  /** 更新 */
  update(id: string, data: UpdateProjectRequest): Promise<ProjectDetail> {
    return apiClient.put<ProjectDetail>(`/api/projects/${id}`, data);
  },

  /** 删除 */
  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/projects/${id}`);
  },

  /**
   * 首次登录初始化 demo 数据（幂等，重复调用安全）
   * 返回实际写入的条数，0 表示已初始化过
   */
  initDemo(): Promise<{ seeded: number }> {
    return apiClient.post<{ seeded: number }>("/api/projects/init-demo");
  },
};

// ─── 资产 API ────────────────────────────────────────────────────

export interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "voice";
  url: string;
  size: number;
  created_at: string;
}

export const assetsApi = {
  list(type?: Asset["type"]): Promise<Asset[]> {
    const q = type ? `?type=${type}` : "";
    return apiClient.get<Asset[]>(`/api/assets${q}`);
  },

  upload(file: File, type: Asset["type"]): Promise<Asset> {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    return apiClient.post<Asset>("/api/assets", form);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/assets/${id}`);
  },
};
