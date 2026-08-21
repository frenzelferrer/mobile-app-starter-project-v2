import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { SkeletonCard } from "@/components/SkeletonLoader";
import { TaskCard } from "@/components/TaskCard";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";
import type { Task } from "@/types/task";
import { getAllTags } from "@/utils/validation";

type Filter = "All" | "Pending" | "Completed" | "High Priority";
type SortMode = "Due date" | "Priority" | "Newest";
type Props = NativeStackScreenProps<TasksStackParamList, "TaskList">;
const filters: Filter[] = ["All", "Pending", "Completed", "High Priority"];
const sortModes: SortMode[] = ["Due date", "Priority", "Newest"];

export function TaskListScreen({ navigation }: Props) {
  const { colors } = useSettings();
  const { tasks, loading, toggleTaskStatus, deleteTask } = useTasks();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("Due date");
  const [filterVisible, setFilterVisible] = useState(false);

  const allTags = useMemo(() => getAllTags(tasks), [tasks]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = tasks.filter((task) => {
      const matchesSearch =
        !query || `${task.title} ${task.subject} ${(task.tags ?? []).join(" ")}`.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All" || (filter === "High Priority" ? task.priority === "High" : task.status === filter);
      const matchesTag = !selectedTag || (task.tags ?? []).includes(selectedTag);
      return matchesSearch && matchesFilter && matchesTag;
    });
    return result.sort((a, b) =>
      sortMode === "Due date"
        ? a.dueDate.localeCompare(b.dueDate)
        : sortMode === "Priority"
          ? ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority)
          : b.id.localeCompare(a.id)
    );
  }, [tasks, search, filter, selectedTag, sortMode]);

  const cycleSort = () => setSortMode((current) => sortModes[(sortModes.indexOf(current) + 1) % sortModes.length]);

  const handleSwipeComplete = (taskId: string) => {
    toggleTaskStatus(taskId);
  };

  const handleSwipeDelete = (taskId: string) => {
    Alert.alert("Delete Task?", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask(taskId) },
    ]);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate("TaskDetails", { taskId: item.id })}
      onComplete={() => handleSwipeComplete(item.id)}
      onDelete={() => handleSwipeDelete(item.id)}
    />
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>ORGANIZE</Text>
          <Text style={[styles.title, { color: colors.text }]}>All tasks</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View timeline"
            onPress={() => navigation.navigate("Timeline")}
            style={({ pressed }) => [
              styles.timelineButton,
              { backgroundColor: colors.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.timelineButtonText, { color: colors.primary }]}>Timeline</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add new task"
            onPress={() => navigation.navigate("AddTask")}
            style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks, subjects, or tags"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Search tasks"
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
          returnKeyType="search"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filter: ${filter}`}
          accessibilityHint="Opens filter options"
          onPress={() => setFilterVisible(true)}
          style={({ pressed }) => [
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.filterIcon, { color: colors.primary }]}>≡</Text>
          <Text style={[styles.filterLabel, { color: colors.text }]}>{filter === "All" ? "Filter" : filter}</Text>
        </Pressable>
      </View>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <View style={styles.tagRow}>
          <Pressable
            onPress={() => setSelectedTag(null)}
            accessibilityRole="button"
            accessibilityLabel="Show all tags"
            style={[
              styles.tagChip,
              {
                backgroundColor: !selectedTag ? colors.accent : colors.surface,
                borderColor: !selectedTag ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.tagChipText, { color: !selectedTag ? colors.primary : colors.muted }]}>All</Text>
          </Pressable>
          {allTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by tag ${tag}`}
              style={[
                styles.tagChip,
                {
                  backgroundColor: selectedTag === tag ? colors.accent : colors.surface,
                  borderColor: selectedTag === tag ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.tagChipText, { color: selectedTag === tag ? colors.primary : colors.muted }]}>
                {tag}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.toolbar}>
        <Text style={[styles.resultText, { color: colors.muted }]}>
          {visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"} shown
        </Text>
        <Pressable
          onPress={cycleSort}
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${sortMode}`}
          accessibilityHint="Cycles through sort options"
          style={[styles.sortButton, { backgroundColor: colors.accent }]}
        >
          <Text style={[styles.sortText, { color: colors.primary }]}>Sort: {sortMode}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={visibleTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={visibleTasks.length ? styles.listContent : styles.emptyListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Walay buluhaton!</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                You don't have any tasks yet. Add one when you're ready.
              </Text>
              <Pressable
                onPress={() => navigation.navigate("AddTask")}
                accessibilityRole="button"
                accessibilityLabel="Create a task"
                style={[styles.emptyAction, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.emptyActionText, { color: colors.primary }]}>Create a task</Text>
              </Pressable>
            </View>
          }
        />
      )}

      <Modal animationType="slide" transparent visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter tasks</Text>
              <Pressable
                onPress={() => setFilterVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close filter"
              >
                <Text style={[styles.close, { color: colors.primary }]}>Close</Text>
              </Pressable>
            </View>
            {filters.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setFilter(option);
                  setFilterVisible(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${option}`}
                style={({ pressed }) => [
                  styles.option,
                  { borderBottomColor: colors.border },
                  pressed && styles.optionPressed,
                ]}
              >
                <Text
                  style={[styles.optionText, { color: colors.text }, option === filter && { color: colors.primary }]}
                >
                  {option}
                </Text>
                {option === filter ? <Text style={[styles.check, { color: colors.primary }]}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerActions: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.8 },
  title: { fontSize: 27, fontWeight: "800", marginTop: 5 },
  addButton: { borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  addButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  timelineButton: { borderRadius: 11, paddingHorizontal: 10, paddingVertical: 10 },
  timelineButtonText: { fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.72 },
  searchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  searchInput: { borderRadius: 12, borderWidth: 1, flex: 1, fontSize: 14, height: 48, paddingHorizontal: 14 },
  filterButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    height: 48,
    paddingHorizontal: 12,
  },
  filterIcon: { fontSize: 20, fontWeight: "800", marginRight: 5 },
  filterLabel: { fontSize: 12, fontWeight: "700", maxWidth: 68 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  tagChip: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  tagChipText: { fontSize: 11, fontWeight: "700" },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  resultText: { fontSize: 12, fontWeight: "700" },
  sortButton: { borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7 },
  sortText: { fontSize: 11, fontWeight: "800" },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  emptyListContent: { flexGrow: 1, padding: spacing.md },
  loadingWrap: { padding: spacing.md },
  empty: { alignItems: "center", borderRadius: 18, borderWidth: 1, justifyContent: "center", padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyText: { fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: "center" },
  emptyAction: { borderRadius: 10, marginTop: spacing.md, paddingHorizontal: 15, paddingVertical: 10 },
  emptyActionText: { fontSize: 13, fontWeight: "800" },
  modalBackdrop: { backgroundColor: "rgba(23,33,58,0.35)", flex: 1, justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: spacing.xl },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  close: { fontSize: 13, fontWeight: "800" },
  option: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  optionPressed: { opacity: 0.65 },
  optionText: { fontSize: 15, fontWeight: "600" },
  check: { fontSize: 18, fontWeight: "900" },
});
