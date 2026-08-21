import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const { colors } = useSettings();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text },
          style,
        ]}
        placeholderTextColor={colors.muted}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: { borderRadius: 12, borderWidth: 1, fontSize: 15, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12 },
  error: { fontSize: 12, marginTop: 5 },
});
