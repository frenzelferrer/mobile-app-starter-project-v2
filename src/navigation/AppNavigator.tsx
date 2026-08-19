import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { AddTaskScreen } from "@/screens/AddTaskScreen";
import { EditTaskScreen } from "@/screens/EditTaskScreen";
import { FocusTimerScreen } from "@/screens/FocusTimerScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { TaskDetailsScreen } from "@/screens/TaskDetailsScreen";
import { TaskListScreen } from "@/screens/TaskListScreen";
import { TimelineScreen } from "@/screens/TimelineScreen";
import type { RootTabParamList, TasksStackParamList } from "@/navigation/navigationTypes";

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<TasksStackParamList>();

function TasksStackNavigator() {
  const { colors } = useSettings();
  return <Stack.Navigator screenOptions={{ headerTintColor: colors.text, headerTitleStyle: { fontWeight: "800" }, headerStyle: { backgroundColor: colors.background }, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} /><Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: "New task" }} /><Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: "Task details" }} /><Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: "Edit task" }} /><Stack.Screen name="FocusTimer" component={FocusTimerScreen} options={{ headerShown: false }} /><Stack.Screen name="Timeline" component={TimelineScreen} options={{ headerShown: false }} /></Stack.Navigator>;
}

export function AppNavigator() {
  const { colors } = useSettings();
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 66, paddingBottom: 10, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" } }}><Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home", tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} /> }} /><Tab.Screen name="Tasks" component={TasksStackNavigator} options={{ tabBarLabel: "Tasks", tabBarIcon: ({ color }) => <TabIcon symbol="✓" color={color} /> }} /><Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile", tabBarIcon: ({ color }) => <TabIcon symbol="◉" color={color} /> }} /></Tab.Navigator>;
}

function TabIcon({ symbol, color }: { symbol: string; color: string }) { return <Text style={{ color, fontSize: 20 }}>{symbol}</Text>; }
