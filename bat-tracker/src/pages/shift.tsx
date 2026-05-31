import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { loadState, saveState, todayStr, formatDate, defaultDay, calcScore, SHIFT_PRESETS, ShiftType, AppState, DayData } from "../lib/data";

const SHIFT_OPTIONS: { id: ShiftType; label: string; time: string; color: string }[] = [
  { id: "9-6", label: "Standard", time: "9:00 AM – 6:00 PM", color: "#f5c518" },
  { id: "9.30-6.30", label: "Extended", time: "9:30 AM – 6:30 PM", color: "#3b82f6" },
  { id: "12-9", label: "Late Shift", time: "12:00 PM – 9:00 PM", color: "#a855f7" },
  { id: "off", label: "Day Off", time: "No work today", color: "#22c55e" },
];

function timeLabel(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function ShiftPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [today, setToday] = useState<DayData | null>(null);
  const today_key = todayStr();

  useEffect(() => {
    const s = loadState();
    if (!s.days[today_key]) s.days[today_key] = defaultDay(today_key);
    setState(s);
    setToday(s.days[today_key]);
  }, []);

  function update(patch: Partial<DayData["shift"]>) {
    if (!state || !today) return;
    const shift = { ...today.shift, ...patch };
    const updated = { ...today, shift };
    updated.productivityScore = calcScore(updated);
    const ns = { ...state, days: { ...state.days, [today_key]: updated } };
    setState(ns); setToday(updated); saveState(ns);
  }

  function applyPreset(type: ShiftType) {
    const preset = SHIFT_PRESETS[type];
    update({ ...preset, notes: today?.shift.notes || "" });
  }

  if (!state || !today) return <Layout title="Shift"><div style={{ textAlign: "center", padding: 80, color: "#f5c518" }}>Loading...</div></Layout>;

  const s = today.shift;
  const isOff = s.type === "off";

  return (
    <Layout title="Shift">
      <div className="animate-fade-in">
        <div style={{ marginBottom: 28 }}>
          <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>⏰ SHIFT LOG</div>
          <div style={{ color: "#555", fontSize: 13, fontFamily: "Rajdhani" }}>{formatDate(today_key)}</div>
        </div>

        {/* Preset selector */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 14 }}>SELECT SHIFT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 10 }}>
            {SHIFT_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => applyPreset(opt.id)}
                style={{
                  padding: "14px 16px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                  background: s.type === opt.id ? `${opt.color}20` : "rgba(26,26,26,0.6)",
                  border: s.type === opt.id ? `2px solid ${opt.color}` : "1px solid rgba(245,197,24,0.12)",
                  transition: "all 0.2s",
                }}>
                <div className="font-cinzel" style={{ color: s.type === opt.id ? opt.color : "#aaa", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
                <div style={{ color: "#666", fontSize: 12, fontFamily: "Rajdhani" }}>{opt.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {!isOff && (
          <div className="bat-card animate-slide-up" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20 }}>
            <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 16 }}>COMMUTE TIMELINE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16 }}>
              {([
                { key: "departHome", label: "🏠 Leave Home", color: "#f5c518" },
                { key: "arriveWork", label: "🏢 Arrive Office", color: "#3b82f6" },
                { key: "leaveWork", label: "🏃 Leave Office", color: "#a855f7" },
                { key: "arriveHome", label: "🏠 Back Home", color: "#22c55e" },
              ] as const).map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6, letterSpacing: "0.08em" }}>{field.label}</label>
                  <input type="time" value={s[field.key] || ""} onChange={e => update({ [field.key]: e.target.value })}
                    style={{ width: "100%", borderColor: `${field.color}40` }} />
                  <div style={{ fontSize: 11, color: field.color, fontFamily: "Rajdhani", marginTop: 4 }}>{timeLabel(s[field.key])}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual timeline bar */}
        {!isOff && s.departHome && s.arriveHome && (
          <div className="bat-card animate-slide-up" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20 }}>
            <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 16 }}>YOUR DAY VISUAL</div>
            <div style={{ display: "flex", gap: 0, height: 36, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
              {[
                { label: "Commute ➜", color: "#f5c518", flex: 1 },
                { label: `Work (${s.type})`, color: "rgba(59,130,246,0.7)", flex: 4 },
                { label: "Commute ←", color: "#a855f7", flex: 1 },
              ].map((seg, i) => (
                <div key={i} style={{ flex: seg.flex, background: seg.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: i === 1 ? "#fff" : "#0a0a0a", fontFamily: "Rajdhani", fontWeight: 600, whiteSpace: "nowrap", padding: "0 4px" }}>{seg.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "#f5c518", fontFamily: "Rajdhani" }}>{timeLabel(s.departHome)}</span>
              <span style={{ fontSize: 11, color: "#3b82f6", fontFamily: "Rajdhani" }}>{timeLabel(s.arriveWork)} – {timeLabel(s.leaveWork)}</span>
              <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "Rajdhani" }}>{timeLabel(s.arriveHome)}</span>
            </div>
          </div>
        )}

        {isOff && (
          <div className="bat-card" style={{ padding: 32, borderRadius: 8, textAlign: "center", marginBottom: 20, border: "1px solid rgba(34,197,94,0.3)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🦇</div>
            <div className="font-cinzel" style={{ color: "#22c55e", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Day Off</div>
            <div style={{ color: "#666", fontFamily: "Rajdhani" }}>Even Batman rests. Use this time for training or courses.</div>
          </div>
        )}

        {/* Notes */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 10 }}>SHIFT NOTES</div>
          <textarea value={s.notes} onChange={e => update({ notes: e.target.value })}
            placeholder="Any meetings, WFH, overtime, early leave..." rows={3} style={{ width: "100%", resize: "vertical" }} />
        </div>
      </div>
    </Layout>
  );
}
