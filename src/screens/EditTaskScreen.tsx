import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { TaskForm } from "@/components/TaskForm";
import { useTasks } from "@/context/TaskContext";
import { colors } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";

type Props = NativeStackScreenProps<TasksStackParamList, "EditTask">;

export function EditTaskScreen({ route, navigation }: Props) {
  const { getTaskById, updateTask } = useTasks();
  const task = getTaskById(route.params.taskId);

  if (!task) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.fallback}><Text style={styles.title}>Task not found</Text><Text style={styles.subtitle}>Return to the task list to choose another record.</Text></View></SafeAreaView>;
  }

  return <SafeAreaView style={styles.safeArea}><Text style={styles.title}>Edit task</Text><Text style={styles.subtitle}>Update the record and keep your plan current.</Text><TaskForm initialValues={{ title: task.title, subject: task.subject, description: task.description, dueDate: task.dueDate, priority: task.priority, status: task.status }} submitLabel="Save changes" onSubmit={(values) => { updateTask(task.id, values); Alert.alert("Task Updated", "Your changes were saved.", [{ text: "Continue", onPress: () => navigation.goBack() }]); }} onCancel={() => navigation.goBack()} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontSize: 25, fontWeight: "800", paddingHorizontal: 16, paddingTop: 16 },
  subtitle: { color: colors.muted, fontSize: 13, paddingHorizontal: 16, paddingTop: 6 },
  fallback: { flex: 1, justifyContent: "center", padding: 16 },
});
