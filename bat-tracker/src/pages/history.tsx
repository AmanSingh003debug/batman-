import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ScoreRing from "../components/ScoreRing";
import { loadState, todayStr, AppState, getLast7Days } from "../lib/data";

function getPast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function HistoryPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const today_key = todayStr();

  useEffect(() => { setState(loadState()); }, []);

  if (!state) return <Layout title="History"><div style={{ textAlign: "center", padding: 80, color: "#f5c518" }}>Loading...</div></Layout>;

  const days30 = getPast30Days();
  const selectedDay = selected ? state.days[selected] : null;

  // Stats
  const allDays = Object.values(state.days);
  const totalWorkout = allDays.filter(d => d?.workout?.done).length;
  const totalStudyMins = allDays.reduce((a, d) => a + (d?.tasks?.filter(t => t.done).reduce((s, t) => s + (t.timeSpent || 30), 0) || 0), 0);
  const bestScore = allDays.length > 0 ? Math.max(...allDays.map(d => d?.productivityScore || 0)) : 0;
  const avgScore = allDays.length > 0 ? Math.round(allDays.reduce((a, d) => a + (d?.productivityScore || 0), 0) / allDays.length) : 0;

  return (
    <Layout title="History">
      <div className="animate-fade-in">
        <div style={{ marginBottom: 28 }}>
          <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>📅 HISTORY</div>
          <div style={{ color: "#555", fontSize: 13, fontFamily: "Rajdhani" }}>Your complete battle log</div>
        </div>

        {/* All-time stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "GYM SESSIONS", value: totalWorkout, icon: "💪", color: "#22c55e" },
            { label: "STUDY HOURS", value: `${Math.round(totalStudyMins / 60)}h`, icon: "📚", color: "#3b82f6" },
            { label: "BEST SCORE", value: bestScore, icon: "🏆", color: "#f5c518" },
            { label: "AVG SCORE", value: avgScore, icon: "📊", color: "#a855f7" },
          ].map(s => (
            <div key={s.label} className="bat-card" style={{ padding: "16px", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div className="font-cinzel" style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "Rajdhani", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 30-day calendar heatmap */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 24 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 16 }}>30-DAY HEATMAP</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
            {days30.map(d => {
              const day = state.days[d];
              const score = day?.productivityScore || 0;
              const isToday = d === today_key;
              const hasData = !!day;
              const dayNum = new Date(d + "T00:00:00").getDate();
              const color = !hasData ? "rgba(255,255,255,0.04)"
                : score >= 80 ? "rgba(34,197,94,0.7)"
                : score >= 50 ? "rgba(245,197,24,0.6)"
                : score >= 20 ? "rgba(239,68,68,0.4)"
                : "rgba(255,255,255,0.06)";
              return (
                <button key={d} onClick={() => setSelected(selected === d ? null : d)} title={`${d}: ${score}`}
                  style={{
                    aspectRatio: "1", borderRadius: 4, background: color, border: isToday ? "2px solid #f5c518" : "none",
                    cursor: hasData ? "pointer" : "default", position: "relative",
                    transition: "transform 0.15s", transform: selected === d ? "scale(1.15)" : "scale(1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <span style={{ fontSize: 9, color: isToday ? "#f5c518" : "rgba(255,255,255,0.4)", fontFamily: "Rajdhani" }}>{dayNum}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { color: "rgba(34,197,94,0.7)", label: "80-100" },
              { color: "rgba(245,197,24,0.6)", label: "50-79" },
              { color: "rgba(239,68,68,0.4)", label: "20-49" },
              { color: "rgba(255,255,255,0.06)", label: "0-19" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 11, color: "#555", fontFamily: "Rajdhani" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day detail */}
        {selected && selectedDay && (
          <div className="bat-card animate-slide-up" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 24, border: "1px solid rgba(245,197,24,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 14, fontWeight: 700 }}>
                  {new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <div style={{ color: "#555", fontSize: 12, fontFamily: "Rajdhani", marginTop: 4 }}>Day detail</div>
              </div>
              <ScoreRing score={selectedDay.productivityScore} size={70} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
              <div style={{ padding: "12px 16px", borderRadius: 6, background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.1)" }}>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 4, letterSpacing: "0.1em" }}>SHIFT</div>
                <div style={{ fontFamily: "Rajdhani", fontWeight: 600, color: "#ccc" }}>{selectedDay.shift.type === "off" ? "Day Off" : selectedDay.shift.type}</div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 6, background: selectedDay.workout.done ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)", border: `1px solid ${selectedDay.workout.done ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}` }}>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 4, letterSpacing: "0.1em" }}>WORKOUT</div>
                <div style={{ fontFamily: "Rajdhani", fontWeight: 600, color: selectedDay.workout.done ? "#22c55e" : "#ef4444" }}>
                  {selectedDay.workout.done ? `✓ ${selectedDay.workout.muscleGroup}` : "Skipped"}
                </div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 6, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 4, letterSpacing: "0.1em" }}>STUDY</div>
                <div style={{ fontFamily: "Rajdhani", fontWeight: 600, color: "#3b82f6" }}>
                  {selectedDay.tasks.filter(t => t.done).length}/{selectedDay.tasks.length} tasks
                </div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 6, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 4, letterSpacing: "0.1em" }}>MOOD</div>
                <div style={{ fontSize: 20 }}>{["😴", "😕", "😐", "😊", "🔥"][selectedDay.mood - 1]}</div>
              </div>
            </div>
            {selectedDay.notes && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "Rajdhani", marginBottom: 4 }}>NOTES</div>
                <div style={{ fontFamily: "Rajdhani", color: "#888", fontSize: 13 }}>{selectedDay.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Recent 7 days list */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 16 }}>RECENT 7 DAYS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {getLast7Days().reverse().map(d => {
              const day = state.days[d];
              const isToday = d === today_key;
              const label = new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
              return (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 6, background: isToday ? "rgba(245,197,24,0.06)" : "rgba(26,26,26,0.5)", border: `1px solid ${isToday ? "rgba(245,197,24,0.25)" : "rgba(245,197,24,0.08)"}` }}>
                  <div style={{ minWidth: 90 }}>
                    <div style={{ fontFamily: "Rajdhani", fontWeight: 600, fontSize: 13, color: isToday ? "#f5c518" : "#aaa" }}>
                      {label} {isToday && <span style={{ fontSize: 10, color: "#f5c518" }}>· Today</span>}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {day ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani" }}>
                          {day.shift.type === "off" ? "🏖️ Off" : `⏰ ${day.shift.type}`}
                        </span>
                        <span style={{ fontSize: 11, color: day.workout.done ? "#22c55e" : "#555", fontFamily: "Rajdhani" }}>
                          {day.workout.done ? "💪 Done" : "💪 —"}
                        </span>
                        <span style={{ fontSize: 11, color: "#3b82f6", fontFamily: "Rajdhani" }}>
                          📚 {day.tasks.filter(t => t.done).length}/{day.tasks.length}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "#444", fontFamily: "Rajdhani" }}>No data logged</span>
                    )}
                  </div>
                  <div className="font-cinzel" style={{ fontSize: 14, fontWeight: 700, color: !day ? "#333" : day.productivityScore >= 70 ? "#22c55e" : day.productivityScore >= 40 ? "#f5c518" : "#ef4444" }}>
                    {day ? day.productivityScore : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
