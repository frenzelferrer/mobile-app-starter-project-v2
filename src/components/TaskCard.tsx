import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme/colors";
import type { Task } from "@/types/task";
import { formatDate } from "@/utils/validation";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const priorityStyle = task.priority === "High" ? styles.highPriority : task.priority === "Medium" ? styles.mediumPriority : styles.lowPriority;
  const statusStyle = task.status === "Completed" ? styles.completedStatus : styles.pendingStatus;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.subject}>{task.subject}</Text>
        </View>
        <Text style={[styles.badge, priorityStyle]}>{task.priority.toUpperCase()}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.dueDate}>Due {formatDate(task.dueDate)}</Text>
        <Text style={[styles.badge, statusStyle]}>{task.status.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, shadowColor: "#1D2B55", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  titleWrap: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  subject: { color: colors.primary, fontSize: 13, fontWeight: "600", marginTop: 4 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
  dueDate: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  badge: { borderRadius: 8, fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, letterSpacing: 0.5 },
  highPriority: { color: colors.danger, backgroundColor: colors.dangerSoft },
  mediumPriority: { color: colors.warning, backgroundColor: colors.warningSoft },
  lowPriority: { color: colors.success, backgroundColor: colors.successSoft },
  completedStatus: { color: colors.success, backgroundColor: colors.successSoft },
  pendingStatus: { color: colors.primary, backgroundColor: colors.accent },
});
