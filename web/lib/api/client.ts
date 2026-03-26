/**
 * GrowPilot API Client
 * 统一的后端请求封装，所有接口调用都通过此模块
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// ─── 通用响应类型 ───────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

// ─── 错误类型 ───────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── 从 localStorage 读取 Token ─────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

// ─── 核心 fetch 封装 ────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // multipart/form-data 时让浏览器自动设置 Content-Type（含 boundary）
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok && res.status === 401) {
    // 登录 / 注册接口的 401 直接抛出，不做任何页面跳转
    if (path === "/api/auth/login" || path === "/api/auth/register") {
      const json = await res.json();
      throw new ApiError(401, json.msg || "用户名或密码错误");
    }

    // 其他接口 Token 失效：清除凭证并通过事件通知 layout 弹出登录框
    // 不使用 window.location.href 跳转，避免页面硬刷新和重定向循环
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new CustomEvent("growpilot:unauthorized"));

    throw new ApiError(401, "请重新登录");
  }

  const json: ApiResponse<T> = await res.json();

  if (json.code !== 0) {
    throw new ApiError(json.code, json.msg);
  }

  return json.data;
}

// ─── HTTP 方法快捷函数 ──────────────────────────────────────────
export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },

  /**
   * 流式请求（SSE），用于 AI 营销助手聊天
   * 返回 ReadableStream，调用方自行处理 chunk
   */
  stream(path: string, body: unknown): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  },
};

export default apiClient;
