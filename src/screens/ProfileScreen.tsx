import { useEffect, useState } from "react";
import { Alert, Button, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { useReminders } from "@/context/ReminderContext";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { RootTabParamList } from "@/navigation/navigationTypes";

export type ProfileScreenProps = BottomTabScreenProps<RootTabParamList, "Profile">;

export function ProfileScreen({}: ProfileScreenProps) {
  const { tasks, resetTasks } = useTasks();
  const { settings, colors, loading: settingsLoading, updateSettings, resetSettings } = useSettings();
  const { permission, scheduledCount, scheduledReminders, syncing, toggleReminders } = useReminders();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(settings.name);
  const [course, setCourse] = useState(settings.course);
  const [yearLevel, setYearLevel] = useState(settings.yearLevel);
  const [studentNumber, setStudentNumber] = useState(settings.studentNumber);

  useEffect(() => {
    if (!settingsLoading) {
      setName(settings.name);
      setCourse(settings.course);
      setYearLevel(settings.yearLevel);
      setStudentNumber(settings.studentNumber);
    }
  }, [settings, settingsLoading]);

  const handleSave = () => {
    if (!name.trim() || !course.trim() || !yearLevel.trim() || !studentNumber.trim()) {
      Alert.alert("Missing information", "Please complete all profile fields before saving.");
      return;
    }
    updateSettings({
      name: name.trim(),
      course: course.trim(),
      yearLevel: yearLevel.trim(),
      studentNumber: studentNumber.trim(),
    });
    setEditing(false);
    Alert.alert("Profile Saved", "Your student details were saved on this device.");
  };

  const handleReset = () =>
    Alert.alert("Reset TuonTa!?", "This restores the sample tasks and default profile settings.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          resetTasks();
          resetSettings();
          setEditing(false);
        },
      },
    ]);

  const handleReminderToggle = async () => {
    const enabled = await toggleReminders();
    if (enabled) Alert.alert("Reminders enabled", "TuonTa! will remind you about upcoming task deadlines.");
    else if (permission !== "granted")
      Alert.alert(
        "Notifications not enabled",
        "Allow notifications in your device settings to receive deadline reminders."
      );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR SPACE</Text>
        <Text style={[styles.title, { color: colors.text }]}>Profile & settings</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Personalize your study workspace.</Text>

        {/* Profile card */}
        <View
          style={[styles.profileCard, { backgroundColor: colors.primary }]}
          accessibilityRole="summary"
          accessibilityLabel={`Profile: ${settings.name}, ${settings.course}, ${settings.yearLevel}`}
        >
          <Image
            source={require("../../assets/branding/tuonta-logo.png")}
            style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)", width: 150 }]}
            resizeMode="contain"
            accessibilityLabel="TuonTa! logo"
          />
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{settings.name}</Text>
            <Text style={styles.course}>{settings.course}</Text>
            <Text style={styles.year}>
              {settings.yearLevel} · {settings.studentNumber}
            </Text>
          </View>
        </View>

        {/* Student details */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Student details</Text>
          <Text style={[styles.label, { color: colors.text }]}>Display name</Text>
          <TextInput
            editable={editing}
            value={name}
            onChangeText={setName}
            accessibilityLabel="Display name"
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              !editing && { backgroundColor: colors.background },
            ]}
            placeholder="Your Name"
            placeholderTextColor={colors.muted}
          />
          <Text style={[styles.label, { color: colors.text }]}>Course</Text>
          <TextInput
            editable={editing}
            value={course}
            onChangeText={setCourse}
            accessibilityLabel="Course"
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              !editing && { backgroundColor: colors.background },
            ]}
            placeholder="BS Information Technology"
            placeholderTextColor={colors.muted}
          />
          <Text style={[styles.label, { color: colors.text }]}>Year level</Text>
          <TextInput
            editable={editing}
            value={yearLevel}
            onChangeText={setYearLevel}
            accessibilityLabel="Year level"
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              !editing && { backgroundColor: colors.background },
            ]}
            placeholder="3rd Year"
            placeholderTextColor={colors.muted}
          />
          <Text style={[styles.label, { color: colors.text }]}>Student number</Text>
          <TextInput
            editable={editing}
            value={studentNumber}
            onChangeText={setStudentNumber}
            accessibilityLabel="Student number"
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              !editing && { backgroundColor: colors.background },
            ]}
            placeholder="2025XXXXX"
            placeholderTextColor={colors.muted}
          />
          <View style={styles.buttonWrap}>
            {editing ? (
              <Button title="Save profile" color={colors.primary} onPress={handleSave} />
            ) : (
              <Button title="Edit profile" color={colors.primary} onPress={() => setEditing(true)} />
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.appDescription, { color: colors.muted }]}>
            Use the moon/sun button on the Home screen to switch between light and dark mode.
          </Text>

          {/* Deadline reminders toggle */}
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Deadline reminders"
            accessibilityState={{ checked: settings.remindersEnabled && permission === "granted" }}
            onPress={handleReminderToggle}
            style={styles.settingRow}
          >
            <View style={styles.settingCopy}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Deadline reminders</Text>
              <Text style={[styles.preferenceText, { color: colors.muted }]}>
                {syncing
                  ? "Updating your reminder schedule..."
                  : permission === "denied"
                    ? "Allow notifications in device settings."
                    : scheduledCount
                      ? `${scheduledCount} deadline reminders scheduled.`
                      : "Get reminded before pending deadlines."}
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor:
                    settings.remindersEnabled && permission === "granted" ? colors.success : colors.border,
                },
              ]}
            >
              <View
                style={[styles.toggleDot, settings.remindersEnabled && permission === "granted" && styles.toggleDotOn]}
              />
            </View>
          </Pressable>

          {/* Scheduled reminders list */}
          {scheduledReminders.length > 0 && (
            <View style={[styles.reminderList, { borderTopColor: colors.border }]}>
              <Text style={[styles.reminderListTitle, { color: colors.text }]}>Upcoming reminders</Text>
              {scheduledReminders.slice(0, 5).map((r) => (
                <View key={r.taskId} style={styles.reminderItem}>
                  <View style={[styles.reminderDot, { backgroundColor: colors.warning }]} />
                  <View style={styles.reminderCopy}>
                    <Text style={[styles.reminderTask, { color: colors.text }]} numberOfLines={1}>
                      {r.taskTitle}
                    </Text>
                    <Text style={[styles.reminderDate, { color: colors.muted }]}>
                      {r.subject} ·{" "}
                      {r.reminderDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Celebration feedback toggle */}
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Celebration feedback"
            accessibilityState={{ checked: settings.completionFeedbackEnabled }}
            onPress={() => updateSettings({ completionFeedbackEnabled: !settings.completionFeedbackEnabled })}
            style={[styles.settingRow, styles.preferenceRow]}
          >
            <View style={styles.settingCopy}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Celebration feedback</Text>
              <Text style={[styles.preferenceText, { color: colors.muted }]}>
                Show confetti and success haptics when you finish.
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                { backgroundColor: settings.completionFeedbackEnabled ? colors.primary : colors.border },
              ]}
            >
              <View style={[styles.toggleDot, settings.completionFeedbackEnabled && styles.toggleDotOn]} />
            </View>
          </Pressable>

          <View style={[styles.statsLine, { borderTopColor: colors.border }]}>
            <Text style={[styles.muted, { color: colors.muted }]}>Tasks currently saved</Text>
            <Text style={[styles.value, { color: colors.primary }]}>{tasks.length}</Text>
          </View>
          <View style={styles.buttonWrap}>
            <Button title="Reset sample data" color={colors.danger} onPress={handleReset} />
          </View>
          <Text style={[styles.appDescription, { color: colors.muted }]}>
            TuonTa! helps students organize academic tasks, deadlines, and responsibilities in one place.
          </Text>
          <Text style={[styles.tagline, { color: colors.primary }]}>Tuon ta, human ta.</Text>
          <Text style={[styles.version, { color: colors.muted }]}>TuonTa! · Version 2.0 · Enhanced Edition</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: spacing.md },
  title: { fontSize: 27, fontWeight: "800", marginTop: 5 },
  subtitle: { fontSize: 13, marginTop: 6 },
  profileCard: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  avatar: { borderRadius: 38, height: 68, padding: 10, width: 68 },
  profileCopy: { flex: 1, marginLeft: spacing.md },
  name: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  course: { color: "#DDE5FF", fontSize: 13, marginTop: 5 },
  year: { color: "#DDE5FF", fontSize: 11, marginTop: 4 },
  card: { borderRadius: 18, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: spacing.sm },
  input: { borderRadius: 10, borderWidth: 1, fontSize: 14, padding: 12 },
  buttonWrap: { marginTop: spacing.md },
  appDescription: { fontSize: 13, marginBottom: spacing.md },
  settingRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  preferenceRow: { marginTop: spacing.lg },
  settingCopy: { flex: 1 },
  preferenceTitle: { fontSize: 14, fontWeight: "800" },
  preferenceText: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  toggle: { borderRadius: 16, height: 30, justifyContent: "center", paddingHorizontal: 4, width: 52 },
  toggleDot: { backgroundColor: "#FFFFFF", borderRadius: 11, height: 22, transform: [{ translateX: 0 }], width: 22 },
  toggleDotOn: { transform: [{ translateX: 22 }] },
  reminderList: { borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.sm },
  reminderListTitle: { fontSize: 13, fontWeight: "800", marginBottom: spacing.sm },
  reminderItem: { alignItems: "center", flexDirection: "row", marginBottom: spacing.xs },
  reminderDot: { borderRadius: 4, height: 8, marginRight: spacing.sm, width: 8 },
  reminderCopy: { flex: 1 },
  reminderTask: { fontSize: 13, fontWeight: "700" },
  reminderDate: { fontSize: 11, marginTop: 2 },
  statsLine: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  muted: { fontSize: 13 },
  value: { fontSize: 20, fontWeight: "800" },
  tagline: { fontSize: 13, fontWeight: "800", marginTop: spacing.xs },
  version: { fontSize: 12, marginTop: spacing.md },
});
