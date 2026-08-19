import { Alert, SafeAreaView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { TaskForm } from "@/components/TaskForm";
import { useTasks } from "@/context/TaskContext";
import { colors } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";
import type { TaskFormData } from "@/types/task";

type Props = NativeStackScreenProps<TasksStackParamList, "AddTask">;

const emptyTask: TaskFormData = { title: "", subject: "", description: "", dueDate: "", priority: "Medium", status: "Pending" };

export function AddTaskScreen({ navigation }: Props) {
  const { addTask } = useTasks();

  const handleSubmit = (values: TaskFormData) => {
    addTask(values);
    Alert.alert("Task Created", "Your task was successfully added.", [{ text: "View tasks", onPress: () => navigation.popToTop() }]);
  };

  return <SafeAreaView style={styles.safeArea}><Text style={styles.title}>Add a task</Text><Text style={styles.subtitle}>Turn an upcoming deadline into a clear next step.</Text><TaskForm initialValues={emptyTask} submitLabel="Create task" onSubmit={handleSubmit} onCancel={() => navigation.goBack()} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontSize: 25, fontWeight: "800", paddingHorizontal: 16, paddingTop: 16 },
  subtitle: { color: colors.muted, fontSize: 13, paddingHorizontal: 16, paddingTop: 6 },
});
