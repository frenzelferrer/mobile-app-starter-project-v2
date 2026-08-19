import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";
import type { Priority, TaskFormData, TaskStatus } from "@/types/task";
import { validateTaskForm, type ValidationErrors } from "@/utils/validation";

interface TaskFormProps { initialValues: TaskFormData; submitLabel: string; onSubmit: (values: TaskFormData) => void; onCancel: () => void; }
const priorities: Priority[] = ["Low", "Medium", "High"];
const statuses: TaskStatus[] = ["Pending", "Completed"];

export function TaskForm({ initialValues, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const { colors } = useSettings();
  const [values, setValues] = useState<TaskFormData>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => { setValues((current) => ({ ...current, [field]: value })); if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined })); };
  const handleSubmit = () => { const nextErrors = validateTaskForm(values); setErrors(nextErrors); if (Object.keys(nextErrors).length > 0) return; setSaving(true); setTimeout(() => { onSubmit({ ...values, title: values.title.trim(), subject: values.subject.trim(), description: values.description.trim(), dueDate: values.dueDate.trim() }); setSaving(false); }, 180); };

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><Text style={[styles.helper, { color: colors.muted }]}>Keep each record specific so it is easy to act on.</Text><FormInput label="Task title" value={values.title} onChangeText={(value) => updateField("title", value)} placeholder="e.g. Finish mobile app" error={errors.title} autoCapitalize="sentences" /><FormInput label="Subject" value={values.subject} onChangeText={(value) => updateField("subject", value)} placeholder="e.g. Mobile Development" error={errors.subject} autoCapitalize="words" /><FormInput label="Description" value={values.description} onChangeText={(value) => updateField("description", value)} placeholder="What needs to be completed?" error={errors.description} multiline numberOfLines={4} style={styles.multiline} autoCapitalize="sentences" /><FormInput label="Due date" value={values.dueDate} onChangeText={(value) => updateField("dueDate", value)} placeholder="YYYY-MM-DD" error={errors.dueDate} keyboardType="numbers-and-punctuation" autoCapitalize="none" /><Text style={[styles.label, { color: colors.text }]}>Priority</Text><View style={styles.choiceRow}>{priorities.map((priority) => <Pressable key={priority} onPress={() => updateField("priority", priority)} style={[styles.choice, { backgroundColor: colors.surface, borderColor: colors.border }, values.priority === priority && { backgroundColor: colors.accent, borderColor: colors.primary }]}><Text style={[styles.choiceText, { color: colors.muted }, values.priority === priority && { color: colors.primary }]}>{priority}</Text></Pressable>)}</View>{errors.priority ? <Text style={[styles.error, { color: colors.danger }]}>{errors.priority}</Text> : null}<Text style={[styles.label, { color: colors.text }]}>Status</Text><View style={styles.choiceRow}>{statuses.map((status) => <Pressable key={status} onPress={() => updateField("status", status)} style={[styles.choice, { backgroundColor: colors.surface, borderColor: colors.border }, values.status === status && { backgroundColor: colors.accent, borderColor: colors.primary }]}><Text style={[styles.choiceText, { color: colors.muted }, values.status === status && { color: colors.primary }]}>{status}</Text></Pressable>)}</View>{errors.status ? <Text style={[styles.error, { color: colors.danger }]}>{errors.status}</Text> : null}<View style={styles.actions}><PrimaryButton label={submitLabel} onPress={handleSubmit} loading={saving} /><PrimaryButton label="Cancel" onPress={onCancel} variant="outline" disabled={saving} /></View></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  helper: { fontSize: 13, lineHeight: 19, marginBottom: spacing.lg },
  multiline: { minHeight: 105, textAlignVertical: "top" },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  choiceRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  choice: { borderRadius: 11, borderWidth: 1, flex: 1, paddingVertical: 12, alignItems: "center" },
  choiceText: { fontSize: 13, fontWeight: "700" },
  error: { fontSize: 12, marginBottom: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
