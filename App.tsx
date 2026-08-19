import { NavigationContainer, DefaultTheme, type Theme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { TaskProvider } from "@/context/TaskContext";
import { AppNavigator } from "@/navigation/AppNavigator";

function AppShell() {
  const { colors, settings } = useSettings();
  const navigationTheme: Theme = { ...DefaultTheme, dark: settings.darkMode, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.primary, border: colors.border, notification: colors.primary } };
  return <NavigationContainer theme={navigationTheme}><StatusBar style={settings.darkMode ? "light" : "dark"} /><AppNavigator /></NavigationContainer>;
}

export default function App() {
  return <SafeAreaProvider><SettingsProvider><TaskProvider><AppShell /></TaskProvider></SettingsProvider></SafeAreaProvider>;
}
