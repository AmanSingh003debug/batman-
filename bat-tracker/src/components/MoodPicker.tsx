
const MOODS = ["😴", "😕", "😐", "😊", "🔥"];
const LABELS = ["Tired", "Meh", "Okay", "Good", "Beast"];

export default function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {MOODS.map((m, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          title={LABELS[i]}
          style={{
            fontSize: 26,
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 8,
            background: value === i + 1 ? "rgba(245,197,24,0.2)" : "transparent",
            border: value === i + 1 ? "1px solid rgba(245,197,24,0.5)" : "1px solid transparent",
            transition: "all 0.2s",
            transform: value === i + 1 ? "scale(1.2)" : "scale(1)",
          }}
        >
          {m}
        </button>
      ))}
      <span style={{ color: "#888", fontSize: 13, fontFamily: "Rajdhani" }}>
        {LABELS[value - 1]}
      </span>
    </div>
  );
}
