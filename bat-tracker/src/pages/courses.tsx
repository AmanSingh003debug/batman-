import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { loadState, saveState, todayStr, formatDate, defaultDay, calcScore, WEB_DEV_SECTIONS, DSA_SECTIONS, AppState, DayData, CourseTask, uid } from "../lib/data";

const APNA_PROGRESS = {
  webdev: { total: 69, current: 15, label: "Sigma 5 (Dev)" },
  dsa: { total: 50, current: 3, label: "Sigma 5.0 DSA" },
};

export default function CoursesPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [today, setToday] = useState<DayData | null>(null);
  const [activeTab, setActiveTab] = useState<"webdev" | "dsa">("webdev");
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", section: "HTML", timeSpent: 30 });
  const today_key = todayStr();

  useEffect(() => {
    const s = loadState();
    if (!s.days[today_key]) s.days[today_key] = defaultDay(today_key);
    setState(s);
    setToday(s.days[today_key]);
  }, []);

  function updateTasks(tasks: CourseTask[]) {
    if (!state || !today) return;
    const updated = { ...today, tasks };
    updated.productivityScore = calcScore(updated);
    const ns = { ...state, days: { ...state.days, [today_key]: updated } };
    setState(ns);
    setToday(updated);
    saveState(ns);
  }

  function addTask() {
    if (!newTask.title.trim()) return;
    const task: CourseTask = {
      id: uid(),
      title: newTask.title.trim(),
      course: activeTab,
      section: newTask.section,
      done: false,
      timeSpent: newTask.timeSpent,
    };
    updateTasks([...(today?.tasks || []), task]);
    setNewTask({ title: "", section: activeTab === "webdev" ? "HTML" : "Arrays", timeSpent: 30 });
    setShowAdd(false);
  }

  function toggleTask(id: string) {
    const tasks = (today?.tasks || []).map(t => t.id === id ? { ...t, done: !t.done } : t);
    updateTasks(tasks);
  }

  function removeTask(id: string) {
    updateTasks((today?.tasks || []).filter(t => t.id !== id));
  }

  function updateTime(id: string, mins: number) {
    const tasks = (today?.tasks || []).map(t => t.id === id ? { ...t, timeSpent: mins } : t);
    updateTasks(tasks);
  }

  if (!state || !today) return (
    <Layout title="Courses">
      <div style={{ textAlign: "center", padding: 80, color: "#f5c518" }}>Loading...</div>
    </Layout>
  );

  const filtered = today.tasks.filter(t => t.course === activeTab);
  const done = filtered.filter(t => t.done).length;
  const totalTime = filtered.reduce((a, t) => a + (t.done ? t.timeSpent : 0), 0);
  const sections = activeTab === "webdev" ? WEB_DEV_SECTIONS : DSA_SECTIONS;
  const progress = APNA_PROGRESS[activeTab];

  return (
    <Layout title="Courses">
      <div className="animate-fade-in">

        <div style={{ marginBottom: 28 }}>
          <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>📚 COURSE TRACKER</div>
          <div style={{ color: "#555", fontSize: 13, fontFamily: "Rajdhani" }}>{formatDate(today_key)}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["webdev", "dsa"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? "active" : ""}`}>
              {tab === "webdev" ? "🌐 Web Dev" : "⚡ DSA"}
            </button>
          ))}
        </div>

        {/* Apna College Progress */}
        <div className="bat-card animate-slide-up" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20, border: "1px solid rgba(245,197,24,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em" }}>{progress.label}</div>
              <div style={{ color: "#666", fontSize: 12, fontFamily: "Rajdhani", marginTop: 2 }}>Apna College · Sigma 5</div>
            </div>
            <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 22, fontWeight: 700 }}>
              {Math.round((progress.current / progress.total) * 100)}%
            </div>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "Rajdhani" }}>Module {progress.current} of {progress.total}</span>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "Rajdhani" }}>{progress.total - progress.current} modules left</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "TASKS TODAY", value: `${done}/${filtered.length}`, color: done === filtered.length && filtered.length > 0 ? "#22c55e" : "#f5c518" },
            { label: "TIME STUDIED", value: `${totalTime}m`, color: "#3b82f6" },
            { label: "COMPLETION", value: filtered.length > 0 ? `${Math.round((done / filtered.length) * 100)}%` : "0%", color: "#a855f7" },
          ].map(s => (
            <div key={s.label} className="bat-card" style={{ padding: "14px 16px", borderRadius: 8, textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "Rajdhani", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em" }}>TODAY'S TASKS</div>
            <button onClick={() => setShowAdd(true)}
              style={{ padding: "6px 16px", background: "#f5c518", color: "#0a0a0a", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "Cinzel, serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
              + ADD TASK
            </button>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#444", fontFamily: "Rajdhani" }}>
              No tasks yet. Add what you plan to study today!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(task => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 6, flexWrap: "wrap",
                  background: task.done ? "rgba(34,197,94,0.07)" : "rgba(26,26,26,0.5)",
                  border: `1px solid ${task.done ? "rgba(34,197,94,0.25)" : "rgba(245,197,24,0.1)"}`,
                  transition: "all 0.2s",
                }}>
                  <input type="checkbox" className="checkbox-bat" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontFamily: "Rajdhani", fontWeight: 600, color: task.done ? "#22c55e" : "#ccc", fontSize: 14, textDecoration: task.done ? "line-through" : "none", opacity: task.done ? 0.7 : 1 }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "Rajdhani", marginTop: 2 }}>{task.section}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" value={task.timeSpent} min={5} max={480} step={5}
                      onChange={e => updateTime(task.id, Number(e.target.value))}
                      style={{ width: 60, textAlign: "center", fontSize: 12 }} />
                    <span style={{ fontSize: 11, color: "#555", fontFamily: "Rajdhani" }}>min</span>
                    <button onClick={() => removeTask(task.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Breakdown */}
        {filtered.length > 0 && (
          <div className="bat-card" style={{ padding: "20px 24px", borderRadius: 8 }}>
            <div className="font-cinzel" style={{ color: "#888", fontSize: 11, letterSpacing: "0.15em", marginBottom: 14 }}>BY SECTION</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Array.from(new Set(filtered.map(t => t.section))).map(sec => {
                const secTasks = filtered.filter(t => t.section === sec);
                const secDone = secTasks.filter(t => t.done).length;
                return (
                  <div key={sec} style={{ padding: "6px 12px", borderRadius: 4, background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)" }}>
                    <span style={{ fontFamily: "Rajdhani", fontSize: 12, color: "#aaa" }}>{sec}: </span>
                    <span className="font-cinzel" style={{ fontSize: 12, color: secDone === secTasks.length ? "#22c55e" : "#f5c518" }}>{secDone}/{secTasks.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
            <div className="modal-box">
              <div className="font-cinzel" style={{ color: "#f5c518", fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 20 }}>
                ADD {activeTab === "webdev" ? "WEB DEV" : "DSA"} TASK
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Topic / Task</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                    placeholder={activeTab === "webdev" ? "e.g. Flexbox Layout Practice" : "e.g. Binary Search Problems"}
                    style={{ width: "100%", background: "rgba(26,26,26,0.9)", border: "1px solid rgba(245,197,24,0.3)", color: "#fff", borderRadius: 4, padding: "8px 12px", fontFamily: "Rajdhani", fontSize: 14, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Section</label>
                  <select value={newTask.section} onChange={e => setNewTask(p => ({ ...p, section: e.target.value }))} style={{ width: "100%" }}>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#666", fontFamily: "Rajdhani", marginBottom: 6 }}>Planned Time (min)</label>
                  <input type="number" value={newTask.timeSpent} min={5} max={480} step={5}
                    onChange={e => setNewTask(p => ({ ...p, timeSpent: Number(e.target.value) }))} style={{ width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding: "8px 20px", background: "transparent", border: "1px solid rgba(245,197,24,0.2)", color: "#888", borderRadius: 4, cursor: "pointer", fontFamily: "Rajdhani" }}>
                  Cancel
                </button>
                <button onClick={addTask}
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
