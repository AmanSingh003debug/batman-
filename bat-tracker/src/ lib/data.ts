// ── Types ────────────────────────────────────────────────────────────────────

export type ShiftType = "9-6" | "9.30-6.30" | "12-9" | "off";

export interface ShiftEntry {
  type: ShiftType;
  departHome: string;   // e.g. "08:00"
  arriveWork: string;
  leaveWork: string;
  arriveHome: string;
  notes: string;
}

export interface WorkoutSet {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  done: boolean;
}

export interface WorkoutEntry {
  done: boolean;
  duration: number; // minutes
  sets: WorkoutSet[];
  notes: string;
  muscleGroup: string;
}

export interface CourseTask {
  id: string;
  title: string;
  course: "webdev" | "dsa";
  section: string;
  done: boolean;
  timeSpent: number; // minutes
}

export interface DayData {
  date: string; // YYYY-MM-DD
  shift: ShiftEntry;
  workout: WorkoutEntry;
  tasks: CourseTask[];
  mood: number; // 1-5
  notes: string;
  productivityScore: number; // auto-calculated
}

export interface AppState {
  days: Record<string, DayData>;
  streaks: {
    workout: number;
    study: number;
    work: number;
  };
  goals: {
    weeklyWorkout: number;
    dailyStudyMins: number;
  };
}

// ── Default Factories ─────────────────────────────────────────────────────────

export const SHIFT_PRESETS: Record<ShiftType, Omit<ShiftEntry, "notes">> = {
  "9-6": {
    type: "9-6",
    departHome: "08:00",
    arriveWork: "09:00",
    leaveWork: "18:00",
    arriveHome: "19:00",
  },
  "9.30-6.30": {
    type: "9.30-6.30",
    departHome: "08:30",
    arriveWork: "09:30",
    leaveWork: "18:30",
    arriveHome: "19:30",
  },
  "12-9": {
    type: "12-9",
    departHome: "11:00",
    arriveWork: "12:00",
    leaveWork: "21:00",
    arriveHome: "22:00",
  },
  off: {
    type: "off",
    departHome: "",
    arriveWork: "",
    leaveWork: "",
    arriveHome: "",
  },
};

export const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Abs", "Full Body", "Rest Day",
];

export const WEB_DEV_SECTIONS = [
  "HTML", "CSS", "Bootstrap", "JavaScript", "React",
  "Node.js", "Express", "MongoDB", "Git", "Tailwind", "Projects",
];

export const DSA_SECTIONS = [
  "Arrays", "Strings", "Linked List", "Stacks & Queues",
  "Trees", "Graphs", "Recursion", "DP", "Sorting", "Searching",
];

export function defaultDay(date: string): DayData {
  return {
    date,
    shift: { ...SHIFT_PRESETS["9-6"], notes: "" },
    workout: {
      done: false,
      duration: 60,
      sets: [],
      notes: "",
      muscleGroup: "Chest",
    },
    tasks: [],
    mood: 3,
    notes: "",
    productivityScore: 0,
  };
}

// ── Score Calculator ──────────────────────────────────────────────────────────

export function calcScore(day: DayData): number {
  let score = 0;
  if (day.shift.type !== "off") score += 30;
  if (day.workout.done) score += 25;
  const doneTasks = day.tasks.filter((t) => t.done).length;
  const totalTasks = day.tasks.length;
  if (totalTasks > 0) score += Math.round((doneTasks / totalTasks) * 35);
  score += (day.mood - 1) * 2.5;
  return Math.min(100, Math.round(score));
}

// ── localStorage Helpers ──────────────────────────────────────────────────────

const KEY = "bat_tracker_v1";

export function loadState(): AppState {
  if (typeof window === "undefined")
    return { days: {}, streaks: { workout: 0, study: 0, work: 0 }, goals: { weeklyWorkout: 5, dailyStudyMins: 120 } };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { days: {}, streaks: { workout: 0, study: 0, work: 0 }, goals: { weeklyWorkout: 5, dailyStudyMins: 120 } };
    return JSON.parse(raw);
  } catch {
    return { days: {}, streaks: { workout: 0, study: 0, work: 0 }, goals: { weeklyWorkout: 5, dailyStudyMins: 120 } };
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
