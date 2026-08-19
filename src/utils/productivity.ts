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
  return Object.keys(groups).sort().map((date) => ({ date, label: formatTimelineDate(date), tasks: groups[date].sort((a, b) => a.dueDate.localeCompare(b.dueDate)) }));
}

export function weeklyTaskCount(tasks: Task[]) {
  return tasks.filter((task) => isInCurrentWeek(task.dueDate)).length;
}

export function weeklyCompletedTaskCount(tasks: Task[]) {
  return tasks.filter((task) => task.status === "Completed" && isInCurrentWeek(task.dueDate)).length;
}

export function weeklyFocusMinutes(sessions: FocusSession[]) {
  return sessions.filter((session) => isInCurrentWeek(session.completedAt)).reduce((total, session) => total + session.minutes, 0);
}

export function weeklyFocusSessionCount(sessions: FocusSession[]) {
  return sessions.filter((session) => isInCurrentWeek(session.completedAt)).length;
}
