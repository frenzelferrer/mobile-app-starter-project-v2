import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";

import { parseMockTasks } from "@/data/mockTasks";
import type { Recurrence, Task, TaskFormData } from "@/types/task";

const TASKS_KEY = "tuonta.tasks.v1";

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  addTask: (task: TaskFormData) => Task;
  updateTask: (taskId: string, task: TaskFormData) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  resetTasks: () => void;
  getTaskById: (taskId: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

// ── Reducer ──

type TaskAction =
  | { type: "SET"; tasks: Task[] }
  | { type: "ADD"; task: Task }
  | { type: "UPDATE"; taskId: string; data: TaskFormData }
  | { type: "DELETE"; taskId: string }
  | { type: "TOGGLE"; taskId: string }
  | { type: "RESET" };

function getNextDueDate(currentDue: string, recurrence: Recurrence): string {
  const date = new Date(`${currentDue}T12:00:00`);
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "biweekly":
      date.setDate(date.getDate() + 14);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return currentDue;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "SET":
      return action.tasks;
    case "ADD":
      return [action.task, ...state];
    case "UPDATE":
      return state.map((t) => (t.id === action.taskId ? { ...t, ...action.data } : t));
    case "DELETE":
      return state.filter((t) => t.id !== action.taskId);
    case "TOGGLE": {
      let result = state.map((t) => {
        if (t.id !== action.taskId) return t;
        const newStatus = t.status === "Pending" ? "Completed" : "Pending";
        return {
          ...t,
          status: newStatus as Task["status"],
          completedAt: newStatus === "Completed" ? new Date().toISOString() : undefined,
        };
      });
      // Auto-create recurring task when completing
      const toggled = result.find((t) => t.id === action.taskId);
      if (toggled && toggled.status === "Completed" && toggled.recurrence && toggled.recurrence !== "none") {
        const nextTask: Task = {
          ...toggled,
          id: `task-${Date.now()}`,
          status: "Pending",
          completedAt: undefined,
          dueDate: getNextDueDate(toggled.dueDate, toggled.recurrence),
        };
        result = [nextTask, ...result];
      }
      return result;
    }
    case "RESET":
      return parseMockTasks();
    default:
      return state;
  }
}

// ── Restore ──

function restoreStoredTasks(value: string | null): Task[] {
  if (!value) return parseMockTasks();
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return parseMockTasks();
    return parsed.filter(isTask);
  } catch {
    return parseMockTasks();
  }
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

// ── Provider ──

export function TaskProvider({ children }: PropsWithChildren) {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [loading, setLoading] = useReducerCompat(true);

  useEffect(() => {
    AsyncStorage.getItem(TASKS_KEY)
      .then((stored) => dispatch({ type: "SET", tasks: restoreStoredTasks(stored) }))
      .catch(() => dispatch({ type: "RESET" }))
      .finally(() => setLoading(false));
  }, [setLoading]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)).catch(() => undefined);
  }, [tasks, loading]);

  const addTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = { ...taskData, id: `task-${Date.now()}` };
    dispatch({ type: "ADD", task: newTask });
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, taskData: TaskFormData) => {
    dispatch({ type: "UPDATE", taskId, data: taskData });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: "DELETE", taskId });
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    dispatch({ type: "TOGGLE", taskId });
  }, []);

  const resetTasks = useCallback(() => dispatch({ type: "RESET" }), []);
  const getTaskById = useCallback((taskId: string) => tasks.find((task) => task.id === taskId), [tasks]);
  const value = useMemo(
    () => ({ tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, resetTasks, getTaskById }),
    [tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, resetTasks, getTaskById]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
}

// tiny helper to get a setState-like callback from useReducer for the loading boolean
function useReducerCompat(initial: boolean): [boolean, (v: boolean) => void] {
  const [state, dispatch] = useReducer((_: boolean, action: boolean) => action, initial);
  const setter = useCallback((v: boolean) => dispatch(v), []);
  return [state, setter];
}
