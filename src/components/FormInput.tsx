import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { colors, spacing } from "@/theme/colors";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.muted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 5 },
});
