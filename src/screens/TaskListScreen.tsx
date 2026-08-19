import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { TaskCard } from "@/components/TaskCard";
import { useTasks } from "@/context/TaskContext";
import { colors, spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";
import type { Task } from "@/types/task";

type Filter = "All" | "Pending" | "Completed" | "High Priority";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskList">;
const filters: Filter[] = ["All", "Pending", "Completed", "High Priority"];

export function TaskListScreen({ navigation }: Props) {
  const { tasks, loading } = useTasks();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [filterVisible, setFilterVisible] = useState(false);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = !query || `${task.title} ${task.subject}`.toLowerCase().includes(query);
      const matchesFilter = filter === "All" || (filter === "High Priority" ? task.priority === "High" : task.status === filter);
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const renderTask = ({ item }: { item: Task }) => <TaskCard task={item} onPress={() => navigation.navigate("TaskDetails", { taskId: item.id })} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>ORGANIZE</Text><Text style={styles.title}>All tasks</Text></View>
        <Pressable onPress={() => navigation.navigate("AddTask")} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Text style={styles.addButtonText}>+ Add</Text></Pressable>
      </View>
      <View style={styles.searchRow}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search tasks or subjects" placeholderTextColor={colors.muted} style={styles.searchInput} returnKeyType="search" />
        <Pressable accessibilityRole="button" onPress={() => setFilterVisible(true)} style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}><Text style={styles.filterIcon}>≡</Text><Text style={styles.filterLabel}>{filter === "All" ? "Filter" : filter}</Text></Pressable>
      </View>
      <Text style={styles.resultText}>{visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"} shown</Text>

      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Loading your tasks...</Text></View> : <FlatList data={visibleTasks} keyExtractor={(item) => item.id} renderItem={renderTask} contentContainerStyle={visibleTasks.length ? styles.listContent : styles.emptyListContent} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No tasks found</Text><Text style={styles.emptyText}>Try a different search or add a new academic task.</Text><Pressable onPress={() => navigation.navigate("AddTask")} style={styles.emptyAction}><Text style={styles.emptyActionText}>Create a task</Text></Pressable></View>} />}

      <Modal animationType="slide" transparent visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Filter tasks</Text><Pressable onPress={() => setFilterVisible(false)}><Text style={styles.close}>Close</Text></Pressable></View>
            {filters.map((option) => <Pressable key={option} onPress={() => { setFilter(option); setFilterVisible(false); }} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}><Text style={[styles.optionText, option === filter && styles.selectedOption]}>{option}</Text>{option === filter ? <Text style={styles.check}>✓</Text> : null}</Pressable>)}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 27, fontWeight: "800", marginTop: 5 },
  addButton: { backgroundColor: colors.primary, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  addButtonText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72 },
  searchRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  searchInput: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, flex: 1, fontSize: 14, height: 48, paddingHorizontal: 14 },
  filterButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: "row", height: 48, paddingHorizontal: 12 },
  filterIcon: { color: colors.primary, fontSize: 20, fontWeight: "800", marginRight: 5 },
  filterLabel: { color: colors.text, fontSize: 12, fontWeight: "700", maxWidth: 68 },
  resultText: { color: colors.muted, fontSize: 12, fontWeight: "700", paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  emptyListContent: { flexGrow: 1, padding: spacing.md },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  loadingText: { color: colors.muted, fontSize: 14, marginTop: spacing.sm },
  empty: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, justifyContent: "center", padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: "center" },
  emptyAction: { backgroundColor: colors.accent, borderRadius: 10, marginTop: spacing.md, paddingHorizontal: 15, paddingVertical: 10 },
  emptyActionText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  modalBackdrop: { backgroundColor: "rgba(23,33,58,0.35)", flex: 1, justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: spacing.xl },
  modalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  close: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  option: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.md },
  optionPressed: { opacity: 0.65 },
  optionText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  selectedOption: { color: colors.primary, fontWeight: "800" },
  check: { color: colors.primary, fontSize: 18, fontWeight: "900" },
});
