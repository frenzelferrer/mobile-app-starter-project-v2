import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useFocus } from "@/context/FocusContext";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";

const PRESETS = [15, 25, 45, 60];
type Props = NativeStackScreenProps<TasksStackParamList, "FocusTimer">;

export function FocusTimerScreen({ route, navigation }: Props) {
  const { colors } = useSettings();
  const { getTaskById } = useTasks();
  const { addSession } = useFocus();
  const task = getTaskById(route.params.taskId);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sessionRecorded = useRef(false);

  const durationSeconds = selectedMinutes * 60;
  const progress = useMemo(() => Math.min(1, Math.max(0, (durationSeconds - remainingSeconds) / durationSeconds)), [durationSeconds, remainingSeconds]);
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => setRemainingSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (remainingSeconds !== 0 || !hasStarted || sessionRecorded.current || !task) return;
    sessionRecorded.current = true;
    setIsRunning(false);
    setCompleted(true);
    addSession({ taskId: task.id, taskTitle: task.title, minutes: selectedMinutes });
  }, [addSession, hasStarted, remainingSeconds, selectedMinutes, task]);

  const handlePreset = (value: number) => {
    if (hasStarted && !completed) return;
    setSelectedMinutes(value);
    setRemainingSeconds(value * 60);
    setCompleted(false);
    sessionRecorded.current = false;
  };

  const handleStart = () => {
    if (completed) return;
    sessionRecorded.current = false;
    setHasStarted(true);
    setIsRunning((current) => !current);
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setCompleted(false);
    setRemainingSeconds(selectedMinutes * 60);
    sessionRecorded.current = false;
  };

  const handleFinish = () => {
    if (!task || sessionRecorded.current || !hasStarted) return;
    sessionRecorded.current = true;
    setIsRunning(false);
    setCompleted(true);
    addSession({ taskId: task.id, taskTitle: task.title, minutes: Math.max(1, Math.round((durationSeconds - remainingSeconds) / 60)) });
  };

  if (!task) {
    return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}><View style={styles.notFound}><Text style={[styles.title, { color: colors.text }]}>Task not found</Text><PrimaryButton label="Back to tasks" onPress={() => navigation.popToTop()} /></View></SafeAreaView>;
  }

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.backIcon, { color: colors.primary }]}>‹</Text></Pressable><View><Text style={[styles.eyebrow, { color: colors.primary }]}>FOCUS MODE</Text><Text style={[styles.headerTitle, { color: colors.text }]}>Study timer</Text></View><View style={{ width: 42 }} /></View><View style={[styles.taskBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.taskLabel, { color: colors.muted }]}>CURRENT TASK</Text><Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>{task.title}</Text><Text style={[styles.taskSubject, { color: colors.primary }]}>{task.subject}</Text></View><View style={[styles.timerCard, { backgroundColor: colors.primary }]}><View style={[styles.timerHalo, { borderColor: colors.accent }]}><View style={[styles.timerInner, { backgroundColor: colors.primaryDark }]}><Text style={styles.timerLabel}>{completed ? "DONE" : isRunning ? "FOCUSING" : "READY"}</Text><Text style={styles.timer}>{minutes}:{seconds}</Text><Text style={styles.timerHint}>{Math.round(progress * 100)}% complete</Text></View></View><View style={styles.timerActions}><PrimaryButton label={completed ? "Session complete" : isRunning ? "Pause timer" : hasStarted ? "Resume timer" : "Start focus session"} onPress={handleStart} disabled={completed} variant={completed ? "outline" : "primary"} /><Pressable accessibilityRole="button" onPress={handleReset} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}><Text style={styles.resetText}>Reset timer</Text></Pressable></View></View><Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a focus block</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>Pick a pace that fits your next study session.</Text><View style={styles.presetRow}>{PRESETS.map((value) => <Pressable key={value} disabled={hasStarted && !completed} onPress={() => handlePreset(value)} style={({ pressed }) => [styles.preset, { backgroundColor: selectedMinutes === value ? colors.accent : colors.surface, borderColor: selectedMinutes === value ? colors.primary : colors.border }, pressed && styles.pressed, hasStarted && !completed && styles.disabled]}><Text style={[styles.presetValue, { color: selectedMinutes === value ? colors.primary : colors.text }]}>{value}</Text><Text style={[styles.presetLabel, { color: colors.muted }]}>min</Text></Pressable>)}</View>{hasStarted && !completed ? <Pressable accessibilityRole="button" onPress={handleFinish} style={({ pressed }) => [styles.finishButton, { borderColor: colors.success }, pressed && styles.pressed]}><Text style={[styles.finishText, { color: colors.success }]}>Finish session early</Text></Pressable> : null}<Text style={[styles.motivation, { color: colors.muted }]}>{completed ? "Great work. Your focus session was added to this week’s summary." : "Small focused steps add up to big progress."}</Text></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, content: { padding: spacing.md, paddingBottom: spacing.xl }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg }, backButton: { alignItems: "center", borderRadius: 21, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, backIcon: { fontSize: 31, lineHeight: 34, marginTop: -3 }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.8, textAlign: "center" }, headerTitle: { fontSize: 24, fontWeight: "900", marginTop: 4, textAlign: "center" }, taskBanner: { borderRadius: 17, borderWidth: 1, padding: spacing.md }, taskLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }, taskTitle: { fontSize: 17, fontWeight: "800", marginTop: 7 }, taskSubject: { fontSize: 12, fontWeight: "800", marginTop: 5 }, timerCard: { alignItems: "center", borderRadius: 24, marginTop: spacing.md, padding: spacing.lg }, timerHalo: { alignItems: "center", borderRadius: 116, borderWidth: 7, height: 218, justifyContent: "center", width: 218 }, timerInner: { alignItems: "center", borderRadius: 92, height: 184, justifyContent: "center", width: 184 }, timerLabel: { color: "#DDE5FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.8 }, timer: { color: "#FFFFFF", fontSize: 48, fontWeight: "900", letterSpacing: 1, marginTop: 8 }, timerHint: { color: "#DDE5FF", fontSize: 12, marginTop: 3 }, timerActions: { alignItems: "center", marginTop: spacing.lg, width: "100%" }, resetButton: { marginTop: spacing.sm, padding: spacing.xs }, resetText: { color: "#DDE5FF", fontSize: 12, fontWeight: "800" }, sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: spacing.lg }, sectionHint: { fontSize: 13, marginTop: 5 }, presetRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }, preset: { alignItems: "center", borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 66, justifyContent: "center" }, presetValue: { fontSize: 19, fontWeight: "900" }, presetLabel: { fontSize: 11, marginTop: 2 }, disabled: { opacity: 0.55 }, finishButton: { alignItems: "center", borderRadius: 12, borderWidth: 1, marginTop: spacing.md, padding: spacing.md }, finishText: { fontSize: 13, fontWeight: "800" }, motivation: { fontSize: 12, lineHeight: 18, marginTop: spacing.lg, textAlign: "center" }, pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] }, notFound: { flex: 1, justifyContent: "center", padding: spacing.lg }, title: { fontSize: 23, fontWeight: "800", marginBottom: spacing.md },
});
