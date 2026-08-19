export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "Completed";

export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
}

export type TaskFormData = Omit<Task, "id">;
