import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";
import type { Task } from "@/types/task";
import { formatDate, getDueDateStatus } from "@/utils/validation";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const SWIPE_THRESHOLD = 80;

export function TaskCard({ task, onPress, onComplete, onDelete }: TaskCardProps) {
  const { colors } = useSettings();
  const dueStatus = getDueDateStatus(task);
  const priorityColor =
    task.priority === "High" ? colors.danger : task.priority === "Medium" ? colors.warning : colors.success;
  const priorityBackground =
    task.priority === "High" ? colors.dangerSoft : task.priority === "Medium" ? colors.warningSoft : colors.successSoft;
  const dueColor =
    dueStatus === "Overdue"
      ? colors.danger
      : dueStatus === "Due soon" || dueStatus === "Due today"
        ? colors.warning
        : colors.success;
  const dueBackground =
    dueStatus === "Overdue"
      ? colors.dangerSoft
      : dueStatus === "Due soon" || dueStatus === "Due today"
        ? colors.warningSoft
        : colors.successSoft;

  const translateX = useRef(new Animated.Value(0)).current;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.setValue(e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD && onComplete) {
        Animated.timing(translateX, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
          translateX.setValue(0);
          onComplete();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD && onDelete) {
        Animated.timing(translateX, { toValue: -300, duration: 200, useNativeDriver: true }).start(() => {
          translateX.setValue(0);
          onDelete();
        });
      } else {
        Animated.spring(translateX, { toValue: 0, friction: 8, useNativeDriver: true }).start();
      }
    });

  return (
    <View style={styles.swipeContainer}>
      {/* Swipe background indicators */}
      <View style={[styles.swipeAction, styles.swipeRight, { backgroundColor: colors.successSoft }]}>
        <Text style={[styles.swipeText, { color: colors.success }]}>✓ Complete</Text>
      </View>
      <View style={[styles.swipeAction, styles.swipeLeft, { backgroundColor: colors.dangerSoft }]}>
        <Text style={[styles.swipeText, { color: colors.danger }]}>Delete ✕</Text>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${task.title}, ${task.subject}, ${task.priority} priority, ${dueStatus}`}
            accessibilityHint="Opens task details. Swipe right to complete, swipe left to delete."
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.headerRow}>
              <View style={styles.titleWrap}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[styles.subject, { color: colors.primary }]}>{task.subject}</Text>
              </View>
              <Text style={[styles.badge, { backgroundColor: priorityBackground, color: priorityColor }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {task.tags.map((tag) => (
                  <Text key={tag} style={[styles.tagChip, { backgroundColor: colors.accent, color: colors.primary }]}>
                    {tag}
                  </Text>
                ))}
                {task.recurrence && task.recurrence !== "none" && (
                  <Text style={[styles.tagChip, { backgroundColor: colors.warningSoft, color: colors.warning }]}>
                    ↻ {task.recurrence}
                  </Text>
                )}
              </View>
            )}

            <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
              {task.description}
            </Text>
            <View style={styles.footerRow}>
              <View style={styles.dateGroup}>
                <Text style={[styles.dueDate, { color: dueColor }]}>Due {formatDate(task.dueDate)}</Text>
                <Text style={[styles.dateBadge, { color: dueColor, backgroundColor: dueBackground }]}>{dueStatus}</Text>
              </View>
              <Text
                style={[
                  styles.badge,
                  {
                    backgroundColor: task.status === "Completed" ? colors.successSoft : colors.accent,
                    color: task.status === "Completed" ? colors.success : colors.primary,
                  },
                ]}
              >
                {task.status.toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: { position: "relative", marginBottom: spacing.sm },
  swipeAction: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  swipeRight: { justifyContent: "flex-start" },
  swipeLeft: { justifyContent: "flex-end" },
  swipeText: { fontSize: 13, fontWeight: "800" },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: "#1D2B55",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  titleWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  subject: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: spacing.sm },
  tagChip: {
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  description: { fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
  dateGroup: { alignItems: "flex-start", flex: 1 },
  dueDate: { fontSize: 12, fontWeight: "700" },
  dateBadge: {
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badge: {
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
    letterSpacing: 0.5,
  },
});
