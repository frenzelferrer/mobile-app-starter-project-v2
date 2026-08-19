import { Pressable, StyleSheet, Text, View } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";
import type { Task } from "@/types/task";
import { formatDate, getDueDateStatus } from "@/utils/validation";

interface TaskCardProps { task: Task; onPress: () => void; }

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { colors } = useSettings();
  const dueStatus = getDueDateStatus(task);
  const priorityColor = task.priority === "High" ? colors.danger : task.priority === "Medium" ? colors.warning : colors.success;
  const priorityBackground = task.priority === "High" ? colors.dangerSoft : task.priority === "Medium" ? colors.warningSoft : colors.successSoft;
  const dueColor = dueStatus === "Overdue" ? colors.danger : dueStatus === "Due soon" || dueStatus === "Due today" ? colors.warning : colors.success;
  const dueBackground = dueStatus === "Overdue" ? colors.dangerSoft : dueStatus === "Due soon" || dueStatus === "Due today" ? colors.warningSoft : colors.successSoft;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}><Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{task.title}</Text><Text style={[styles.subject, { color: colors.primary }]}>{task.subject}</Text></View>
        <Text style={[styles.badge, { backgroundColor: priorityBackground, color: priorityColor }]}>{task.priority.toUpperCase()}</Text>
      </View>
      <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>{task.description}</Text>
      <View style={styles.footerRow}>
        <View style={styles.dateGroup}><Text style={[styles.dueDate, { color: dueColor }]}>Due {formatDate(task.dueDate)}</Text><Text style={[styles.dateBadge, { color: dueColor, backgroundColor: dueBackground }]}>{dueStatus}</Text></View>
        <Text style={[styles.badge, { backgroundColor: task.status === "Completed" ? colors.successSoft : colors.accent, color: task.status === "Completed" ? colors.success : colors.primary }]}>{task.status.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm, shadowColor: "#1D2B55", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  titleWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  subject: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  description: { fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
  dateGroup: { alignItems: "flex-start", flex: 1 },
  dueDate: { fontSize: 12, fontWeight: "700" },
  dateBadge: { borderRadius: 6, fontSize: 10, fontWeight: "800", marginTop: 4, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 },
  badge: { borderRadius: 8, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, letterSpacing: 0.5 },
});
