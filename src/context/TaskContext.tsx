import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { parseMockTasks } from "@/data/mockTasks";
import type { Task, TaskFormData } from "@/types/task";

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
  return typeof task.id === "string" && typeof task.title === "string" && typeof task.subject === "string" && typeof task.description === "string" && typeof task.dueDate === "string" && (task.priority === "Low" || task.priority === "Medium" || task.priority === "High") && (task.status === "Pending" || task.status === "Completed");
}

export function TaskProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TASKS_KEY)
      .then((stored) => setTasks(restoreStoredTasks(stored)))
      .catch(() => setTasks(parseMockTasks()))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)).catch(() => undefined);
  }, [tasks, loading]);

  const addTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = { ...taskData, id: `task-${Date.now()}` };
    setTasks((current) => [newTask, ...current]);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, taskData: TaskFormData) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...taskData } : task));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status: task.status === "Pending" ? "Completed" : "Pending" } : task));
  }, []);

  const resetTasks = useCallback(() => setTasks(parseMockTasks()), []);
  const getTaskById = useCallback((taskId: string) => tasks.find((task) => task.id === taskId), [tasks]);
  const value = useMemo(() => ({ tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, resetTasks, getTaskById }), [tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, resetTasks, getTaskById]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
}
