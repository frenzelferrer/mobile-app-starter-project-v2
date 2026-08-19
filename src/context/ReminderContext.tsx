import * as Notifications from "expo-notifications";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { Platform } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import type { Task } from "@/types/task";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("deadlines", { name: "Task deadlines", importance: Notifications.AndroidImportance.DEFAULT, sound: "default" }).catch(() => undefined);
}

type PermissionState = "unknown" | "granted" | "denied";

interface ReminderContextValue {
  permission: PermissionState;
  scheduledCount: number;
  syncing: boolean;
  toggleReminders: () => Promise<boolean>;
  refreshReminders: () => Promise<void>;
  cancelReminders: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextValue | undefined>(undefined);

function getReminderDate(task: Task) {
  const dueDate = new Date(`${task.dueDate}T09:00:00`);
  if (Number.isNaN(dueDate.getTime())) return undefined;
  const now = new Date();
  let reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  if (reminderDate <= now) reminderDate = dueDate;
  return reminderDate > now ? reminderDate : undefined;
}

export function ReminderProvider({ children }: PropsWithChildren) {
  const { settings, updateSettings } = useSettings();
  const { tasks, loading: tasksLoading } = useTasks();
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [scheduledCount, setScheduledCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then((result) => setPermission(result.granted ? "granted" : result.canAskAgain ? "unknown" : "denied"))
      .catch(() => setPermission("denied"));
  }, []);

  const cancelReminders = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
    setScheduledCount(0);
  }, []);

  const refreshReminders = useCallback(async () => {
    if (tasksLoading || permission !== "granted" || !settings.remindersEnabled) return;
    setSyncing(true);
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
    const pendingTasks = tasks.filter((task) => task.status === "Pending");
    let count = 0;
    for (const task of pendingTasks) {
      const reminderDate = getReminderDate(task);
      if (!reminderDate) continue;
      await Notifications.scheduleNotificationAsync({ content: { title: `Deadline reminder: ${task.title}`, body: `${task.subject} is due ${task.dueDate}. Open TuonTa! to stay on track.`, sound: "default", data: { taskId: task.id } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate, channelId: "deadlines" } }).catch(() => undefined);
      count += 1;
    }
    setScheduledCount(count);
    setSyncing(false);
  }, [permission, settings.remindersEnabled, tasks, tasksLoading]);

  useEffect(() => {
    refreshReminders();
  }, [refreshReminders]);

  const toggleReminders = useCallback(async () => {
    if (settings.remindersEnabled && permission === "granted") {
      updateSettings({ remindersEnabled: false });
      await cancelReminders();
      return false;
    }
    const result = await Notifications.requestPermissionsAsync().catch(() => ({ granted: false, canAskAgain: false }));
    const granted = result.granted;
    setPermission(granted ? "granted" : result.canAskAgain ? "unknown" : "denied");
    updateSettings({ remindersEnabled: granted });
    if (granted) await refreshReminders();
    return granted;
  }, [cancelReminders, permission, refreshReminders, settings.remindersEnabled, updateSettings]);

  const value = useMemo(() => ({ permission, scheduledCount, syncing, toggleReminders, refreshReminders, cancelReminders }), [cancelReminders, permission, refreshReminders, scheduledCount, syncing, toggleReminders]);
  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (!context) throw new Error("useReminders must be used inside ReminderProvider");
  return context;
}
