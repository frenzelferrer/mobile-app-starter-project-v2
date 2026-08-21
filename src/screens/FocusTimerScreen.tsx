import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useFocus } from "@/context/FocusContext";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";

const PRESETS = [15, 25, 45, 60] as const;
const MIN_DURATION = 1;
const MAX_DURATION = 180;
const STEP_MINUTES = 5;

type TimerMode = "single" | "pomodoro";

interface PomodoroPhase {
  round: number;
  type: "work" | "shortBreak" | "longBreak";
  label: string;
  durationMinutes: number;
}

const POMODORO_PHASES: PomodoroPhase[] = [
  { round: 1, type: "work", label: "Work", durationMinutes: 25 },
  { round: 1, type: "shortBreak", label: "Short Break", durationMinutes: 5 },
  { round: 2, type: "work", label: "Work", durationMinutes: 25 },
  { round: 2, type: "shortBreak", label: "Short Break", durationMinutes: 5 },
  { round: 3, type: "work", label: "Work", durationMinutes: 25 },
  { round: 3, type: "shortBreak", label: "Short Break", durationMinutes: 5 },
  { round: 4, type: "work", label: "Work", durationMinutes: 25 },
  { round: 4, type: "longBreak", label: "Long Break", durationMinutes: 15 },
];

type Props = NativeStackScreenProps<TasksStackParamList, "FocusTimer">;

export function FocusTimerScreen({ route, navigation }: Props) {
  const { colors, settings } = useSettings();
  const { getTaskById } = useTasks();
  const { addSession } = useFocus();
  const task = getTaskById(route.params.taskId);

  const [mode, setMode] = useState<TimerMode>("single");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Pomodoro phase tracking (indices 0 to 7)
  const [pomoPhaseIndex, setPomoPhaseIndex] = useState(0);

  // Celebration overlay state
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationTitle, setCelebrationTitle] = useState("Focus complete!");
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const sessionRecorded = useRef(false);

  const currentPomoPhase = POMODORO_PHASES[pomoPhaseIndex] || POMODORO_PHASES[0];
  const isPomodoroBreak = mode === "pomodoro" && currentPomoPhase.type !== "work";

  const totalDurationSeconds = useMemo(() => {
    if (mode === "single") {
      return selectedMinutes * 60;
    }
    return currentPomoPhase.durationMinutes * 60;
  }, [mode, selectedMinutes, currentPomoPhase]);

  const progress = useMemo(() => {
    if (totalDurationSeconds <= 0) return 0;
    return Math.min(1, Math.max(0, (totalDurationSeconds - remainingSeconds) / totalDurationSeconds));
  }, [totalDurationSeconds, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (remainingSeconds !== 0 || !hasStarted || !task) return;

    if (mode === "single") {
      if (sessionRecorded.current) return;
      sessionRecorded.current = true;
      setIsRunning(false);
      setCompleted(true);
      addSession({ taskId: task.id, taskTitle: task.title, minutes: selectedMinutes });
      setCelebrationTitle("Focus complete!");
      setCelebrationMessage(
        `Nice work on ${task.title}. Your ${selectedMinutes} min session was added to your focus summary.`
      );
      if (settings.completionFeedbackEnabled) {
        setCelebrationVisible(true);
      }
    } else {
      // Pomodoro mode auto-transition
      const currentPhase = POMODORO_PHASES[pomoPhaseIndex];
      if (currentPhase.type === "work") {
        // Record completed work block
        addSession({ taskId: task.id, taskTitle: task.title, minutes: currentPhase.durationMinutes });

        const nextIndex = pomoPhaseIndex + 1;
        setPomoPhaseIndex(nextIndex);
        const nextPhase = POMODORO_PHASES[nextIndex];
        setRemainingSeconds(nextPhase.durationMinutes * 60);

        setCelebrationTitle(`Round ${currentPhase.round} complete!`);
        setCelebrationMessage(
          `25 min focus logged. Taking a ${nextPhase.durationMinutes} min ${
            nextPhase.type === "longBreak" ? "long break" : "short break"
          }.`
        );
        if (settings.completionFeedbackEnabled) {
          setCelebrationVisible(true);
        }
      } else {
        // Break phase completed
        if (pomoPhaseIndex >= POMODORO_PHASES.length - 1) {
          // Final 4th round long break completed
          setIsRunning(false);
          setCompleted(true);
          setCelebrationTitle("Pomodoro cycle complete!");
          setCelebrationMessage(`Outstanding! You completed all 4 focus rounds on ${task.title}.`);
          if (settings.completionFeedbackEnabled) {
            setCelebrationVisible(true);
          }
        } else {
          // Advance to next work round
          const nextIndex = pomoPhaseIndex + 1;
          setPomoPhaseIndex(nextIndex);
          const nextPhase = POMODORO_PHASES[nextIndex];
          setRemainingSeconds(nextPhase.durationMinutes * 60);
        }
      }
    }
  }, [
    remainingSeconds,
    hasStarted,
    task,
    mode,
    pomoPhaseIndex,
    selectedMinutes,
    settings.completionFeedbackEnabled,
    addSession,
  ]);

  const handleModeChange = (newMode: TimerMode) => {
    if (hasStarted && !completed) return;
    setMode(newMode);
    setIsRunning(false);
    setHasStarted(false);
    setCompleted(false);
    sessionRecorded.current = false;
    if (newMode === "single") {
      setRemainingSeconds(selectedMinutes * 60);
    } else {
      setPomoPhaseIndex(0);
      setRemainingSeconds(POMODORO_PHASES[0].durationMinutes * 60);
    }
  };

  const handlePreset = (value: number) => {
    if (hasStarted && !completed) return;
    setSelectedMinutes(value);
    setRemainingSeconds(value * 60);
    setCompleted(false);
    sessionRecorded.current = false;
  };

  const handleAdjustMinutes = (delta: number) => {
    if (hasStarted && !completed) return;
    setSelectedMinutes((current) => {
      const next = Math.max(MIN_DURATION, Math.min(MAX_DURATION, current + delta));
      setRemainingSeconds(next * 60);
      setCompleted(false);
      sessionRecorded.current = false;
      return next;
    });
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
    sessionRecorded.current = false;
    if (mode === "single") {
      setRemainingSeconds(selectedMinutes * 60);
    } else {
      setPomoPhaseIndex(0);
      setRemainingSeconds(POMODORO_PHASES[0].durationMinutes * 60);
    }
  };

  const handleFinishSingleEarly = () => {
    if (!task || sessionRecorded.current || !hasStarted) return;
    sessionRecorded.current = true;
    setIsRunning(false);
    setCompleted(true);
    const elapsedMinutes = Math.max(1, Math.round((totalDurationSeconds - remainingSeconds) / 60));
    addSession({ taskId: task.id, taskTitle: task.title, minutes: elapsedMinutes });
    setCelebrationTitle("Session finished!");
    setCelebrationMessage(`Logged ${elapsedMinutes} min of focus on ${task.title}.`);
    if (settings.completionFeedbackEnabled) {
      setCelebrationVisible(true);
    }
  };

  const handleFinishPomoWorkEarly = () => {
    if (!task || !hasStarted) return;
    const currentPhase = POMODORO_PHASES[pomoPhaseIndex];
    if (currentPhase.type !== "work") return;

    const elapsedMinutes = Math.max(1, Math.round((currentPhase.durationMinutes * 60 - remainingSeconds) / 60));
    addSession({ taskId: task.id, taskTitle: task.title, minutes: elapsedMinutes });

    const nextIndex = pomoPhaseIndex + 1;
    setPomoPhaseIndex(nextIndex);
    const nextPhase = POMODORO_PHASES[nextIndex];
    setRemainingSeconds(nextPhase.durationMinutes * 60);

    setCelebrationTitle(`Round ${currentPhase.round} work saved!`);
    setCelebrationMessage(`Logged ${elapsedMinutes} min focus. Starting ${nextPhase.durationMinutes} min break.`);
    if (settings.completionFeedbackEnabled) {
      setCelebrationVisible(true);
    }
  };

  const handleSkipPomoBreak = () => {
    if (!hasStarted) return;
    const currentPhase = POMODORO_PHASES[pomoPhaseIndex];
    if (currentPhase.type === "work") return;

    if (pomoPhaseIndex >= POMODORO_PHASES.length - 1) {
      // Long break skipped -> end cycle
      setIsRunning(false);
      setCompleted(true);
      setCelebrationTitle("Pomodoro complete!");
      setCelebrationMessage(`All 4 rounds completed on ${task?.title || "your task"}!`);
      if (settings.completionFeedbackEnabled) {
        setCelebrationVisible(true);
      }
    } else {
      const nextIndex = pomoPhaseIndex + 1;
      setPomoPhaseIndex(nextIndex);
      const nextPhase = POMODORO_PHASES[nextIndex];
      setRemainingSeconds(nextPhase.durationMinutes * 60);
    }
  };

  const handleEndPomoCycleEarly = () => {
    if (!task || !hasStarted) return;
    const currentPhase = POMODORO_PHASES[pomoPhaseIndex];
    if (currentPhase.type === "work") {
      const elapsedMinutes = Math.max(1, Math.round((currentPhase.durationMinutes * 60 - remainingSeconds) / 60));
      addSession({ taskId: task.id, taskTitle: task.title, minutes: elapsedMinutes });
    }
    setIsRunning(false);
    setCompleted(true);
    setCelebrationTitle("Pomodoro cycle ended");
    setCelebrationMessage(`Focus session recorded for ${task.title}.`);
    if (settings.completionFeedbackEnabled) {
      setCelebrationVisible(true);
    }
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.title, { color: colors.text }]}>Task not found</Text>
          <PrimaryButton label="Back to tasks" onPress={() => navigation.popToTop()} />
        </View>
      </SafeAreaView>
    );
  }

  const timerBadgeText = completed
    ? mode === "pomodoro"
      ? "CYCLE COMPLETE"
      : "DONE"
    : mode === "pomodoro"
      ? isRunning
        ? isPomodoroBreak
          ? currentPomoPhase.type === "longBreak"
            ? "LONG BREAK"
            : "SHORT BREAK"
          : `ROUND ${currentPomoPhase.round} • FOCUSING`
        : hasStarted
          ? isPomodoroBreak
            ? "BREAK PAUSED"
            : `ROUND ${currentPomoPhase.round} • PAUSED`
          : `ROUND 1 • READY`
      : isRunning
        ? "FOCUSING"
        : hasStarted
          ? "PAUSED"
          : "READY";

  const timerHintText = completed
    ? mode === "pomodoro"
      ? "All 4 rounds completed"
      : "Session complete"
    : mode === "pomodoro"
      ? `${Math.round(progress * 100)}% of ${currentPomoPhase.durationMinutes} min ${
          isPomodoroBreak ? "break" : "work"
        }`
      : `${Math.round(progress * 100)}% complete`;

  const primaryButtonLabel = completed
    ? mode === "pomodoro"
      ? "Cycle complete"
      : "Session complete"
    : isRunning
      ? "Pause timer"
      : hasStarted
        ? "Resume timer"
        : mode === "pomodoro"
          ? "Start Pomodoro cycle"
          : "Start focus session";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.backIcon, { color: colors.primary }]}>‹</Text>
          </Pressable>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>FOCUS MODE</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Study timer</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        {/* Task Banner */}
        <View style={[styles.taskBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.taskLabel, { color: colors.muted }]}>CURRENT TASK</Text>
          <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>
            {task.title}
          </Text>
          <Text style={[styles.taskSubject, { color: colors.primary }]}>{task.subject}</Text>
        </View>

        {/* Mode Toggle */}
        <View style={[styles.modeToggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === "single" }}
            accessibilityLabel="Single session mode"
            accessibilityHint="Custom countdown timer for a single study session"
            disabled={hasStarted && !completed}
            onPress={() => handleModeChange("single")}
            style={({ pressed }) => [
              styles.modeTab,
              mode === "single" && { backgroundColor: colors.primary },
              pressed && styles.pressed,
              hasStarted && !completed && mode !== "single" && styles.disabled,
            ]}
          >
            <Text style={[styles.modeTabText, { color: mode === "single" ? colors.white : colors.muted }]}>
              Single session
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === "pomodoro" }}
            accessibilityLabel="Pomodoro mode"
            accessibilityHint="4 rounds of 25-minute focus with short and long breaks"
            disabled={hasStarted && !completed}
            onPress={() => handleModeChange("pomodoro")}
            style={({ pressed }) => [
              styles.modeTab,
              mode === "pomodoro" && { backgroundColor: colors.primary },
              pressed && styles.pressed,
              hasStarted && !completed && mode !== "pomodoro" && styles.disabled,
            ]}
          >
            <Text style={[styles.modeTabText, { color: mode === "pomodoro" ? colors.white : colors.muted }]}>
              Pomodoro (4 rounds)
            </Text>
          </Pressable>
        </View>

        {/* Timer Card */}
        <View
          style={[
            styles.timerCard,
            {
              backgroundColor: isPomodoroBreak ? colors.primaryDark : colors.primary,
            },
          ]}
        >
          <View
            style={[
              styles.timerHalo,
              {
                borderColor: isPomodoroBreak ? colors.success : colors.accent,
              },
            ]}
          >
            <View style={[styles.timerInner, { backgroundColor: colors.primaryDark }]}>
              <Text style={styles.timerLabel}>{timerBadgeText}</Text>
              <Text style={styles.timer}>
                {minutes}:{seconds}
              </Text>
              <Text style={styles.timerHint}>{timerHintText}</Text>
            </View>
          </View>

          <View style={styles.timerActions}>
            <PrimaryButton
              label={primaryButtonLabel}
              onPress={handleStart}
              disabled={completed}
              variant={completed ? "outline" : "primary"}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset timer"
              accessibilityHint="Resets the timer back to its initial state"
              onPress={handleReset}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
            >
              <Text style={styles.resetText}>{mode === "pomodoro" ? "Reset cycle" : "Reset timer"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Pomodoro Progress Indicator Card */}
        {mode === "pomodoro" ? (
          <View style={[styles.pomoProgressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.pomoProgressHeader}>
              <Text style={[styles.pomoProgressTitle, { color: colors.text }]}>Pomodoro Rounds</Text>
              <Text
                style={[
                  styles.pomoProgressBadge,
                  {
                    backgroundColor: colors.accent,
                    color: colors.primary,
                  },
                ]}
              >
                {completed ? "4 / 4 Complete" : `Round ${currentPomoPhase.round} of 4 • ${currentPomoPhase.label}`}
              </Text>
            </View>

            <View style={styles.roundsRow}>
              {[1, 2, 3, 4].map((roundNum) => {
                const workIndex = (roundNum - 1) * 2;
                const breakIndex = workIndex + 1;
                const isRoundDone = completed || pomoPhaseIndex > breakIndex;
                const isWorkActive = !completed && pomoPhaseIndex === workIndex;
                const isBreakActive = !completed && pomoPhaseIndex === breakIndex;
                const isActive = isWorkActive || isBreakActive;

                return (
                  <View
                    key={roundNum}
                    style={[
                      styles.roundItem,
                      {
                        backgroundColor: isRoundDone
                          ? colors.successSoft
                          : isActive
                            ? colors.accent
                            : colors.background,
                        borderColor: isRoundDone ? colors.success : isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.roundItemTop}>
                      <Text
                        style={[
                          styles.roundItemNum,
                          {
                            color: isRoundDone ? colors.success : isActive ? colors.primary : colors.muted,
                          },
                        ]}
                      >
                        R{roundNum}
                      </Text>
                      {isRoundDone ? (
                        <Text style={[styles.roundItemCheck, { color: colors.success }]}>✓</Text>
                      ) : isWorkActive ? (
                        <View style={[styles.activeIndicatorDot, { backgroundColor: colors.primary }]} />
                      ) : isBreakActive ? (
                        <View style={[styles.activeIndicatorDot, { backgroundColor: colors.warning }]} />
                      ) : (
                        <View style={[styles.pendingIndicatorDot, { borderColor: colors.muted }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.roundItemStatus,
                        {
                          color: isRoundDone ? colors.success : isActive ? colors.text : colors.muted,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {isRoundDone
                        ? "Done"
                        : isWorkActive
                          ? "25m Work"
                          : isBreakActive
                            ? roundNum === 4
                              ? "15m Rest"
                              : "5m Rest"
                            : "25m Work"}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.pomoCycleHint, { color: colors.muted }]}>
              {completed
                ? "All 4 rounds complete! Great job maintaining your focus."
                : isPomodoroBreak
                  ? currentPomoPhase.type === "longBreak"
                    ? "Final 15-minute long break. Step away and refresh!"
                    : "5-minute short break. Rest your eyes and hydrate."
                  : `Round ${currentPomoPhase.round}: Focus on ${task.title} for 25 minutes.`}
            </Text>
          </View>
        ) : null}

        {/* Single Session Controls (Presets + Stepper) */}
        {mode === "single" ? (
          <View style={styles.singleConfigSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a focus block</Text>
            <Text style={[styles.sectionHint, { color: colors.muted }]}>
              Pick a preset or customize your session duration (1–180 min).
            </Text>

            <View style={styles.presetRow}>
              {PRESETS.map((value) => {
                const isSelected = selectedMinutes === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityLabel={`${value} minutes preset`}
                    accessibilityHint={`Sets the single session timer to ${value} minutes`}
                    disabled={hasStarted && !completed}
                    onPress={() => handlePreset(value)}
                    style={({ pressed }) => [
                      styles.preset,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      pressed && styles.pressed,
                      hasStarted && !completed && styles.disabled,
                    ]}
                  >
                    <Text style={[styles.presetValue, { color: isSelected ? colors.primary : colors.text }]}>
                      {value}
                    </Text>
                    <Text style={[styles.presetLabel, { color: colors.muted }]}>min</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Stepper with +/- buttons */}
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease duration by 5 minutes"
                accessibilityHint="Decreases session time by 5 minutes, minimum 1 minute"
                disabled={selectedMinutes <= MIN_DURATION || (hasStarted && !completed)}
                onPress={() => handleAdjustMinutes(-STEP_MINUTES)}
                style={({ pressed }) => [
                  styles.stepperButton,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                  (selectedMinutes <= MIN_DURATION || (hasStarted && !completed)) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.stepperButtonText, { color: colors.primary }]}>−</Text>
              </Pressable>

              <View style={styles.stepperValueContainer}>
                <Text style={[styles.stepperMinutesText, { color: colors.text }]}>
                  {selectedMinutes} <Text style={[styles.stepperUnitText, { color: colors.muted }]}>min</Text>
                </Text>
                <Text style={[styles.stepperLabel, { color: colors.muted }]}>Custom duration (1–180 min)</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase duration by 5 minutes"
                accessibilityHint="Increases session time by 5 minutes, maximum 180 minutes"
                disabled={selectedMinutes >= MAX_DURATION || (hasStarted && !completed)}
                onPress={() => handleAdjustMinutes(STEP_MINUTES)}
                style={({ pressed }) => [
                  styles.stepperButton,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                  (selectedMinutes >= MAX_DURATION || (hasStarted && !completed)) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.stepperButtonText, { color: colors.primary }]}>+</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Active Session Action Controls */}
        {hasStarted && !completed ? (
          mode === "single" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Finish session early"
              accessibilityHint="Completes the focus session now and records elapsed minutes"
              onPress={handleFinishSingleEarly}
              style={({ pressed }) => [
                styles.finishButton,
                { borderColor: colors.success, backgroundColor: colors.successSoft },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.finishText, { color: colors.success }]}>Finish session early</Text>
            </Pressable>
          ) : (
            <View style={styles.pomoActionsRow}>
              {currentPomoPhase.type === "work" ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Finish work block early"
                  accessibilityHint="Records elapsed focus time and transitions to the break phase"
                  onPress={handleFinishPomoWorkEarly}
                  style={({ pressed }) => [
                    styles.pomoActionButton,
                    { borderColor: colors.success, backgroundColor: colors.successSoft },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.finishText, { color: colors.success }]}>Finish work early → Break</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Skip break"
                  accessibilityHint="Skips remainder of break and starts next round"
                  onPress={handleSkipPomoBreak}
                  style={({ pressed }) => [
                    styles.pomoActionButton,
                    { borderColor: colors.primary, backgroundColor: colors.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.finishText, { color: colors.primary }]}>
                    {pomoPhaseIndex >= POMODORO_PHASES.length - 1
                      ? "Skip break & finish"
                      : `Skip break → Round ${currentPomoPhase.round + 1}`}
                  </Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="End Pomodoro cycle"
                accessibilityHint="Ends the Pomodoro cycle early and saves your recorded progress"
                onPress={handleEndPomoCycleEarly}
                style={({ pressed }) => [
                  styles.pomoActionButton,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.finishText, { color: colors.muted }]}>End cycle</Text>
              </Pressable>
            </View>
          )
        ) : null}

        {/* Motivational Footer Note */}
        <Text style={[styles.motivation, { color: colors.muted }]}>
          {completed
            ? "Great work! Your focus session was recorded in your summary."
            : mode === "pomodoro"
              ? "25 minutes of deep focus followed by intentional recovery."
              : "Small focused steps add up to big progress."}
        </Text>
      </ScrollView>

      {/* Celebration Feedback Overlay */}
      <CelebrationOverlay
        visible={celebrationVisible}
        title={celebrationTitle}
        message={celebrationMessage}
        onClose={() => setCelebrationVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  backIcon: {
    fontSize: 31,
    lineHeight: 34,
    marginTop: -3,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  taskBanner: {
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  taskLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 7,
  },
  taskSubject: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
  },
  modeToggleContainer: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.sm,
    padding: 4,
  },
  modeTab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: "800",
  },
  timerCard: {
    alignItems: "center",
    borderRadius: 24,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  timerHalo: {
    alignItems: "center",
    borderRadius: 116,
    borderWidth: 7,
    height: 218,
    justifyContent: "center",
    width: 218,
  },
  timerInner: {
    alignItems: "center",
    borderRadius: 92,
    height: 184,
    justifyContent: "center",
    width: 184,
  },
  timerLabel: {
    color: "#DDE5FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    textAlign: "center",
  },
  timer: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 8,
  },
  timerHint: {
    color: "#DDE5FF",
    fontSize: 12,
    marginTop: 3,
    textAlign: "center",
  },
  timerActions: {
    alignItems: "center",
    marginTop: spacing.lg,
    width: "100%",
  },
  resetButton: {
    marginTop: spacing.sm,
    padding: spacing.xs,
  },
  resetText: {
    color: "#DDE5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  pomoProgressCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  pomoProgressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  pomoProgressTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  pomoProgressBadge: {
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roundsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  roundItem: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  roundItemTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  roundItemNum: {
    fontSize: 12,
    fontWeight: "900",
  },
  roundItemCheck: {
    fontSize: 12,
    fontWeight: "900",
  },
  activeIndicatorDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  pendingIndicatorDot: {
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    width: 8,
  },
  roundItemStatus: {
    fontSize: 10,
    fontWeight: "700",
  },
  pomoCycleHint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  singleConfigSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionHint: {
    fontSize: 13,
    marginTop: 5,
  },
  presetRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  preset: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 66,
  },
  presetValue: {
    fontSize: 19,
    fontWeight: "900",
  },
  presetLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  stepperContainer: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  stepperButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  stepperButtonText: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
  },
  stepperValueContainer: {
    alignItems: "center",
    flex: 1,
  },
  stepperMinutesText: {
    fontSize: 22,
    fontWeight: "900",
  },
  stepperUnitText: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  finishButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  pomoActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pomoActionButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  finishText: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  motivation: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
});
