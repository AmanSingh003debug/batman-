export default function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f5c518" : "#ef4444";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} className="ring-chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(245,197,24,0.1)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="font-cinzel" style={{ fontSize: size * 0.22, fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: size * 0.11, color: "#666", fontFamily: "Rajdhani", letterSpacing: "0.1em" }}>SCORE</span>
      </div>
    </div>
  );
}
