import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "@/context/SettingsContext";
import { AddTaskScreen } from "@/screens/AddTaskScreen";
import { EditTaskScreen } from "@/screens/EditTaskScreen";
import { FocusTimerScreen } from "@/screens/FocusTimerScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { TaskDetailsScreen } from "@/screens/TaskDetailsScreen";
import { TaskListScreen } from "@/screens/TaskListScreen";
import { TimelineScreen } from "@/screens/TimelineScreen";
import type { RootTabParamList, TasksStackParamList } from "@/navigation/navigationTypes";

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<TasksStackParamList>();

function TasksStackNavigator() {
  const { colors } = useSettings();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: "New task" }} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: "Task details" }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: "Edit task" }} />
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useSettings();
  const insets = useSafeAreaInsets();
  const minimumBottomInset = Platform.OS === "ios" ? 18 : Platform.OS === "android" ? 24 : 8;
  const bottomInset = Math.max(insets.bottom, minimumBottomInset);
  const navigationBuffer = Platform.OS === "android" && insets.bottom < 20 ? 8 : 0;
  const tabBarHeight = 58 + bottomInset + navigationBuffer;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: colors.accent,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: tabBarHeight,
          paddingBottom: bottomInset + navigationBuffer,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: { marginHorizontal: 6, borderRadius: 14 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800", marginTop: 1 },
        tabBarIconStyle: { marginTop: 1 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarAccessibilityLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStackNavigator}
        options={{
          tabBarLabel: "Tasks",
          tabBarAccessibilityLabel: "Tasks",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "checkmark-done" : "checkmark-done-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: "Insights",
          tabBarAccessibilityLabel: "Insights",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "stats-chart" : "stats-chart-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarAccessibilityLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/** TuonTa! lower-navigation icon: clean, legible, and visibly selected without visual noise. */
function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Ionicons name={name} color={color} size={focused ? 21 : 20} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: "center", justifyContent: "center", height: 24, minWidth: 24 },
  tabIconActive: { transform: [{ translateY: -1 }] },
});
