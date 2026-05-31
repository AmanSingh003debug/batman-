import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { loadState, saveState, todayStr, formatDate, defaultDay, calcScore, MUSCLE_GROUPS, AppState, DayData, WorkoutSet, uid } from "../lib/data";

const COMMON_EXERCISES: Record<string, string[]> = {
  Chest: ["Bench Press", "Incline Bench", "Push Ups", "Cable Flyes", "Chest Dips"],
  Back: ["Deadlift", "Pull Ups", "Lat Pulldown", "Bent Over Rows", "Seated Rows"],
  Shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Shrugs", "Face Pulls"],
  Biceps: ["Barbell Curl", "Hammer Curl", "Incline Curl", "Concentration Curl", "Cable Curl"],
  Triceps: ["Skull Crushers", "Tricep Dips", "Cable Pushdown", "Close Grip Bench", "Overhead Ext"],
  Legs: ["Squats", "Leg Press", "Lunges", "Leg Curl", "Calf Raises", "RDL"],
  Abs: ["Crunches", "Planks", "Leg Raises", "Russian Twists", "Cable Crunches"],
  "Full Body": ["Burpees", "Kettlebell Swings", "Clean & Press", "Thrusters"],
  "Rest Day": [],
};

export default function WorkoutPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [today, setToday] = useState<DayData | null>(null);
  const [showAddSet, setShowAddSet] = useState(false);
  const [newSet, setNewSet] = useState<Omit<WorkoutSet, "done">>({ exercise: "", sets: 3, reps: 10, weight: 60 });
  const today_key = todayStr();

  useEffect(() => {
    const s = loadState();
    if (!s.days[today_key]) s.days[today_key] = defaultDay(today_key);
    setState(s); setToday(s.days[today_key]);
  }, []);

  function updateWorkout(patch: Partial<DayData["workout"]>) {
    if (!state || !today) return;
    const workout = { ...today.workout, ...patch };
    const updated = { ...today, workout };
    updated.productivityScore = calcScore(updated);
    const ns = { ...state, days: { ...state.days, [today_key]: updated } };
    setState(ns); setToday(updated); saveState(ns);
  }

  function addSet() {
    if (!newSet.exercise) return;
    const set: WorkoutSet = { ...newSet, done: false };
    updateWorkout({ sets: [...(today?.workout.sets || []), set] });
    setNewSet({ exercise: "", sets: 3, reps: 10, weight: 60 });
    setShowAddSet(false);
  }

  function toggleSet(idx: number) {
    const sets = [...(today?.workout.sets || [])];
    sets[idx] = { ...sets[idx], done: !sets[idx].done };
    updateWorkout({ sets });
  }

  function removeSet(idx: number) {
    const sets = (today?.workout.sets || []).filter((_, i) => i !== idx);
    updateWorkout({ sets });
  }

  function updateSet(idx: number, patch: Partial<WorkoutSet>) {
    const sets = [...(today?.workout.sets || [])];
    sets[idx] = { ...sets[idx], ...patch };
    updateWorkout({ sets });
  }

  if (!state || !today) return <Layout title="Workout"><div style={{ textAlign: "center", padding: 80, color: "#f5c518" }}>Loading...</div></Layout>;

  const w = today.workout;
  const doneSets = w.sets.filter(s => s.done).length;
  const totalSets = w.sets.length;
  const suggestions = COMMON_EXERCISES[w.muscleGroup] || [];

  return (
    <Layout title="Workout">
      <div className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>💪 GYM LOG</div>
            <div style={{ color: "#555", fontSize: 13, fontFamily: "Rajdhani" }}>{formatDate(today_key)}</div>
          </div>
          {/* Done toggle */}
          <button onClick={() => updateWorkout({ done: !w.done })}
            style={{
              padding: "10px 24px", borderRadius: 6, cursor: "pointer", border: "none",
              background: w.done ? "#22c55e" : "rgba(34,197,94,0.15)",
              color: w.done ? "#0a0a0a" : "#22c55e",
              fontFamily: "Cinzel, serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em",
              border: w.done ? "none" : "1px solid rgba(34,197,94,0.4)",
              transition: "all 0.2s",
            }}>
            {w.done ? "✓ SESSION DONE" : "MARK DONE"}
          </button>
        </div>

        {/* Setup row */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: "Rajdhani", letterSpacing: "0.12em", marginBottom: 6 }}>MUSCLE GROUP</label>
              <select value={w.muscleGroup} onChange={e => updateWorkout({ muscleGroup: e.target.value })} style={{ width: "100%" }}>
                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#666", fontFamily: "Rajdhani", letterSpacing: "0.12em", marginBottom: 6 }}>DURATION (MIN)</label>
              <input type="number" value={w.duration} min={10} max={180}
                onChange={e => updateWorkout({ duration: Number(e.target.value) })} style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div className="bat-card" style={{ padding: "16px 24px", borderRadius: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="font-cinzel" style={{ fontSize: 11, color: "#888", letterSpacing: "0.15em" }}>SETS PROGRESS</span>
              <span style={{ fontSize: 13, color: "#f5c518", fontFamily: "Rajdhani", fontWeight: 600 }}>{doneSets}/{totalSets}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${totalSets > 0 ? (doneSets / totalSets) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* Exercise list */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em" }}>EXERCISES</div>
            <button onClick={() => setShowAddSet(true)}
              style={{ padding: "6px 16px", background: "#f5c518", color: "#0a0a0a", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "Cinzel, serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
              + ADD SET
            </button>
          </div>

          {w.sets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#444", fontFamily: "Rajdhani" }}>
              No exercises yet. Add your first set!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {w.sets.map((set, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 6,
                  background: set.done ? "rgba(34,197,94,0.08)" : "rgba(26,26,26,0.5)",
                  border: `1px solid ${set.done ? "rgba(34,197,94,0.3)" : "rgba(245,197,24,0.1)"}`,
                  transition: "all 0.2s", flexWrap: "wrap",
                }}>
                  <input type="checkbox" className="checkbox-bat" checked={set.done} onChange={() => toggleSet(i)} />
                  <span style={{ fontFamily: "Rajdhani", fontWeight: 600, color: set.done ? "#22c55e" : "#ccc", minWidth: 120, flex: 1, textDecoration: set.done ? "line-through" : "none", opacity: set.done ? 0.7 : 1 }}>
                    {set.exercise}
                  </span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#666", fontFamily: "Rajdhani" }}>
                      <span style={{ color: "#f5c518" }}>{set.sets}</span>×<span style={{ color: "#f5c518" }}>{set.reps}</span> @ <span style={{ color: "#f5c518" }}>{set.weight}kg</span>
                    </span>
                    <button onClick={() => removeSet(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick suggestions */}
          {suggestions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "Rajdhani", letterSpacing: "0.1em", marginBottom: 8 }}>QUICK ADD:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {suggestions.map(ex => (
                  <button key={ex} onClick={() => { setNewSet(p => ({ ...p, exercise: ex })); setShowAddSet(true); }}
                    style={{ padding: "4px 10px", fontSize: 11, color: "#888", background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 4, cursor: "pointer", fontFamily: "Rajdhani", transition: "all 0.15s" }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8 }}>
          <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 10 }}>WORKOUT NOTES</div>
          <textarea value={w.notes} onChange={e => updateWorkout({ notes: e.target.value })}
            placeholder="How did the session go? PRs, injuries, energy level..." rows={3} style={{ width: "100%", resize: "vertical" }} />
        </div>

        {/* Add Set Modal */}
        {showAddSet && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddSet(false); }}>
            <div className="modal-box">
              <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 20 }}>ADD EXERCISE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Exercise Name</label>
                  <input value={newSet.exercise} onChange={e => setNewSet(p => ({ ...p, exercise: e.target.value }))}
                    placeholder="e.g. Bench Press" style={{ width: "100%" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Sets</label>
                    <input type="number" value={newSet.sets} min={1} max={20} onChange={e => setNewSet(p => ({ ...p, sets: Number(e.target.value) }))} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Reps</label>
                    <input type="number" value={newSet.reps} min={1} max={100} onChange={e => setNewSet(p => ({ ...p, reps: Number(e.target.value) }))} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Weight (kg)</label>
                    <input type="number" value={newSet.weight} min={0} max={500} onChange={e => setNewSet(p => ({ ...p, weight: Number(e.target.value) }))} style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button onClick={() => setShowAddSet(false)}
                  style={{ padding: "8px 20px", background: "transparent", border: "1px solid rgba(245,197,24,0.2)", color: "#888", borderRadius: 4, cursor: "pointer", fontFamily: "Rajdhani" }}>
                  Cancel
                </button>
                <button onClick={addSet}
                  style={{ padding: "8px 20px", background: "#f5c518", color: "#0a0a0a", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "Cinzel, serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
                  ADD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
