/**
 * GrowPilot 模型配置
 *
 * nano banane     → gemini-2.5-flash-image-preview-0924  （快速、标准质量）
 * nano banane pro → gemini-3-pro-image-preview             （高质量、更强理解）
 */

export interface ModelOption {
  /** 传给后端的 model 参数值 */
  value: string;
  /** 界面显示名称 */
  label: string;
  /** 描述 */
  description: string;
  /** 实际 Gemini 模型名（仅供展示/参考） */
  geminiModel: string;
  /** 是否为 Pro 级别 */
  isPro: boolean;
}

export const IMAGE_MODELS: ModelOption[] = [
  {
    value: "standard",
    label: "nano banane",
    description: "快速生成，适合日常创作",
    geminiModel: "gemini-2.5-flash-image-preview-0924",
    isPro: false,
  },
  {
    value: "pro",
    label: "nano banane pro",
    description: "高质量输出，适合精品内容",
    geminiModel: "gemini-3-pro-image-preview",
    isPro: true,
  },
];

/** 默认图片模型 */
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0];

/** 根据 value 查找模型配置 */
export function findModel(value: string): ModelOption {
  return IMAGE_MODELS.find((m) => m.value === value) ?? DEFAULT_IMAGE_MODEL;
}
