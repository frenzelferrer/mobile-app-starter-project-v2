import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useTasks } from "@/context/TaskContext";
import { colors, spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";
import { formatDate } from "@/utils/validation";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskDetails">;

export function TaskDetailsScreen({ route, navigation }: Props) {
  const { getTaskById, toggleTaskStatus, deleteTask } = useTasks();
  const task = getTaskById(route.params.taskId);

  if (!task) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundTitle}>Task not found</Text><Text style={styles.notFoundText}>This record may have already been removed.</Text><PrimaryButton label="Back to tasks" onPress={() => navigation.popToTop()} /></View></SafeAreaView>;
  }

  const handleDelete = () => Alert.alert("Delete Task?", "Are you sure you want to delete this task?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteTask(task.id); navigation.popToTop(); } }]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><Text style={styles.subject}>{task.subject}</Text><Text style={styles.title}>{task.title}</Text><View style={styles.badgeRow}><Text style={[styles.badge, task.priority === "High" ? styles.high : task.priority === "Medium" ? styles.medium : styles.low]}>{task.priority} priority</Text><Text style={[styles.badge, task.status === "Completed" ? styles.completed : styles.pending]}>{task.status}</Text></View></View>
        <View style={styles.infoCard}><InfoRow label="Due date" value={formatDate(task.dueDate)} /><InfoRow label="Current status" value={task.status} /><View style={styles.divider} /><Text style={styles.descriptionLabel}>Description</Text><Text style={styles.description}>{task.description}</Text></View>
        <View style={styles.actions}><PrimaryButton label={task.status === "Completed" ? "Mark as pending" : "Mark as completed"} onPress={() => toggleTaskStatus(task.id)} /><PrimaryButton label="Edit task" onPress={() => navigation.navigate("EditTask", { taskId: task.id })} variant="outline" /><PrimaryButton label="Delete task" onPress={handleDelete} variant="danger" /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hero: { backgroundColor: colors.primary, borderRadius: 21, padding: spacing.lg },
  subject: { color: "#DDE5FF", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  title: { color: colors.white, fontSize: 26, fontWeight: "800", lineHeight: 32 },
  badgeRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  badge: { borderRadius: 9, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 6 },
  high: { backgroundColor: "#FDECEF", color: colors.danger },
  medium: { backgroundColor: "#FFF4DE", color: colors.warning },
  low: { backgroundColor: "#E6F7EF", color: colors.success },
  completed: { backgroundColor: "#E6F7EF", color: colors.success },
  pending: { backgroundColor: "#E9EEFF", color: colors.primary },
  infoCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  infoRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 },
  infoLabel: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: "800" },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: spacing.sm },
  descriptionLabel: { color: colors.text, fontSize: 14, fontWeight: "800" },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 7 },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  notFound: { flex: 1, justifyContent: "center", padding: spacing.lg },
  notFoundTitle: { color: colors.text, fontSize: 22, fontWeight: "800" },
  notFoundText: { color: colors.muted, fontSize: 14, marginVertical: spacing.md },
});
