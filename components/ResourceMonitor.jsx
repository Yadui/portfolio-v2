"use client";

import { useEffect, useRef, useState } from "react";

const formatMb = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) {
    return "—";
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Stat = ({ label, value, accent }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[9px] uppercase tracking-[0.18em] text-white/40">{label}</span>
    <span
      className="font-mono text-[11px] tabular-nums text-white"
      style={accent ? { color: accent } : undefined}
    >
      {value}
    </span>
  </div>
);

const ResourceMonitor = () => {
  const [open, setOpen] = useState(true);
  const [stats, setStats] = useState({
    fps: 0,
    frameMs: 0,
    heapUsedMb: null,
    heapLimitMb: null,
    domNodes: 0,
    resources: 0,
    transferKb: 0,
    connection: "—",
  });
  const frameRef = useRef({ frames: 0, last: performance.now(), accum: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const tick = (now) => {
      const state = frameRef.current;
      const delta = now - state.last;
      state.last = now;
      state.frames += 1;
      state.accum += delta;

      if (state.accum >= 500) {
        const fps = Math.round((state.frames * 1000) / state.accum);
        const frameMs = state.accum / state.frames;
        state.frames = 0;
        state.accum = 0;

        const memory = performance.memory ?? null;
        const resourceEntries = performance.getEntriesByType
          ? performance.getEntriesByType("resource")
          : [];
        const transferKb = resourceEntries.reduce(
          (total, entry) => total + (entry.transferSize ?? 0),
          0,
        ) / 1024;
        const connection =
          navigator.connection?.effectiveType ??
          (navigator.onLine ? "online" : "offline");

        if (!cancelled) {
          setStats({
            fps,
            frameMs,
            heapUsedMb: memory?.usedJSHeapSize ?? null,
            heapLimitMb: memory?.jsHeapSizeLimit ?? null,
            domNodes: document.getElementsByTagName("*").length,
            resources: resourceEntries.length,
            transferKb,
            connection,
          });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fpsColor =
    stats.fps >= 50 ? "#34d399" : stats.fps >= 30 ? "#facc15" : "#f87171";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex justify-center print:hidden">
      <div className="pointer-events-auto m-2 flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-white shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/20"
          aria-expanded={open}
          aria-label="Toggle resource monitor"
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: fpsColor }}
          />
          Monitor
        </button>

        {open ? (
          <div className="flex items-center gap-3">
            <Stat label="FPS" value={stats.fps} accent={fpsColor} />
            <Stat label="Frame" value={`${stats.frameMs.toFixed(1)}ms`} />
            <Stat
              label="Heap"
              value={
                stats.heapUsedMb
                  ? `${formatMb(stats.heapUsedMb)} / ${formatMb(stats.heapLimitMb)}`
                  : "n/a"
              }
            />
            <Stat label="DOM" value={stats.domNodes.toLocaleString()} />
            <Stat
              label="Net"
              value={`${stats.resources} · ${stats.transferKb.toFixed(0)} KB`}
            />
            <Stat label="Conn" value={stats.connection} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResourceMonitor;
