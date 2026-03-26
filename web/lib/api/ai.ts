import apiClient from "./client";

// ─── 模型类型 ────────────────────────────────────────────────────
// "standard" = nano banane  (gemini-2.5-flash-image-preview-0924)
// "pro"      = nano banane pro (gemini-3-pro-image-preview)
export type ImageModelTier = "standard" | "pro";

// ─── 文生图 ─────────────────────────────────────────────────────
export interface Text2ImgRequest {
  prompt: string;
  /** "standard"（nano banane）| "pro"（nano banane pro） */
  model?: ImageModelTier | string;
  aspect_ratio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  number_of_images?: number;
  image_size?: "1K" | "2K";
}

export interface Text2ImgResponse {
  task_id: string;
  image_url: string;
  model: string;
  enhanced_prompt?: string;
}

// ─── 图生图 / 图片编辑 ───────────────────────────────────────────
export interface ImgEditRequest {
  prompt: string;
  image: File;
}

// ─── 换脸 ───────────────────────────────────────────────────────
export interface FaceSwapRequest {
  source_image: File;
  target_image: File;
}

// ─── 文生视频 ───────────────────────────────────────────────────
export interface Text2VideoRequest {
  prompt: string;
  model?: string;
  duration?: number;
  aspect_ratio?: "16:9" | "9:16" | "1:1";
}

export interface TaskResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result_url?: string;
  error?: string;
}

// ─── AI API 封装 ─────────────────────────────────────────────────
export const aiApi = {
  /** 文生图（同步，直接返回图片 URL） */
  text2img(data: Text2ImgRequest): Promise<Text2ImgResponse> {
    return apiClient.post<Text2ImgResponse>("/api/ai/text2img", data);
  },

  /** 图片编辑（multipart） */
  editImage(data: ImgEditRequest): Promise<Text2ImgResponse> {
    const form = new FormData();
    form.append("prompt", data.prompt);
    form.append("image", data.image);
    return apiClient.post<Text2ImgResponse>("/api/ai/img2img", form);
  },

  /** 换脸（multipart） */
  faceSwap(data: FaceSwapRequest): Promise<Text2ImgResponse> {
    const form = new FormData();
    form.append("source_image", data.source_image);
    form.append("target_image", data.target_image);
    return apiClient.post<Text2ImgResponse>("/api/ai/faceswap", form);
  },

  /** 文生视频（异步，返回 task_id，需轮询状态） */
  text2video(data: Text2VideoRequest): Promise<{ task_id: string }> {
    return apiClient.post<{ task_id: string }>("/api/ai/text2video", data);
  },

  /** 查询异步任务状态 */
  getTask(taskId: string): Promise<TaskResponse> {
    return apiClient.get<TaskResponse>(`/api/ai/task/${taskId}`);
  },
};
