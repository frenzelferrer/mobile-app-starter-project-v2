import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { TaskProvider } from "@/context/TaskContext";
import { AppNavigator } from "@/navigation/AppNavigator";
import { colors } from "@/theme/colors";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

export default function App() {
  return (
    <TaskProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </TaskProvider>
  );
}
