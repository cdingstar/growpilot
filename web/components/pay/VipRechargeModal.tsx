"use client";

import { useEffect, useRef } from "react";
import { BadgeDollarSign, Crown, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const plans = [
  {
    id: "monthly",
    title: "月卡",
    discountLabel: "88折",
    pay: 88,
    highlight: false,
    features: ["无水印下载", "标准队列", "3个并发任务"],
  },
  {
    id: "quarterly",
    title: "季卡",
    discountLabel: "75折",
    pay: 228,
    highlight: false,
    features: ["无水印下载", "优先队列", "4个并发任务"],
  },
  {
    id: "half-year",
    title: "半年卡",
    discountLabel: "65折",
    pay: 408,
    highlight: false,
    features: ["无水印下载", "优先队列", "5个并发任务"],
  },
  {
    id: "annual",
    title: "年卡",
    discountLabel: "53折",
    pay: 888,
    highlight: true,
    features: ["无水印下载", "最高优先队列", "6个并发任务"],
  },
];

export default function VipRechargeModal({ open, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      style={{ zIndex: 100000 }}
    >
      <div
        ref={rootRef}
        className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/10 flex flex-shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <BadgeDollarSign size={18} className="text-blue-200" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-white">会员特惠</div>
              <div className="mt-0.5 text-xs text-gray-400">默认年卡享受 53 折，月卡 88 折</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
            aria-label="关闭"
          >
            <X size={18} className="text-gray-200" />
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => {
              return (
                <div
                  key={p.id}
                  className={
                    p.highlight
                      ? "relative rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-transparent p-5"
                      : "relative rounded-2xl border border-white/10 bg-white/5 p-5"
                  }
                >
                  {p.highlight ? (
                    <div className="absolute -right-2 -top-2">
                      <div className="px-2 py-0.5 rounded-md bg-yellow-500 text-black text-[11px] font-extrabold shadow">
                        热卖
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={18} className={p.highlight ? "text-yellow-300" : "text-gray-300"} />
                      <div className="text-base font-extrabold text-white">{p.title}</div>
                    </div>
                    <div
                      className={
                        p.highlight
                          ? "px-2 py-0.5 rounded bg-yellow-400/20 border border-yellow-500/30 text-yellow-200 text-xs font-bold"
                          : "px-2 py-0.5 rounded bg-white/10 border border-white/10 text-gray-300 text-xs font-bold"
                      }
                    >
                      {p.discountLabel}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          alert(`已选择购买${p.title}，支付${p.pay}元（${p.discountLabel}）`);
                        } catch {}
                        onClose();
                      }}
                      className={
                              p.highlight
                                ? "w-full h-12 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-extrabold whitespace-nowrap transition-colors"
                                : "w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold whitespace-nowrap transition-colors"
                            }
                    >
                      立即购买（支付{p.pay}元，{p.discountLabel}）
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
