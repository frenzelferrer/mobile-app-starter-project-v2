import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";
import type { Priority, Recurrence, ReminderAdvance, TaskFormData, TaskStatus } from "@/types/task";
import { validateTaskForm, type ValidationErrors } from "@/utils/validation";

interface TaskFormProps {
  initialValues: TaskFormData;
  submitLabel: string;
  onSubmit: (values: TaskFormData) => void;
  onCancel: () => void;
}
const priorities: Priority[] = ["Low", "Medium", "High"];
const statuses: TaskStatus[] = ["Pending", "Completed"];
const recurrences: { value: Recurrence; label: string }[] = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
];
const reminderOptions: { value: ReminderAdvance; label: string }[] = [
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "1w", label: "1 week" },
];

const SUGGESTED_TAGS = ["project", "exam", "quiz", "homework", "reading", "lab", "review", "presentation"];

export function TaskForm({ initialValues, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const { colors } = useSettings();
  const [values, setValues] = useState<TaskFormData>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field as keyof ValidationErrors]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const addTag = (tag: string) => {
    const cleaned = tag.trim().toLowerCase();
    if (!cleaned) return;
    const current = values.tags ?? [];
    if (current.includes(cleaned)) return;
    updateField("tags", [...current, cleaned]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      (values.tags ?? []).filter((t) => t !== tag)
    );
  };

  const handleSubmit = () => {
    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    setTimeout(() => {
      onSubmit({
        ...values,
        title: values.title.trim(),
        subject: values.subject.trim(),
        description: values.description.trim(),
        dueDate: values.dueDate.trim(),
      });
      setSaving(false);
    }, 180);
  };

  const unusedSuggestions = SUGGESTED_TAGS.filter((t) => !(values.tags ?? []).includes(t));

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.helper, { color: colors.muted }]}>Keep each record specific so it is easy to act on.</Text>

        <FormInput
          label="Task title"
          value={values.title}
          onChangeText={(value) => updateField("title", value)}
          placeholder="e.g. Finish mobile app"
          error={errors.title}
          autoCapitalize="sentences"
        />
        <FormInput
          label="Subject"
          value={values.subject}
          onChangeText={(value) => updateField("subject", value)}
          placeholder="e.g. Mobile Development"
          error={errors.subject}
          autoCapitalize="words"
        />
        <FormInput
          label="Description"
          value={values.description}
          onChangeText={(value) => updateField("description", value)}
          placeholder="What needs to be completed?"
          error={errors.description}
          multiline
          numberOfLines={4}
          style={styles.multiline}
          autoCapitalize="sentences"
        />
        <FormInput
          label="Due date"
          value={values.dueDate}
          onChangeText={(value) => updateField("dueDate", value)}
          placeholder="YYYY-MM-DD"
          error={errors.dueDate}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />

        {/* Tags */}
        <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
        <View style={styles.tagRow}>
          {(values.tags ?? []).map((tag) => (
            <Pressable
              key={tag}
              onPress={() => removeTag(tag)}
              accessibilityRole="button"
              accessibilityLabel={`Remove tag ${tag}`}
              style={[styles.tag, { backgroundColor: colors.accent, borderColor: colors.primary }]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag} ✕</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.tagInputRow}>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => addTag(tagInput)}
            placeholder="Add a tag..."
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            autoCapitalize="none"
            style={[
              styles.tagInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
          />
          <Pressable
            onPress={() => addTag(tagInput)}
            accessibilityRole="button"
            accessibilityLabel="Add tag"
            style={[styles.tagAddButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.tagAddText}>+</Text>
          </Pressable>
        </View>
        {unusedSuggestions.length > 0 && (
          <View style={styles.suggestedRow}>
            {unusedSuggestions.slice(0, 5).map((tag) => (
              <Pressable
                key={tag}
                onPress={() => addTag(tag)}
                accessibilityRole="button"
                accessibilityLabel={`Add tag ${tag}`}
                style={[styles.suggestedTag, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.suggestedText, { color: colors.muted }]}>+ {tag}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Priority */}
        <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
        <View style={styles.choiceRow}>
          {priorities.map((priority) => (
            <Pressable
              key={priority}
              onPress={() => updateField("priority", priority)}
              accessibilityRole="button"
              accessibilityLabel={`Set priority to ${priority}`}
              style={[
                styles.choice,
                { backgroundColor: colors.surface, borderColor: colors.border },
                values.priority === priority && { backgroundColor: colors.accent, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  { color: colors.muted },
                  values.priority === priority && { color: colors.primary },
                ]}
              >
                {priority}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.priority ? <Text style={[styles.error, { color: colors.danger }]}>{errors.priority}</Text> : null}

        {/* Status */}
        <Text style={[styles.label, { color: colors.text }]}>Status</Text>
        <View style={styles.choiceRow}>
          {statuses.map((status) => (
            <Pressable
              key={status}
              onPress={() => updateField("status", status)}
              accessibilityRole="button"
              accessibilityLabel={`Set status to ${status}`}
              style={[
                styles.choice,
                { backgroundColor: colors.surface, borderColor: colors.border },
                values.status === status && { backgroundColor: colors.accent, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  { color: colors.muted },
                  values.status === status && { color: colors.primary },
                ]}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.status ? <Text style={[styles.error, { color: colors.danger }]}>{errors.status}</Text> : null}

        {/* Recurrence */}
        <Text style={[styles.label, { color: colors.text }]}>Repeat</Text>
        <View style={styles.choiceRow}>
          {recurrences.map((r) => (
            <Pressable
              key={r.value}
              onPress={() => updateField("recurrence", r.value)}
              accessibilityRole="button"
              accessibilityLabel={`Set recurrence to ${r.label}`}
              style={[
                styles.choiceSmall,
                { backgroundColor: colors.surface, borderColor: colors.border },
                values.recurrence === r.value && { backgroundColor: colors.accent, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.choiceTextSmall,
                  { color: colors.muted },
                  values.recurrence === r.value && { color: colors.primary },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Reminder advance */}
        <Text style={[styles.label, { color: colors.text }]}>Remind me</Text>
        <View style={styles.choiceRow}>
          {reminderOptions.map((r) => (
            <Pressable
              key={r.value}
              onPress={() => updateField("reminderAdvance", r.value)}
              accessibilityRole="button"
              accessibilityLabel={`Set reminder ${r.label} before`}
              style={[
                styles.choice,
                { backgroundColor: colors.surface, borderColor: colors.border },
                values.reminderAdvance === r.value && { backgroundColor: colors.accent, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  { color: colors.muted },
                  values.reminderAdvance === r.value && { color: colors.primary },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.reminderHint, { color: colors.muted }]}>Before the due date</Text>

        <View style={styles.actions}>
          <PrimaryButton label={submitLabel} onPress={handleSubmit} loading={saving} />
          <PrimaryButton label="Cancel" onPress={onCancel} variant="outline" disabled={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  helper: { fontSize: 13, lineHeight: 19, marginBottom: spacing.lg },
  multiline: { minHeight: 105, textAlignVertical: "top" },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  choiceRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm, flexWrap: "wrap" },
  choice: { borderRadius: 11, borderWidth: 1, flex: 1, paddingVertical: 12, alignItems: "center", minWidth: 70 },
  choiceText: { fontSize: 13, fontWeight: "700" },
  choiceSmall: { borderRadius: 9, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 10, alignItems: "center" },
  choiceTextSmall: { fontSize: 11, fontWeight: "700" },
  error: { fontSize: 12, marginBottom: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.sm },
  tag: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 12, fontWeight: "700" },
  tagInputRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xs },
  tagInput: { borderRadius: 10, borderWidth: 1, flex: 1, fontSize: 14, height: 40, paddingHorizontal: 12 },
  tagAddButton: { alignItems: "center", borderRadius: 10, height: 40, justifyContent: "center", width: 40 },
  tagAddText: { color: "#FFFFFF", fontSize: 22, fontWeight: "300", lineHeight: 24 },
  suggestedRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.md },
  suggestedTag: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  suggestedText: { fontSize: 11, fontWeight: "600" },
  reminderHint: { fontSize: 11, marginTop: -4, marginBottom: spacing.sm },
});
