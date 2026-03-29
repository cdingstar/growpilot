"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Crown, X, Zap } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const plans = [
  {
    id: "free",
    title: "免费版",
    subtitle: "新用户体验，0成本试水",
    price: null,
    priceUnit: null,
    discountLabel: null,
    discountRate: null,
    highlight: false,
    isEnterprise: false,
    tag: null,
    buttonText: "当前方案",
    disabled: true,
    features: {
      imageDownload: { text: "带水印下载", highlight: false },
      concurrent: { text: "3个任务", highlight: false },
      batchGen: false,
      preCheck: false,
      strategy: false,
      voiceCopy: { text: "1个任务", highlight: false },
    },
  },
  {
    id: "addon",
    title: "只买加油包",
    subtitle: "算力不足，弹性加购场景",
    price: "99-299",
    priceUnit: "元/个",
    discountLabel: null,
    discountRate: null,
    highlight: false,
    isEnterprise: false,
    tag: null,
    buttonText: "立即购买",
    disabled: false,
    features: {
      imageDownload: { text: "无水印下载", highlight: true },
      concurrent: { text: "3个任务", highlight: false },
      batchGen: false,
      preCheck: false,
      strategy: false,
      voiceCopy: { text: "3个任务", highlight: false },
    },
  },
  {
    id: "member",
    title: "会员套餐",
    subtitle: "SKU数量较多的专业卖家",
    price: "259-1999",
    priceUnit: "元/月",
    discountLabel: "88折",
    discountRate: 0.88,
    highlight: false,
    isEnterprise: false,
    tag: null,
    buttonText: "立即购买",
    disabled: false,
    features: {
      imageDownload: { text: "无水印下载", highlight: true },
      concurrent: { text: "6个任务", highlight: true },
      batchGen: false,
      preCheck: false,
      strategy: false,
      voiceCopy: { text: "3个任务", highlight: false },
    },
  },
  {
    id: "enterprise",
    title: "企业解决方案",
    subtitle: "SKU数量较多的电商团队",
    price: "1166-16666",
    priceUnit: "元/月",
    discountLabel: "53折",
    discountRate: 0.53,
    highlight: true,
    isEnterprise: true,
    tag: "高效的多人协作",
    buttonText: "立即购买",
    disabled: false,
    features: {
      imageDownload: { text: "无水印下载", highlight: false },
      concurrent: { text: "50-1000个任务", highlight: false, tip: true },
      batchGen: true,
      preCheck: true,
      strategy: true,
      voiceCopy: { text: "15-300个任务", highlight: false, tip: true },
    },
  },
];

const featureRows = [
  { key: "imageDownload", label: "图片下载" },
  { key: "concurrent", label: "同时生成" },
  { key: "batchGen", label: "批量生图" },
  { key: "preCheck", label: "投前检测" },
  { key: "strategy", label: "专项策略", sub: "装上身效果更佳" },
  { key: "voiceCopy", label: "同时生成" },
];

export default function VipRechargeModal({ open, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState("enterprise");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (el.contains(t)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-[4vh]"
      style={{ zIndex: 100000 }}
    >
      <div
        ref={rootRef}
        className="w-full max-w-5xl h-full max-h-[860px] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex flex-shrink-0 items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Crown size={17} className="text-amber-500" />
            </div>
            <div>
              <div className="text-[17px] font-bold text-gray-900">会员详细权益对比</div>
              <div className="mt-0.5 text-xs text-gray-400">默认年卡享受 53 折，月卡 88 折</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="关闭"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full border-collapse">
            {/* Column headers */}
            <thead>
              <tr>
                {/* Row label column */}
                <th className="w-[160px] min-w-[120px] bg-white" />
                {plans.map((plan) => {
                  const isSelected = selected === plan.id;
                  const isEnt = plan.isEnterprise;
                  return (
                    <th
                      key={plan.id}
                      className="relative p-0 align-top"
                      style={{ width: "calc((100% - 160px) / 4)" }}
                    >
                      {/* Selected glow border — top + sides */}
                      {isSelected && !isEnt && (
                        <div className="absolute inset-0 pointer-events-none z-10 rounded-t-xl ring-2 ring-blue-500 ring-inset" />
                      )}

                      <div
                        onClick={() => !plan.disabled && setSelected(plan.id)}
                        className={[
                          "relative h-full px-5 pt-5 pb-4 text-left transition-all cursor-pointer",
                          isEnt
                            ? "bg-gradient-to-b from-[#6b3a0f] to-[#3d1e06]"
                            : isSelected
                            ? "bg-blue-50"
                            : "bg-gray-50 hover:bg-gray-100/70",
                        ].join(" ")}
                      >
                        {/* Enterprise tag */}
                        {plan.tag && (
                          <div className="absolute top-3 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-l-full">
                            {plan.tag}
                          </div>
                        )}

                        {/* Title */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {isEnt && <Crown size={14} className="text-amber-300 flex-shrink-0" />}
                          <span
                            className={[
                              "text-sm font-bold",
                              isEnt ? "text-amber-100" : "text-gray-800",
                            ].join(" ")}
                          >
                            {plan.title}
                          </span>
                        </div>

                        {/* Subtitle */}
                        <div
                          className={[
                            "text-[11px] leading-tight mb-2",
                            isEnt ? "text-amber-200/70" : "text-gray-400",
                          ].join(" ")}
                        >
                          {plan.subtitle}
                        </div>

                        {/* Price */}
                        {plan.price && (
                          <div
                            className={[
                              "text-base font-extrabold",
                              isEnt ? "text-amber-100" : "text-gray-900",
                            ].join(" ")}
                          >
                            {plan.price}
                            <span
                              className={[
                                "text-xs font-normal ml-0.5",
                                isEnt ? "text-amber-200/70" : "text-gray-400",
                              ].join(" ")}
                            >
                              {plan.priceUnit}
                            </span>
                          </div>
                        )}

                        {/* Discount badge */}
                        {plan.discountLabel && (
                          <div
                            className={[
                              "mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold",
                              isEnt
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-orange-50 text-orange-500 border border-orange-200",
                            ].join(" ")}
                          >
                            <Zap size={10} />
                            限时{plan.discountLabel}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Feature rows */}
            <tbody>
              {featureRows.map((row, ri) => (
                <tr key={row.key} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  {/* Label */}
                  <td className="px-6 py-3.5 text-sm text-gray-700 font-medium align-middle">
                    <div>{row.label}</div>
                    {row.sub && <div className="text-xs text-gray-400 mt-0.5">{row.sub}</div>}
                  </td>

                  {plans.map((plan) => {
                    const isSelected = selected === plan.id;
                    const isEnt = plan.isEnterprise;
                    const feat = (plan.features as Record<string, unknown>)[row.key];

                    return (
                      <td
                        key={plan.id}
                        onClick={() => !plan.disabled && setSelected(plan.id)}
                        className={[
                          "px-5 py-3.5 text-center align-middle text-sm cursor-pointer transition-colors relative",
                          isEnt
                            ? "bg-[#f9ede0]"
                            : isSelected
                            ? "bg-blue-50"
                            : ri % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50/50 hover:bg-gray-100/50",
                        ].join(" ")}
                      >
                        {/* Selected side border for non-enterprise */}
                        {isSelected && !isEnt && (
                          <div className="absolute inset-y-0 left-0 right-0 pointer-events-none ring-x-2 border-x-2 border-blue-500" />
                        )}

                        {feat === false ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-200 text-gray-300">
                            <X size={12} strokeWidth={2.5} />
                          </span>
                        ) : feat === true ? (
                          <span
                            className={[
                              "inline-flex items-center justify-center w-6 h-6 rounded-full",
                              isEnt ? "bg-amber-500" : "bg-blue-500",
                            ].join(" ")}
                          >
                            <Check size={13} strokeWidth={2.5} className="text-white" />
                          </span>
                        ) : typeof feat === "object" && feat !== null ? (
                          <span
                            className={[
                              "text-sm font-medium",
                              (feat as { highlight?: boolean }).highlight
                                ? "text-orange-500 font-bold"
                                : isEnt
                                ? "text-amber-700"
                                : "text-gray-600",
                            ].join(" ")}
                          >
                            {(feat as { text: string }).text}
                            {(feat as { tip?: boolean }).tip && (
                              <span className="ml-0.5 text-gray-400 cursor-help">ⓘ</span>
                            )}
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Buy button row */}
              <tr>
                <td className="px-6 py-5 bg-white" />
                {plans.map((plan) => {
                  const isSelected = selected === plan.id;
                  const isEnt = plan.isEnterprise;

                  return (
                    <td
                      key={plan.id}
                      className={[
                        "px-4 py-5 relative",
                        isEnt
                          ? "bg-[#f9ede0]"
                          : isSelected
                          ? "bg-blue-50"
                          : "bg-white",
                      ].join(" ")}
                    >
                      {/* Bottom border for selected col */}
                      {isSelected && !isEnt && (
                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-blue-500 rounded-b" />
                      )}
                      {isSelected && !isEnt && (
                        <div className="absolute inset-y-0 left-0 right-0 pointer-events-none border-x-2 border-b-2 border-blue-500 rounded-b-xl" />
                      )}

                      {plan.disabled ? (
                        <button
                          disabled
                          className="w-full h-11 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
                        >
                          当前方案
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(plan.id);
                            alert(`已选择${plan.title}，正在跳转支付…`);
                          }}
                          className={[
                            "w-full h-11 rounded-xl text-sm font-bold transition-all whitespace-nowrap px-2",
                            isEnt
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-amber-500/30"
                              : isSelected
                              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30"
                              : "bg-gray-800 hover:bg-gray-700 text-white",
                          ].join(" ")}
                        >
                          {isEnt
                            ? `立即购买（${plan.discountLabel}）`
                            : plan.price
                            ? `立即购买（${plan.discountLabel ?? "原价"}）`
                            : plan.buttonText}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
