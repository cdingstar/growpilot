"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Crown, X, Zap } from "lucide-react";

/* ── Shimmer keyframe injected once ── */
const SHIMMER_STYLE_ID = "vip-modal-shimmer";
if (typeof document !== "undefined" && !document.getElementById(SHIMMER_STYLE_ID)) {
  const s = document.createElement("style");
  s.id = SHIMMER_STYLE_ID;
  s.textContent = `
    @keyframes vip-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .vip-btn-shimmer {
      background-size: 200% auto !important;
      animation: vip-shimmer 2s linear infinite !important;
    }
    .vip-btn-shimmer-gold {
      background-image: linear-gradient(90deg,#b8860b 0%,#f5c842 25%,#fffbe0 50%,#f5c842 75%,#b8860b 100%) !important;
    }
    .vip-btn-shimmer-blue {
      background-image: linear-gradient(90deg,#1d4ed8 0%,#3b82f6 25%,#93c5fd 50%,#3b82f6 75%,#1d4ed8 100%) !important;
    }
  `;
  document.head.appendChild(s);
}

type Props = {
  open: boolean;
  onClose: () => void;
};

// 定价说明：
// 免费版：无费用
// 加油包：199元，无折扣，无时限，积分=199*100=19900
// 月卡：原价449元/月，优惠399元，折扣≈89折，积分=449*100=44900，当月发放
// 年卡：原价449*12=5388元，优惠2999元，折扣≈53折，积分=5388*100=538800，当月发放
const plans = [
  {
    id: "free",
    title: "免费版",
    subtitle: "新用户体验，0成本试水",
    originalPrice: null,
    payPrice: null,
    priceDisplay: null,
    priceUnit: null,
    discountLabel: null,
    credits: null,
    timeLimited: false,
    isAnnual: false,
    tag: null,
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
    originalPrice: 199,
    payPrice: 199,
    priceDisplay: "199",
    priceUnit: "元/个",
    discountLabel: null,
    credits: 19900,
    timeLimited: false,
    isAnnual: false,
    tag: null,
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
    id: "monthly",
    title: "月卡会员",
    subtitle: "专业卖家，当月积分立即到账",
    originalPrice: 449,
    payPrice: 399,
    priceDisplay: "449",
    priceUnit: "元/月",
    discountLabel: "89折",
    credits: 44900,
    timeLimited: true,
    isAnnual: false,
    tag: null,
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
    id: "annual",
    title: "年卡会员",
    subtitle: "超值年付，当月积分立即到账",
    originalPrice: 5388,
    payPrice: 2999,
    priceDisplay: "5388",
    priceUnit: "元/年",
    discountLabel: "53折",
    credits: 538800,
    timeLimited: true,
    isAnnual: true,
    tag: "最超值",
    disabled: false,
    features: {
      imageDownload: { text: "无水印下载", highlight: false },
      concurrent: { text: "6个任务", highlight: false },
      batchGen: true,
      preCheck: true,
      strategy: true,
      voiceCopy: { text: "6个任务", highlight: false },
    },
  },
];

const featureRows = [
  { key: "imageDownload", label: "图片下载" },
  { key: "concurrent", label: "同时生成" },
  { key: "batchGen", label: "批量生图" },
  { key: "preCheck", label: "投前检测" },
  { key: "strategy", label: "专项策略", sub: "装上身效果更佳" },
  { key: "voiceCopy", label: "视频生成" },
];

export default function VipRechargeModal({ open, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState("annual");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 py-[4vh]"
      style={{ zIndex: 100000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        ref={rootRef}
        className="w-full max-w-5xl h-full max-h-[860px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "#0F1115",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="px-7 py-5 flex flex-shrink-0 items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#d4a017 0%,#f5c842 100%)",
                boxShadow: "0 4px 14px rgba(212,160,23,0.35)",
              }}
            >
              <Crown size={18} className="text-black" />
            </div>
            <div>
              <div className="text-[17px] font-bold text-white tracking-tight">会员详细权益对比</div>
              <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                月卡 399元（89折）· 年卡 2999元（53折）· 积分当月到账
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            aria-label="关闭"
          >
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* row-label col */}
                <th className="w-[148px] min-w-[110px]" style={{ background: "#0F1115" }} />

                {plans.map((plan) => {
                  const isSel = selected === plan.id;
                  const isAnn = plan.isAnnual;

                  // column header bg
                  const hdrBg = isAnn
                    ? "linear-gradient(160deg,#1a1200 0%,#2a1e00 60%,#1a1200 100%)"
                    : isSel
                    ? "linear-gradient(180deg,#0d1f3c 0%,#0a1628 100%)"
                    : "rgba(255,255,255,0.03)";

                  return (
                    <th
                      key={plan.id}
                      className="relative p-0 align-top"
                      style={{ width: "calc((100% - 148px) / 4)" }}
                    >
                      {/* blue glow border for selected non-annual */}
                      {isSel && !isAnn && (
                        <div
                          className="absolute inset-0 pointer-events-none z-10 rounded-t-xl"
                          style={{
                            boxShadow: "inset 0 0 0 2px #3b82f6, 0 0 18px rgba(59,130,246,0.18)",
                          }}
                        />
                      )}
                      {/* gold glow border for annual */}
                      {isAnn && (
                        <div
                          className="absolute inset-0 pointer-events-none z-10 rounded-t-xl"
                          style={{
                            boxShadow: "inset 0 0 0 1.5px rgba(212,160,23,0.6), 0 0 24px rgba(212,160,23,0.12)",
                          }}
                        />
                      )}

                      <div
                        onClick={() => !plan.disabled && setSelected(plan.id)}
                        className="relative h-full px-4 pt-5 pb-4 text-left cursor-pointer transition-all"
                        style={{ background: hdrBg }}
                      >
                        {/* tag */}
                        {plan.tag && (
                          <div
                            className="absolute top-3 right-0 text-[10px] font-bold px-2 py-0.5 rounded-l-full"
                            style={{
                              background: isAnn
                                ? "linear-gradient(90deg,#d4a017,#f5c842)"
                                : "#ef4444",
                              color: isAnn ? "#000" : "#fff",
                            }}
                          >
                            {plan.tag}
                          </div>
                        )}

                        {/* title */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {isAnn && <Crown size={13} style={{ color: "#f5c842", flexShrink: 0 }} />}
                          <span
                            className="text-sm font-bold"
                            style={{ color: isAnn ? "#f5c842" : isSel ? "#60a5fa" : "rgba(255,255,255,0.85)" }}
                          >
                            {plan.title}
                          </span>
                        </div>

                        {/* subtitle */}
                        <div
                          className="text-[11px] leading-tight mb-2"
                          style={{ color: isAnn ? "rgba(245,200,66,0.55)" : "rgba(255,255,255,0.35)" }}
                        >
                          {plan.subtitle}
                        </div>

                        {/* price */}
                        {plan.priceDisplay && (
                          <div
                            className="text-base font-extrabold"
                            style={{ color: isAnn ? "#fde68a" : "rgba(255,255,255,0.9)" }}
                          >
                            {plan.priceDisplay}
                            <span
                              className="text-xs font-normal ml-0.5"
                              style={{ color: isAnn ? "rgba(253,230,138,0.5)" : "rgba(255,255,255,0.35)" }}
                            >
                              {plan.priceUnit}
                            </span>
                          </div>
                        )}

                        {/* credits */}
                        {plan.credits && (
                          <div
                            className="text-[11px] mt-0.5"
                            style={{ color: isAnn ? "rgba(212,160,23,0.7)" : "rgba(255,255,255,0.3)" }}
                          >
                            赠 {plan.credits.toLocaleString()} 积分
                          </div>
                        )}

                        {/* discount badge */}
                        {plan.discountLabel && (
                          <div
                            className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold"
                            style={
                              isAnn
                                ? {
                                    background: "rgba(212,160,23,0.15)",
                                    border: "1px solid rgba(212,160,23,0.4)",
                                    color: "#f5c842",
                                  }
                                : {
                                    background: "rgba(59,130,246,0.12)",
                                    border: "1px solid rgba(59,130,246,0.3)",
                                    color: "#60a5fa",
                                  }
                            }
                          >
                            <Zap size={9} />
                            限时{plan.discountLabel}
                          </div>
                        )}

                        {/* no-discount badge */}
                        {!plan.discountLabel && !plan.timeLimited && plan.payPrice && (
                          <div
                            className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            永久有效
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {featureRows.map((row, ri) => {
                const rowBg = ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.025)";
                return (
                  <tr key={row.key}>
                    {/* label */}
                    <td
                      className="px-5 py-3.5 text-sm font-medium align-middle"
                      style={{ background: "#0F1115", color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <div>{row.label}</div>
                      {row.sub && (
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {row.sub}
                        </div>
                      )}
                    </td>

                    {plans.map((plan) => {
                      const isSel = selected === plan.id;
                      const isAnn = plan.isAnnual;
                      const feat = (plan.features as Record<string, unknown>)[row.key];

                      const cellBg = isAnn
                        ? "rgba(212,160,23,0.06)"
                        : isSel
                        ? "rgba(59,130,246,0.07)"
                        : rowBg;

                      return (
                        <td
                          key={plan.id}
                          onClick={() => !plan.disabled && setSelected(plan.id)}
                          className="px-4 py-3.5 text-center align-middle text-sm cursor-pointer transition-colors relative"
                          style={{
                            background: cellBg,
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {/* side borders for selected col */}
                          {isSel && !isAnn && (
                            <div
                              className="absolute inset-y-0 left-0 right-0 pointer-events-none"
                              style={{ borderLeft: "2px solid #3b82f6", borderRight: "2px solid #3b82f6" }}
                            />
                          )}
                          {isAnn && (
                            <div
                              className="absolute inset-y-0 left-0 right-0 pointer-events-none"
                              style={{
                                borderLeft: "1.5px solid rgba(212,160,23,0.4)",
                                borderRight: "1.5px solid rgba(212,160,23,0.4)",
                              }}
                            />
                          )}

                          {feat === false ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                              style={{ border: "1.5px solid rgba(255,255,255,0.12)" }}
                            >
                              <X size={11} strokeWidth={2.5} style={{ color: "rgba(255,255,255,0.2)" }} />
                            </span>
                          ) : feat === true ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                              style={
                                isAnn
                                  ? { background: "linear-gradient(135deg,#d4a017,#f5c842)", boxShadow: "0 2px 8px rgba(212,160,23,0.4)" }
                                  : { background: "linear-gradient(135deg,#2563eb,#3b82f6)", boxShadow: "0 2px 8px rgba(59,130,246,0.35)" }
                              }
                            >
                              <Check size={13} strokeWidth={2.5} className="text-white" />
                            </span>
                          ) : typeof feat === "object" && feat !== null ? (
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: (feat as { highlight?: boolean }).highlight
                                  ? "#f97316"
                                  : isAnn
                                  ? "rgba(245,200,66,0.8)"
                                  : "rgba(255,255,255,0.55)",
                                fontWeight: (feat as { highlight?: boolean }).highlight ? 700 : 500,
                              }}
                            >
                              {(feat as { text: string }).text}
                              {(feat as { tip?: boolean }).tip && (
                                <span className="ml-0.5 cursor-help" style={{ color: "rgba(255,255,255,0.3)" }}>ⓘ</span>
                              )}
                            </span>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ── Buy button row ── */}
              <tr>
                <td className="px-5 py-5" style={{ background: "#0F1115" }} />
                {plans.map((plan) => {
                  const isSel = selected === plan.id;
                  const isAnn = plan.isAnnual;

                  let btnText = "当前方案";
                  if (!plan.disabled) {
                    btnText = plan.discountLabel
                      ? `立即购买（${plan.payPrice}元，${plan.discountLabel}优惠）`
                      : `立即购买（${plan.payPrice}元，无折扣）`;
                  }

                  const cellBg = isAnn
                    ? "rgba(212,160,23,0.06)"
                    : isSel
                    ? "rgba(59,130,246,0.07)"
                    : "#0F1115";

                  return (
                    <td
                      key={plan.id}
                      className="px-4 py-5 relative"
                      style={{ background: cellBg }}
                    >
                      {/* bottom border for selected */}
                      {isSel && !isAnn && (
                        <div
                          className="absolute inset-y-0 left-0 right-0 pointer-events-none rounded-b-xl"
                          style={{
                            borderLeft: "2px solid #3b82f6",
                            borderRight: "2px solid #3b82f6",
                            borderBottom: "2px solid #3b82f6",
                          }}
                        />
                      )}
                      {isAnn && (
                        <div
                          className="absolute inset-y-0 left-0 right-0 pointer-events-none rounded-b-xl"
                          style={{
                            borderLeft: "1.5px solid rgba(212,160,23,0.4)",
                            borderRight: "1.5px solid rgba(212,160,23,0.4)",
                            borderBottom: "1.5px solid rgba(212,160,23,0.4)",
                          }}
                        />
                      )}

                      {plan.disabled ? (
                        <button
                          disabled
                          className="w-full h-11 rounded-xl text-sm font-semibold cursor-not-allowed"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          当前方案
                        </button>
                      ) : (() => {
                        // 流光动画：当前选中列播放；若无选中（默认 annual）则年卡播放
                        const isAnimated = isSel;
                        const shimmerClass = isAnimated
                          ? isAnn
                            ? "vip-btn-shimmer vip-btn-shimmer-gold"
                            : "vip-btn-shimmer vip-btn-shimmer-blue"
                          : "";

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(plan.id);
                              alert(`已选择${plan.title}，正在跳转支付…`);
                            }}
                            className={`w-full h-11 rounded-xl text-[13px] font-bold transition-all px-2 leading-tight ${shimmerClass}`}
                            style={
                              isAnn
                                ? {
                                    background: isAnimated ? undefined : "linear-gradient(90deg,#b8860b 0%,#d4a017 40%,#f5c842 100%)",
                                    color: "#000",
                                    boxShadow: isAnimated
                                      ? "0 4px 20px rgba(212,160,23,0.55)"
                                      : "0 4px 16px rgba(212,160,23,0.4)",
                                  }
                                : isSel
                                ? {
                                    background: isAnimated ? undefined : "linear-gradient(90deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%)",
                                    color: "#fff",
                                    boxShadow: isAnimated
                                      ? "0 4px 20px rgba(59,130,246,0.55)"
                                      : "0 4px 16px rgba(59,130,246,0.4)",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.07)",
                                    color: "rgba(255,255,255,0.7)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }
                            }
                          >
                            {btnText}
                          </button>
                        );
                      })()}
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

  return createPortal(modal, document.body);
}
