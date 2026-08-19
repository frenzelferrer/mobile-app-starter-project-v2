import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing } from "@/theme/colors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger";
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, variant = "primary", loading = false, disabled = false }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={variant === "outline" ? colors.primary : colors.white} /> : <Text style={[styles.label, variant === "outline" && styles.outlineLabel, variant === "danger" && styles.dangerLabel]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderRadius: 13, justifyContent: "center", minHeight: 50, paddingHorizontal: spacing.lg, paddingVertical: 13 },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
  danger: { backgroundColor: colors.danger },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  label: { color: colors.white, fontSize: 15, fontWeight: "800" },
  outlineLabel: { color: colors.primary },
  dangerLabel: { color: colors.white },
});
