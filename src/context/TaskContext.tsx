import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { parseMockTasks } from "@/data/mockTasks";
import type { Task, TaskFormData } from "@/types/task";

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  addTask: (task: TaskFormData) => Task;
  updateTask: (taskId: string, task: TaskFormData) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(parseMockTasks());
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const addTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((current) => [newTask, ...current]);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, taskData: TaskFormData) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, ...taskData } : task)),
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "Pending" ? "Completed" : "Pending" }
          : task,
      ),
    );
  }, []);

  const getTaskById = useCallback(
    (taskId: string) => tasks.find((task) => task.id === taskId),
    [tasks],
  );

  const value = useMemo(
    () => ({ tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, getTaskById }),
    [tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, getTaskById],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used inside TaskProvider");
  }
  return context;
}
