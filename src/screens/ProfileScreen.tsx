import { useState } from "react";
import { Alert, Button, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { useTasks } from "@/context/TaskContext";
import { colors, spacing } from "@/theme/colors";
import type { RootTabParamList } from "@/navigation/navigationTypes";

export type ProfileScreenProps = BottomTabScreenProps<RootTabParamList, "Profile">;

export function ProfileScreen({}: ProfileScreenProps) {
  const { tasks } = useTasks();
  const [name, setName] = useState("Your Name");
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    Alert.alert("Profile Saved", "Your display name is ready for your presentation.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>YOUR SPACE</Text><Text style={styles.title}>Profile & settings</Text><Text style={styles.subtitle}>Keep your student details easy to update.</Text>
        <View style={styles.profileCard}><Image source={require("../../assets/images/react-logo.png")} style={styles.avatar} resizeMode="contain" /><View style={styles.profileCopy}><Text style={styles.name}>{name}</Text><Text style={styles.course}>BS Information Technology</Text><Text style={styles.year}>3rd Year · Student Number: 2025XXXXX</Text></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Student details</Text><Text style={styles.label}>Display name</Text><TextInput editable={editing} value={name} onChangeText={setName} style={[styles.input, !editing && styles.inputDisabled]} placeholder="Your Name" placeholderTextColor={colors.muted} /><Text style={styles.label}>Course</Text><Text style={styles.readOnly}>BS Information Technology</Text><Text style={styles.label}>Year level</Text><Text style={styles.readOnly}>3rd Year</Text><View style={styles.buttonWrap}>{editing ? <Button title="Save profile" color={colors.primary} onPress={handleSave} /> : <Button title="Edit profile" color={colors.primary} onPress={() => setEditing(true)} />}</View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>StudyFlow</Text><Text style={styles.appDescription}>Student Task Management App</Text><View style={styles.statsLine}><Text style={styles.muted}>Tasks currently in memory</Text><Text style={styles.value}>{tasks.length}</Text></View><Text style={styles.version}>Version 1.0 · Built for Midterm Task No. 4</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: spacing.md },
  title: { color: colors.text, fontSize: 27, fontWeight: "800", marginTop: 5 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 6 },
  profileCard: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 20, flexDirection: "row", marginTop: spacing.lg, padding: spacing.lg },
  avatar: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 38, height: 68, padding: 10, width: 68 },
  profileCopy: { flex: 1, marginLeft: spacing.md },
  name: { color: colors.white, fontSize: 19, fontWeight: "800" },
  course: { color: "#DDE5FF", fontSize: 13, marginTop: 5 },
  year: { color: "#DDE5FF", fontSize: 11, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: spacing.sm },
  input: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, fontSize: 14, padding: 12 },
  inputDisabled: { backgroundColor: colors.background },
  readOnly: { color: colors.muted, fontSize: 14, paddingVertical: 10 },
  buttonWrap: { marginTop: spacing.md },
  appDescription: { color: colors.muted, fontSize: 13, marginBottom: spacing.md },
  statsLine: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: spacing.md },
  muted: { color: colors.muted, fontSize: 13 },
  value: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  version: { color: colors.muted, fontSize: 12, marginTop: spacing.md },
});
