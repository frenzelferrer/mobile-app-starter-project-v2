import { Alert, SafeAreaView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { TaskForm } from "@/components/TaskForm";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";
import type { TaskFormData } from "@/types/task";

type Props = NativeStackScreenProps<TasksStackParamList, "AddTask">;
const emptyTask: TaskFormData = { title: "", subject: "", description: "", dueDate: "", priority: "Medium", status: "Pending" };

export function AddTaskScreen({ navigation }: Props) {
  const { colors } = useSettings();
  const { addTask } = useTasks();
  const handleSubmit = (values: TaskFormData) => { addTask(values); Alert.alert("Task Created", "Your task was successfully added.", [{ text: "View tasks", onPress: () => navigation.popToTop() }]); };
  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}><Text style={[styles.title, { color: colors.text }]}>Add a task</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Turn an upcoming deadline into a clear next step.</Text><TaskForm initialValues={emptyTask} submitLabel="Create task" onSubmit={handleSubmit} onCancel={() => navigation.goBack()} /></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1 }, title: { fontSize: 25, fontWeight: "800", paddingHorizontal: spacing.md, paddingTop: spacing.md }, subtitle: { fontSize: 13, paddingHorizontal: spacing.md, paddingTop: 6 } });
