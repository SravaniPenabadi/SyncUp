import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../lib/axios";

const COLORS = {
  low: { start: "#ef4444", end: "#f87171", glow: "rgba(239,68,68,0.5)" },
  mid: { start: "#f59e0b", end: "#fbbf24", glow: "rgba(245,158,11,0.5)" },
  high: { start: "#22c55e", end: "#4ade80", glow: "rgba(34,197,94,0.5)" },
};

const getLevel = (score) => {
  if (score >= 70) return "high";
  if (score >= 30) return "mid";
  return "low";
};

const LABELS = {
  volume: "Message Volume",
  responseTime: "Response Speed",
  streak: "Daily Streak",
  balance: "Conversation Balance",
  recency: "Recency",
  variety: "Media Variety",
  momentum: "Momentum",
};

const MAX_SCORES = {
  volume: 25,
  responseTime: 20,
  streak: 15,
  balance: 15,
  recency: 10,
  variety: 10,
  momentum: 5,
};

const SyncMeter = ({ userId, refreshToken = 0 }) => {
  const [score, setScore] = useState(0);
  const [label, setLabel] = useState("");
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setScore(0);
      setLabel("");
      setBreakdown(null);
      setLoading(false);
      return undefined;
    }

    let isActive = true;
    setLoading(true);

    axiosInstance
      .get(`/messages/sync/${userId}`)
      .then((res) => {
        if (isActive) {
          setScore(res.data.score ?? 0);
          setLabel(res.data.label ?? "");
          setBreakdown(res.data.breakdown ?? null);
        }
      })
      .catch(() => {
        if (isActive) {
          setScore(0);
          setLabel("");
          setBreakdown(null);
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [userId, refreshToken]);

  // Animate score counter
  useEffect(() => {
    const target = score;
    const duration = 800;
    const startTime = Date.now();
    const startVal = animatedScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      setAnimatedScore(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Close tooltip on outside click
  useEffect(() => {
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="sync-gauge-skeleton" />
        <div className="h-3 w-16 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
    );
  }

  const level = getLevel(animatedScore);
  const colors = COLORS[level];

  // SVG arc gauge parameters
  const radius = 22;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270-degree arc
  const filledLength = (animatedScore / 100) * arcLength;

  return (
    <div className="relative flex items-center gap-2" ref={tooltipRef}>
      {/* Circular Gauge */}
      <button
        type="button"
        className="relative sync-gauge-btn"
        onClick={() => setShowTooltip((p) => !p)}
        title={`Sync Score: ${score}/100 — Click for details`}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          className="sync-gauge-svg"
          style={{ filter: `drop-shadow(0 0 6px ${colors.glow})` }}
        >
          {/* Background arc */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(135 26 26)"
          />
          {/* Filled arc */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={`url(#syncGrad-${level})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(135 26 26)"
            className="sync-gauge-fill"
          />
          {/* Gradient defs */}
          <defs>
            <linearGradient id={`syncGrad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
        </svg>
        {/* Score number in center */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums"
          style={{ color: colors.start }}
        >
          {animatedScore}
        </span>
      </button>

      {/* Label */}
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{
          color: colors.start,
          background: `${colors.start}18`,
          border: `1px solid ${colors.start}30`,
        }}
      >
        {label || "—"}
      </span>

      {/* Tooltip / Breakdown */}
      {showTooltip && breakdown && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 sync-tooltip"
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "12px 14px",
            minWidth: "220px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-2 pb-1"
            style={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            Sync Breakdown
          </p>
          <div className="space-y-1.5">
            {Object.entries(breakdown).map(([key, val]) => {
              const max = MAX_SCORES[key] || 10;
              const pct = Math.min(100, (val / max) * 100);
              const barLevel = pct >= 70 ? "high" : pct >= 35 ? "mid" : "low";
              const barColor = COLORS[barLevel].start;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="text-[9px] w-24 text-right shrink-0"
                    style={{ color: "#94a3b8" }}
                  >
                    {LABELS[key] || key}
                  </span>
                  <div
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <span className="text-[9px] tabular-nums w-8" style={{ color: "#64748b" }}>
                    {val}/{max}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            className="mt-2 pt-1.5 flex justify-between text-[9px]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}
          >
            <span>Last 7 days</span>
            <span style={{ color: colors.start, fontWeight: 600 }}>{score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncMeter;
