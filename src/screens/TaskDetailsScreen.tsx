import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";
import { formatDate, getDueDateStatus } from "@/utils/validation";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskDetails">;

export function TaskDetailsScreen({ route, navigation }: Props) {
  const { colors, settings } = useSettings();
  const { getTaskById, toggleTaskStatus, deleteTask } = useTasks();
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const task = getTaskById(route.params.taskId);

  if (!task) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>Task not found</Text>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>This record may have already been removed.</Text>
          <PrimaryButton label="Back to tasks" onPress={() => navigation.popToTop()} />
        </View>
      </SafeAreaView>
    );
  }

  const dueStatus = getDueDateStatus(task);
  const urgencyColor =
    dueStatus === "Overdue"
      ? colors.danger
      : dueStatus === "Due soon" || dueStatus === "Due today"
        ? colors.warning
        : colors.success;
  const handleDelete = () =>
    Alert.alert("Delete Task?", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTask(task.id);
          navigation.popToTop();
        },
      },
    ]);
  const handleToggle = () => {
    const wasPending = task.status === "Pending";
    toggleTaskStatus(task.id);
    if (wasPending && settings.completionFeedbackEnabled) setCelebrationVisible(true);
  };

  const recurrenceLabel =
    task.recurrence && task.recurrence !== "none"
      ? task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1)
      : "None";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Text style={styles.subject}>{task.subject}</Text>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.badgeRow}>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor:
                    task.priority === "High"
                      ? colors.dangerSoft
                      : task.priority === "Medium"
                        ? colors.warningSoft
                        : colors.successSoft,
                  color:
                    task.priority === "High"
                      ? colors.danger
                      : task.priority === "Medium"
                        ? colors.warning
                        : colors.success,
                },
              ]}
            >
              {task.priority} priority
            </Text>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor: task.status === "Completed" ? colors.successSoft : colors.accent,
                  color: task.status === "Completed" ? colors.success : colors.primary,
                },
              ]}
            >
              {task.status}
            </Text>
          </View>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {task.tags.map((tag) => (
                <Text key={tag} style={[styles.tagBadge, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label="Due date" value={formatDate(task.dueDate)} colors={colors.text} muted={colors.muted} />
          <InfoRow label="Due status" value={dueStatus} colors={urgencyColor} muted={colors.muted} />
          <InfoRow label="Current status" value={task.status} colors={colors.text} muted={colors.muted} />
          {task.completedAt && (
            <InfoRow
              label="Completed on"
              value={formatDate(task.completedAt.split("T")[0])}
              colors={colors.success}
              muted={colors.muted}
            />
          )}
          <InfoRow label="Recurrence" value={recurrenceLabel} colors={colors.text} muted={colors.muted} />
          <InfoRow
            label="Reminder"
            value={task.reminderAdvance ? `${task.reminderAdvance} before` : "1 day before"}
            colors={colors.text}
            muted={colors.muted}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.descriptionLabel, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{task.description}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Start focus session"
            onPress={() => navigation.navigate("FocusTimer", { taskId: task.id })}
            variant="outline"
          />
          <PrimaryButton
            label={task.status === "Completed" ? "Mark as pending" : "Mark as completed"}
            onPress={handleToggle}
          />
          <PrimaryButton
            label="Edit task"
            onPress={() => navigation.navigate("EditTask", { taskId: task.id })}
            variant="outline"
          />
          <PrimaryButton label="Delete task" onPress={handleDelete} variant="danger" />
        </View>
      </ScrollView>

      <CelebrationOverlay
        visible={celebrationVisible}
        title="Task completed!"
        message={`${task.title} is now marked complete. Keep building your momentum.`}
        onClose={() => setCelebrationVisible(false)}
      />
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors, muted }: { label: string; value: string; colors: string; muted: string }) {
  return (
    <View style={styles.infoRow} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.infoLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hero: { borderRadius: 21, padding: spacing.lg },
  subject: { color: "#DDE5FF", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", lineHeight: 32 },
  badgeRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  badge: {
    borderRadius: 9,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: spacing.sm },
  tagBadge: {
    borderRadius: 6,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoCard: { borderRadius: 18, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  infoRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 },
  infoLabel: { fontSize: 13, fontWeight: "600" },
  infoValue: { fontSize: 13, fontWeight: "800" },
  divider: { height: 1, marginVertical: spacing.sm },
  descriptionLabel: { fontSize: 14, fontWeight: "800" },
  description: { fontSize: 14, lineHeight: 22, marginTop: 7 },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  notFound: { flex: 1, justifyContent: "center", padding: spacing.lg },
  notFoundTitle: { fontSize: 22, fontWeight: "800" },
  notFoundText: { fontSize: 14, marginVertical: spacing.md },
});
