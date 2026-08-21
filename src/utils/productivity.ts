import type { FocusSession, Task } from "@/types/task";

function toDate(value: string | Date) {
  if (value instanceof Date) return new Date(value);
  return value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekStart(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

export function isInCurrentWeek(value: string, referenceDate = new Date()) {
  const date = toDate(value);
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatTimelineDate(value: string) {
  const date = toDate(value);
  const todayKey = toDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (value === todayKey) return "Today";
  if (value === toDateKey(tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(date);
}

export interface TimelineGroup {
  date: string;
  label: string;
  tasks: Task[];
}

export function groupTasksByDueDate(tasks: Task[]): TimelineGroup[] {
  const groups = tasks.reduce<Record<string, Task[]>>((result, task) => {
    result[task.dueDate] = result[task.dueDate] ? [...result[task.dueDate], task] : [task];
    return result;
  }, {});
  return Object.keys(groups)
    .sort()
    .map((date) => ({
      date,
      label: formatTimelineDate(date),
      tasks: groups[date].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    }));
}

export function weeklyTaskCount(tasks: Task[]) {
  return tasks.filter((task) => isInCurrentWeek(task.dueDate)).length;
}

export function weeklyCompletedTaskCount(tasks: Task[]) {
  return tasks.filter((task) => task.status === "Completed" && isInCurrentWeek(task.completedAt ?? task.dueDate))
    .length;
}

export function weeklyFocusMinutes(sessions: FocusSession[]) {
  return sessions
    .filter((session) => isInCurrentWeek(session.completedAt))
    .reduce((total, session) => total + session.minutes, 0);
}

export function weeklyFocusSessionCount(sessions: FocusSession[]) {
  return sessions.filter((session) => isInCurrentWeek(session.completedAt)).length;
}

// ── Insights helpers ──

/** Count unique days with at least one completed task (streak calculation). */
export function calculateStreak(tasks: Task[]): number {
  const completedDates = tasks
    .filter((t) => t.status === "Completed" && t.completedAt)
    .map((t) => toDateKey(toDate(t.completedAt!)))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Allow today or yesterday as streak start
  const todayKey = toDateKey(cursor);
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (completedDates[0] !== todayKey && completedDates[0] !== yesterdayKey) return 0;

  for (const dateStr of completedDates) {
    const cursorKey = toDateKey(cursor);
    if (dateStr === cursorKey) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (dateStr < cursorKey) {
      break;
    }
  }
  return streak;
}

/** Total focus minutes grouped by subject. */
export function focusBySubject(sessions: FocusSession[], tasks: Task[]): { subject: string; minutes: number }[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const subjectMap = new Map<string, number>();
  for (const session of sessions) {
    const task = taskMap.get(session.taskId);
    const subject = task?.subject ?? "Unknown";
    subjectMap.set(subject, (subjectMap.get(subject) ?? 0) + session.minutes);
  }
  return Array.from(subjectMap.entries())
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** Longest single focus session in minutes. */
export function longestSession(sessions: FocusSession[]): number {
  return sessions.reduce((max, s) => Math.max(max, s.minutes), 0);
}

/** Total focus minutes all-time. */
export function totalFocusMinutes(sessions: FocusSession[]): number {
  return sessions.reduce((total, s) => total + s.minutes, 0);
}

/** Average task completion time in days (from creation to completedAt). */
export function averageCompletionDays(tasks: Task[]): number {
  const completed = tasks.filter((t) => t.completedAt);
  if (completed.length === 0) return 0;
  const totalDays = completed.reduce((sum, t) => {
    const created = toDate(t.dueDate);
    const done = toDate(t.completedAt!);
    return sum + Math.max(0, Math.abs(done.getTime() - created.getTime()) / 86_400_000);
  }, 0);
  return Math.round(totalDays / completed.length);
}

/** Daily focus minutes for last N days. */
export function dailyFocusMinutes(
  sessions: FocusSession[],
  days = 7
): { date: string; label: string; minutes: number }[] {
  const result: { date: string; label: string; minutes: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = toDateKey(d);
    const mins = sessions
      .filter((s) => toDateKey(toDate(s.completedAt)) === key)
      .reduce((sum, s) => sum + s.minutes, 0);
    result.push({ date: key, label: dayNames[d.getDay()], minutes: mins });
  }
  return result;
}
