import { NavigationContainer, DefaultTheme, type Theme } from "@react-navigation/native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { FocusProvider } from "@/context/FocusContext";
import { TaskProvider } from "@/context/TaskContext";
import { AppNavigator } from "@/navigation/AppNavigator";
import { WelcomeScreen } from "@/screens/WelcomeScreen";

function AppShell() {
  const { colors, settings, loading } = useSettings();
  const navigationTheme: Theme = { ...DefaultTheme, dark: settings.darkMode, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.primary, border: colors.border, notification: colors.primary } };

  if (loading) {
    return <SafeAreaView style={[styles.loadingSafeArea, { backgroundColor: colors.background }]}><View style={styles.loadingContent}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.loadingTitle, { color: colors.text }]}>Preparing your TuonTa! space...</Text><Text style={[styles.loadingSubtitle, { color: colors.muted }]}>Setting up your next step.</Text></View></SafeAreaView>;
  }

  if (!settings.onboardingComplete) {
    return <><StatusBar style={settings.darkMode ? "light" : "dark"} /><WelcomeScreen /></>;
  }

  return <NavigationContainer theme={navigationTheme}><StatusBar style={settings.darkMode ? "light" : "dark"} /><AppNavigator /></NavigationContainer>;
}

export default function App() {
  return <SafeAreaProvider><SettingsProvider><TaskProvider><FocusProvider><AppShell /></FocusProvider></TaskProvider></SettingsProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loadingSafeArea: { flex: 1 },
  loadingContent: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  loadingTitle: { fontSize: 17, fontWeight: "800", marginTop: 18, textAlign: "center" },
  loadingSubtitle: { fontSize: 13, marginTop: 6, textAlign: "center" },
});
