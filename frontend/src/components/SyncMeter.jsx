const getColor = (score) => {
  if (score < 30) return "#ef4444";      // red
  if (score < 70) return "#f59e0b";      // amber
  return "#22c55e";                       // green
};

const SyncMeter = ({ score, label, details, size = "md" }) => {
  if (score === null || score === undefined) return null;

  const radius = size === "sm" ? 18 : 28;
  const stroke = size === "sm" ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);
  const svgSize = (radius + stroke) * 2;

  if (size === "sm") {
    return (
      <div className="flex items-center gap-1" title={`Sync: ${score} — ${label}`}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-base-300"
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <span className="text-[10px] font-medium" style={{ color }}>
          {score}
        </span>
      </div>
    );
  }

  // Full size for chat header
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-base-300"
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <span
          className="absolute text-xs font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>

      <span className="text-[11px] font-semibold" style={{ color }}>
        {label}
      </span>

      {/* Tooltip with details on hover */}
      {details && (
        <div className="hidden group-hover:flex flex-col text-[10px] text-zinc-400 text-center">
          <span>💬 {details.messagesLast7Days} msgs/week</span>
          <span>⚡ {details.avgReplySpeed}m reply</span>
          <span>🔥 {details.activeDaysStreak} day streak</span>
        </div>
      )}
    </div>
  );
};

export default SyncMeter;