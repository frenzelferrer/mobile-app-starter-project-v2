import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";

interface PrimaryButtonProps { label: string; onPress: () => void; variant?: "primary" | "outline" | "danger"; loading?: boolean; disabled?: boolean; }

export function PrimaryButton({ label, onPress, variant = "primary", loading = false, disabled = false }: PrimaryButtonProps) {
  const { colors } = useSettings();
  const isDisabled = disabled || loading;
  const background = variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : colors.surface;
  const textColor = variant === "outline" ? colors.primary : colors.white;
  return <Pressable accessibilityRole="button" disabled={isDisabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: background, borderColor: variant === "outline" ? colors.primary : background }, variant === "outline" && styles.outline, pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled]}>{loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.label, { color: textColor }]}>{label}</Text>}</Pressable>;
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderRadius: 13, borderWidth: 1, justifyContent: "center", minHeight: 50, paddingHorizontal: spacing.lg, paddingVertical: 13 },
  outline: { backgroundColor: "transparent" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  label: { fontSize: 15, fontWeight: "800" },
});
