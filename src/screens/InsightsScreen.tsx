import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { StatCard } from "@/components/StatCard";
import { useFocus } from "@/context/FocusContext";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { RootTabParamList } from "@/navigation/navigationTypes";
import {
  calculateStreak,
  dailyFocusMinutes,
  focusBySubject,
  formatDuration,
  longestSession,
  totalFocusMinutes,
  weeklyCompletedTaskCount,
  weeklyFocusMinutes,
  weeklyFocusSessionCount,
  weeklyTaskCount,
} from "@/utils/productivity";

export type InsightsScreenProps = BottomTabScreenProps<RootTabParamList, "Insights">;

export function InsightsScreen({}: InsightsScreenProps) {
  const { colors } = useSettings();
  const { tasks } = useTasks();
  const { sessions } = useFocus();

  const streak = useMemo(() => calculateStreak(tasks), [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.status === "Completed").length, [tasks]);
  const totalFocus = useMemo(() => totalFocusMinutes(sessions), [sessions]);
  const longest = useMemo(() => longestSession(sessions), [sessions]);

  const dailyData = useMemo(() => dailyFocusMinutes(sessions, 7), [sessions]);
  const maxDailyMinutes = useMemo(() => Math.max(...dailyData.map((d) => d.minutes), 30), [dailyData]);

  const subjectData = useMemo(() => focusBySubject(sessions, tasks), [sessions, tasks]);
  const maxSubjectMinutes = useMemo(() => Math.max(...subjectData.map((s) => s.minutes), 1), [subjectData]);

  const weeklyStats = useMemo(
    () => ({
      due: weeklyTaskCount(tasks),
      completed: weeklyCompletedTaskCount(tasks),
      focusMinutes: weeklyFocusMinutes(sessions),
      focusSessions: weeklyFocusSessionCount(sessions),
    }),
    [sessions, tasks]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. Header */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>INSIGHTS</Text>
          <Text style={[styles.title, { color: colors.text }]}>Your progress</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Track your study momentum and focus habits.</Text>
        </View>

        {/* 2. Streak counter */}
        <View
          style={[styles.card, styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="summary"
          accessibilityLabel={`${streak} day study streak`}
        >
          <View style={styles.streakTop}>
            <View style={[styles.streakIconWrap, { backgroundColor: colors.warningSoft }]}>
              <Text style={styles.streakEmoji} accessibilityLabel="Fire emoji">
                🔥
              </Text>
            </View>
            <View style={styles.streakDetails}>
              <View style={styles.streakCountRow}>
                <Text style={[styles.streakCount, { color: colors.text }]}>{streak}</Text>
                <Text style={[styles.streakDaysLabel, { color: colors.text }]}>
                  {streak === 1 ? "day streak" : "days streak"}
                </Text>
              </View>
              <Text style={[styles.streakHeading, { color: colors.warning }]}>
                {streak > 0 ? "Study Streak Active" : "Start Your Streak"}
              </Text>
            </View>
          </View>
          <Text style={[styles.streakMessage, { color: colors.muted }]}>
            {streak > 0
              ? `You've completed tasks for ${streak} consecutive ${streak === 1 ? "day" : "days"}! Keep up the great work.`
              : "Complete a task today to ignite your daily study streak."}
          </Text>
        </View>

        {/* 3. Overview stats row */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard label="Total tasks" value={tasks.length} tone="primary" />
          <StatCard label="Completed" value={completedCount} tone="success" />
          <StatCard label="Total focus" value={formatDuration(totalFocus)} tone="warning" />
          <StatCard label="Longest session" value={formatDuration(longest)} tone="danger" />
        </View>

        {/* 4. Daily focus chart */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Daily focus (last 7 days)</Text>
            <Text style={[styles.chartBadge, { color: colors.primary, backgroundColor: colors.accent }]}>
              {formatDuration(dailyData.reduce((sum, d) => sum + d.minutes, 0))} total
            </Text>
          </View>
          <View style={styles.chartContainer} accessibilityRole="summary" accessibilityLabel="7 day focus time chart">
            {dailyData.map((item) => {
              const barHeightPct = Math.max(
                Math.round((item.minutes / maxDailyMinutes) * 100),
                item.minutes > 0 ? 12 : 6
              );
              const isActive = item.minutes > 0;
              return (
                <View
                  key={item.date}
                  style={styles.chartColumn}
                  accessibilityLabel={`${item.label}: ${item.minutes} minutes`}
                >
                  <Text style={[styles.barValueText, { color: isActive ? colors.primary : "transparent" }]}>
                    {item.minutes > 0 ? `${item.minutes}m` : ""}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.accent }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: isActive ? colors.text : colors.muted }]}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 5. Focus by subject */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Focus by subject</Text>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
            Distribution of your completed study sessions.
          </Text>
          {subjectData.length === 0 ? (
            <View style={styles.emptySubjectBox}>
              <Text style={[styles.emptySubjectText, { color: colors.muted }]}>
                No focus sessions logged yet. Start a timer from your tasks to see subject analytics!
              </Text>
            </View>
          ) : (
            <View style={styles.subjectList}>
              {subjectData.map((item) => {
                const fillWidthPct = Math.max(Math.round((item.minutes / maxSubjectMinutes) * 100), 8);
                return (
                  <View
                    key={item.subject}
                    style={styles.subjectRow}
                    accessibilityRole="text"
                    accessibilityLabel={`${item.subject}: ${formatDuration(item.minutes)}`}
                  >
                    <View style={styles.subjectMeta}>
                      <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={1}>
                        {item.subject}
                      </Text>
                      <Text style={[styles.subjectTime, { color: colors.primary }]}>
                        {formatDuration(item.minutes)}
                      </Text>
                    </View>
                    <View style={[styles.subjectTrack, { backgroundColor: colors.accent }]}>
                      <View
                        style={[
                          styles.subjectFill,
                          {
                            width: `${fillWidthPct}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 6. Weekly momentum card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly momentum</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Your progress at a glance.</Text>
            </View>
            <Text style={[styles.weeklyBadge, { color: colors.primary, backgroundColor: colors.accent }]}>
              THIS WEEK
            </Text>
          </View>
          <View style={styles.weeklyMetrics}>
            <View style={styles.weeklyMetric}>
              <Text style={[styles.weeklyMetricValue, { color: colors.primary }]}>
                {weeklyStats.completed}/{weeklyStats.due}
              </Text>
              <Text style={[styles.weeklyMetricLabel, { color: colors.muted }]}>tasks done</Text>
            </View>
            <View style={[styles.weeklyDivider, { backgroundColor: colors.border }]} />
            <View style={styles.weeklyMetric}>
              <Text style={[styles.weeklyMetricValue, { color: colors.success }]}>
                {formatDuration(weeklyStats.focusMinutes)}
              </Text>
              <Text style={[styles.weeklyMetricLabel, { color: colors.muted }]}>focus time</Text>
            </View>
            <View style={[styles.weeklyDivider, { backgroundColor: colors.border }]} />
            <View style={styles.weeklyMetric}>
              <Text style={[styles.weeklyMetricValue, { color: colors.warning }]}>{weeklyStats.focusSessions}</Text>
              <Text style={[styles.weeklyMetricLabel, { color: colors.muted }]}>sessions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginTop: spacing.md,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    marginTop: 5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  streakCard: {
    marginTop: spacing.sm,
  },
  streakTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  streakIconWrap: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  streakEmoji: {
    fontSize: 22,
  },
  streakDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  streakCountRow: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  streakCount: {
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 30,
  },
  streakDaysLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 6,
  },
  streakHeading: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  streakMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chartHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  chartBadge: {
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chartContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 140,
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  chartColumn: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    marginHorizontal: 3,
  },
  barValueText: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  barTrack: {
    borderRadius: 8,
    flex: 1,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 14,
  },
  barFill: {
    borderRadius: 8,
    width: "100%",
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  emptySubjectBox: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptySubjectText: {
    fontSize: 13,
    lineHeight: 18,
  },
  subjectList: {
    marginTop: spacing.md,
  },
  subjectRow: {
    marginBottom: spacing.md,
  },
  subjectMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  subjectName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  subjectTime: {
    fontSize: 12,
    fontWeight: "800",
  },
  subjectTrack: {
    borderRadius: 6,
    height: 10,
    overflow: "hidden",
    width: "100%",
  },
  subjectFill: {
    borderRadius: 6,
    height: "100%",
  },
  weeklyHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weeklyBadge: {
    borderRadius: 8,
    fontSize: 9,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  weeklyMetrics: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  weeklyMetric: {
    alignItems: "center",
    flex: 1,
  },
  weeklyMetricValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  weeklyMetricLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  weeklyDivider: {
    height: 30,
    width: 1,
  },
});
