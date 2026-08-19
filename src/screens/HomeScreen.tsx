import { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { StatCard } from "@/components/StatCard";
import { useTasks } from "@/context/TaskContext";
import { colors, spacing } from "@/theme/colors";
import type { RootTabParamList } from "@/navigation/navigationTypes";
import { formatDate } from "@/utils/validation";

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, "Home">;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { tasks, loading } = useTasks();
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "Completed").length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    high: tasks.filter((task) => task.priority === "High" && task.status === "Pending").length,
  }), [tasks]);
  const upcoming = tasks.filter((task) => task.status === "Pending").slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>STUDYFLOW</Text>
            <Text style={styles.greeting}>Good morning, Student.</Text>
            <Text style={styles.subtitle}>Stay on top of your academic goals.</Text>
          </View>
          <Image source={require("../../assets/images/react-logo.png")} style={styles.avatar} resizeMode="contain" />
        </View>

        {loading ? (
          <View style={styles.loadingBox}><Text style={styles.loadingText}>Preparing your tasks...</Text></View>
        ) : (
          <>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your tasks</Text><Text style={styles.sectionHint}>{stats.pending} pending</Text></View>
            <View style={styles.statsGrid}>
              <StatCard label="Total tasks" value={stats.total} tone="primary" />
              <StatCard label="Completed" value={stats.completed} tone="success" />
              <StatCard label="Pending" value={stats.pending} tone="warning" />
              <StatCard label="High priority" value={stats.high} tone="danger" />
            </View>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Upcoming tasks</Text><Pressable onPress={() => navigation.navigate("Tasks", { screen: "TaskList" })}><Text style={styles.link}>View all</Text></Pressable></View>
            {upcoming.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>You are all caught up.</Text><Text style={styles.emptyText}>Add a task to plan your next study session.</Text></View> : upcoming.map((task) => (
              <Pressable key={task.id} onPress={() => navigation.navigate("Tasks", { screen: "TaskDetails", params: { taskId: task.id } })} style={({ pressed }) => [styles.upcomingCard, pressed && styles.pressed]}>
                <View style={styles.taskDot} />
                <View style={styles.taskText}><Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text><Text style={styles.taskSubject}>{task.subject}</Text></View>
                <Text style={styles.taskDate}>{formatDate(task.dueDate)}</Text>
              </Pressable>
            ))}

            <Pressable onPress={() => navigation.navigate("Tasks", { screen: "AddTask" })} style={({ pressed }) => [styles.addCard, pressed && styles.pressed]}>
              <View style={styles.addIcon}><Text style={styles.addIconText}>+</Text></View>
              <View><Text style={styles.addTitle}>Plan a new task</Text><Text style={styles.addSubtitle}>Capture your next academic deadline.</Text></View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 2, marginBottom: 7 },
  greeting: { color: colors.text, fontSize: 25, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 6 },
  avatar: { backgroundColor: colors.accent, borderRadius: 28, height: 58, padding: 9, width: 58 },
  loadingBox: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, padding: spacing.xl },
  loadingText: { color: colors.muted, fontSize: 14 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm, marginTop: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  sectionHint: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  link: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  emptyCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 13, marginTop: 5 },
  upcomingCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: "row", marginBottom: spacing.sm, padding: spacing.md },
  pressed: { opacity: 0.72 },
  taskDot: { backgroundColor: colors.primary, borderRadius: 6, height: 10, marginRight: spacing.sm, width: 10 },
  taskText: { flex: 1 },
  taskTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  taskSubject: { color: colors.muted, fontSize: 12, marginTop: 3 },
  taskDate: { color: colors.primary, fontSize: 11, fontWeight: "800", marginLeft: spacing.sm },
  addCard: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 17, flexDirection: "row", marginTop: spacing.md, padding: spacing.md },
  addIcon: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 17, height: 34, justifyContent: "center", marginRight: spacing.sm, width: 34 },
  addIconText: { color: colors.white, fontSize: 24, fontWeight: "300", lineHeight: 27 },
  addTitle: { color: colors.white, fontSize: 15, fontWeight: "800" },
  addSubtitle: { color: "#DDE5FF", fontSize: 12, marginTop: 3 },
});
