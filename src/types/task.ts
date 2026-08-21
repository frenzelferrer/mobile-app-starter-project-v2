export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "Completed";
export type Recurrence = "none" | "daily" | "weekly" | "biweekly" | "monthly";
export type ReminderAdvance = "1h" | "1d" | "3d" | "1w";

export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  tags?: string[];
  completedAt?: string;
  recurrence?: Recurrence;
  reminderAdvance?: ReminderAdvance;
}

export type TaskFormData = Omit<Task, "id" | "completedAt">;

export interface FocusSession {
  id: string;
  taskId: string;
  taskTitle: string;
  minutes: number;
  completedAt: string;
}
