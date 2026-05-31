import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import BatLogo from "../components/BatLogo";
import ScoreRing from "../components/ScoreRing";
import MoodPicker from "../components/MoodPicker";
import { loadState, saveState, todayStr, formatDate, defaultDay, calcScore, getLast7Days, AppState, DayData } from "../lib/data";

export default function Dashboard() {
  const [state, setState] = useState<AppState | null>(null);
  const [today, setToday] = useState<DayData | null>(null);
  const today_key = todayStr();

  useEffect(() => {
    const s = loadState();
    if (!s.days[today_key]) s.days[today_key] = defaultDay(today_key);
    s.days[today_key].productivityScore = calcScore(s.days[today_key]);
    setState(s);
    setToday(s.days[today_key]);
  }, []);

  function updateToday(patch: Partial<DayData>) {
    if (!state || !today) return;
    const updated = { ...today, ...patch };
    updated.productivityScore = calcScore(updated);
    const newState = { ...state, days: { ...state.days, [today_key]: updated } };
    setState(newState);
    setToday(updated);
    saveState(newState);
  }

  if (!state || !today) return <Layout title="Dashboard"><div style={{ textAlign: "center", padding: 80, color: "#f5c518" }}>Loading Bat Tracker...</div></Layout>;

  const last7 = getLast7Days();
  const week = last7.map(d => state.days[d]);
  const workoutDays = week.filter(d => d?.workout?.done).length;
  const studyMins = week.reduce((a, d) => a + (d?.tasks?.filter(t => t.done).reduce((s, t) => s + (t.timeSpent || 30), 0) || 0), 0);
  const avgScore = week.filter(Boolean).length > 0
    ? Math.round(week.filter(Boolean).reduce((a, d) => a + (d?.productivityScore || 0), 0) / week.filter(Boolean).length)
    : 0;

  const doneTasks = today.tasks.filter(t => t.done).length;
  const totalTasks = today.tasks.length;

  return (
    <Layout title="Dashboard">
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <BatLogo size={44} glow />
            <div>
              <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em" }}>BAT TRACKER</div>
              <div style={{ color: "#666", fontSize: 13, fontFamily: "Rajdhani", letterSpacing: "0.08em" }}>{formatDate(today_key)}</div>
            </div>
          </div>
          <ScoreRing score={today.productivityScore} size={90} />
        </div>

        {/* Mood Row */}
        <div className="bat-card animate-slide-up" style={{ padding: "16px 20px", borderRadius: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em" }}>TODAY'S ENERGY</span>
            <MoodPicker value={today.mood} onChange={v => updateToday({ mood: v })} />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          {[
            {
              label: "SHIFT TODAY", icon: "⏰",
              value: today.shift.type === "off" ? "Day Off" : today.shift.type,
              sub: today.shift.type !== "off" ? `${today.shift.departHome} → ${today.shift.arriveHome}` : "Rest & recover",
              color: "#f5c518",
            },
            {
              label: "WORKOUT", icon: "💪",
              value: today.workout.done ? "Done ✓" : "Pending",
              sub: today.workout.done ? `${today.workout.muscleGroup} · ${today.workout.duration}min` : "Log your session",
              color: today.workout.done ? "#22c55e" : "#ef4444",
            },
            {
              label: "STUDY TASKS", icon: "📚",
              value: `${doneTasks}/${totalTasks}`,
              sub: totalTasks === 0 ? "No tasks added" : doneTasks === totalTasks && totalTasks > 0 ? "All complete 🔥" : `${totalTasks - doneTasks} remaining`,
              color: doneTasks === totalTasks && totalTasks > 0 ? "#22c55e" : "#f5c518",
            },
            {
              label: "WEEK WORKOUTS", icon: "🏋️",
              value: `${workoutDays}/7`,
              sub: `Goal: ${state.goals.weeklyWorkout} days`,
              color: workoutDays >= state.goals.weeklyWorkout ? "#22c55e" : "#f5c518",
            },
          ].map(c => (
            <div key={c.label} className="bat-card" style={{ padding: "18px 20px", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span className="font-cinzel" style={{ fontSize: 10, color: "#666", letterSpacing: "0.15em" }}>{c.label}</span>
              </div>
              <div className="font-cinzel" style={{ fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#666", fontFamily: "Rajdhani" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Week Overview Bar Chart */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 24 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 16 }}>7-DAY PERFORMANCE</div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
            {last7.map((d, i) => {
              const day = state.days[d];
              const score = day?.productivityScore || 0;
              const isToday = d === today_key;
              const dayLabel = new Date(d + "T00:00:00").toLocaleDateString("en", { weekday: "short" });
              return (
                <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 60, display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%", height: `${Math.max(4, score)}%`, borderRadius: "3px 3px 0 0",
                      background: isToday ? "#f5c518" : score > 0 ? "rgba(245,197,24,0.4)" : "rgba(255,255,255,0.05)",
                      transition: "height 0.6s ease",
                      border: isToday ? "none" : "none",
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: isToday ? "#f5c518" : "#555", fontFamily: "Rajdhani", letterSpacing: "0.05em" }}>{dayLabel}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "Rajdhani" }}>Week avg: <span style={{ color: "#f5c518" }}>{avgScore}</span></span>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "Rajdhani" }}>Study: <span style={{ color: "#f5c518" }}>{studyMins}min</span></span>
          </div>
        </div>

        {/* Quick Notes */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 24 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 12 }}>TODAY'S NOTES</div>
          <textarea
            value={today.notes}
            onChange={e => updateToday({ notes: e.target.value })}
            placeholder="What happened today? Any wins, struggles, thoughts..."
            rows={3}
            style={{ width: "100%", resize: "vertical", fontSize: 14 }}
          />
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Avg Score", value: `${avgScore}%`, icon: "📊" },
            { label: "Study This Week", value: `${Math.round(studyMins / 60)}h`, icon: "📚" },
            { label: "Gym Days", value: `${workoutDays}`, icon: "🏋️" },
          ].map(s => (
            <div key={s.label} className="bat-card" style={{ padding: "14px 16px", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div className="font-cinzel" style={{ fontSize: 18, fontWeight: 700, color: "#f5c518" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "Rajdhani", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
