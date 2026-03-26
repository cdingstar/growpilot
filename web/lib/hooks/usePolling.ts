"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PollingOptions<T> {
  /** 轮询函数，返回最新状态 */
  fetchFn: () => Promise<T>;
  /** 轮询间隔（ms），默认 2000 */
  interval?: number;
  /** 停止轮询的判断条件 */
  shouldStop: (data: T) => boolean;
  /** 是否立即开始（默认 false，手动调用 start） */
  immediate?: boolean;
}

/**
 * usePolling — 通用任务轮询 Hook
 * 用于文生视频等异步任务的状态追踪
 *
 * @example
 * const { data, isPolling, start } = usePolling({
 *   fetchFn: () => aiApi.getTask(taskId),
 *   shouldStop: (d) => d.status === "completed" || d.status === "failed",
 * });
 */
export function usePolling<T>({
  fetchFn,
  interval = 2000,
  shouldStop,
  immediate = false,
}: PollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsPolling(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const tick = useCallback(async () => {
    if (!activeRef.current) return;
    try {
      const result = await fetchFn();
      setData(result);
      if (shouldStop(result)) {
        stop();
        return;
      }
    } catch (err) {
      setError(err as Error);
      stop();
      return;
    }
    if (activeRef.current) {
      timerRef.current = setTimeout(tick, interval);
    }
  }, [fetchFn, interval, shouldStop, stop]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsPolling(true);
    setError(null);
    tick();
  }, [tick]);

  useEffect(() => {
    if (immediate) start();
    return stop;
  }, [immediate, start, stop]);

  return { data, isPolling, error, start, stop };
}
