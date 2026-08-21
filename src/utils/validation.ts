import type { Task, TaskFormData } from "@/types/task";

export interface ValidationErrors {
  title?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
}

export type DueDateStatus = "Overdue" | "Due today" | "Due soon" | "Upcoming" | "Completed";

export function validateTaskForm(values: TaskFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const title = values.title.trim();
  const subject = values.subject.trim();
  const description = values.description.trim();
  if (!title) errors.title = "Task title is required.";
  else if (title.length < 3) errors.title = "Task title must contain at least 3 characters.";
  if (!subject) errors.subject = "Subject is required.";
  if (!description) errors.description = "Description is required.";
  else if (description.length < 10) errors.description = "Description must contain at least 10 characters.";
  if (!values.dueDate.trim()) errors.dueDate = "Due date is required.";
  else if (!isValidDate(values.dueDate.trim())) errors.dueDate = "Use a valid date in YYYY-MM-DD format.";
  if (!["Low", "Medium", "High"].includes(values.priority)) errors.priority = "Choose Low, Medium, or High priority.";
  if (!["Pending", "Completed"].includes(values.status)) errors.status = "Choose a valid task status.";
  return errors;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function getDueDateStatus(task: Pick<Task, "dueDate" | "status">): DueDateStatus {
  if (task.status === "Completed") return "Completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.dueDate}T00:00:00`);
  const difference = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (difference < 0) return "Overdue";
  if (difference === 0) return "Due today";
  if (difference <= 3) return "Due soon";
  return "Upcoming";
}

/** Extract all unique tags from a list of tasks. */
export function getAllTags(tasks: Task[]): string[] {
  const tagSet = new Set<string>();
  for (const task of tasks) {
    if (task.tags) {
      for (const tag of task.tags) tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
