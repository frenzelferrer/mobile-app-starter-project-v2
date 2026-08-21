import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { TaskForm } from "@/components/TaskForm";
import { useSettings } from "@/context/SettingsContext";
import { useTasks } from "@/context/TaskContext";
import { spacing } from "@/theme/colors";
import type { TasksStackParamList } from "@/navigation/navigationTypes";

type Props = NativeStackScreenProps<TasksStackParamList, "EditTask">;

export function EditTaskScreen({ route, navigation }: Props) {
  const { colors } = useSettings();
  const { getTaskById, updateTask } = useTasks();
  const task = getTaskById(route.params.taskId);
  if (!task)
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.fallback}>
          <Text style={[styles.title, { color: colors.text }]}>Task not found</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Return to the task list to choose another record.
          </Text>
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Edit task</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Update the record and keep your plan current.</Text>
      <TaskForm
        initialValues={{
          title: task.title,
          subject: task.subject,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          tags: task.tags ?? [],
          recurrence: task.recurrence ?? "none",
          reminderAdvance: task.reminderAdvance ?? "1d",
        }}
        submitLabel="Save changes"
        onSubmit={(values) => {
          updateTask(task.id, values);
          Alert.alert("Task Updated", "Your changes were saved.", [
            { text: "Continue", onPress: () => navigation.goBack() },
          ]);
        }}
        onCancel={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  title: { fontSize: 25, fontWeight: "800", paddingHorizontal: spacing.md, paddingTop: spacing.md },
  subtitle: { fontSize: 13, paddingHorizontal: spacing.md, paddingTop: 6 },
  fallback: { flex: 1, justifyContent: "center", padding: spacing.md },
});
