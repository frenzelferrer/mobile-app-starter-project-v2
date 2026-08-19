import type { Task } from "@/types/task";

// This JSON string intentionally demonstrates parsing external-style data before
// placing it into React state. The parser keeps the example easy to explain.
const taskJson = `[
  {
    "id": "task-1",
    "title": "Mobile App Mini Project",
    "subject": "Mobile Development",
    "description": "Complete the React Native midterm mobile application and prepare a short demonstration.",
    "dueDate": "2026-08-25",
    "priority": "High",
    "status": "Pending"
  },
  {
    "id": "task-2",
    "title": "Database Normalization Worksheet",
    "subject": "Database Management",
    "description": "Solve the normalization exercises and explain the final table relationships.",
    "dueDate": "2026-08-27",
    "priority": "Medium",
    "status": "Pending"
  },
  {
    "id": "task-3",
    "title": "Responsive Portfolio Review",
    "subject": "Web Development",
    "description": "Review the portfolio layout on mobile and desktop widths and submit improvement notes.",
    "dueDate": "2026-08-22",
    "priority": "Low",
    "status": "Completed"
  },
  {
    "id": "task-4",
    "title": "Subnetting Practice Quiz",
    "subject": "Networking",
    "description": "Study IPv4 subnetting examples and complete the practice quiz before the lab session.",
    "dueDate": "2026-08-29",
    "priority": "High",
    "status": "Pending"
  },
  {
    "id": "task-5",
    "title": "Information Systems Case Notes",
    "subject": "Information Management",
    "description": "Summarize the case study and prepare three discussion questions for class.",
    "dueDate": "2026-09-02",
    "priority": "Medium",
    "status": "Completed"
  }
]`;

export function parseMockTasks(): Task[] {
  const parsed: unknown = JSON.parse(taskJson);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isTask);
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.subject === "string" &&
    typeof task.description === "string" &&
    typeof task.dueDate === "string" &&
    (task.priority === "Low" || task.priority === "Medium" || task.priority === "High") &&
    (task.status === "Pending" || task.status === "Completed")
  );
}
