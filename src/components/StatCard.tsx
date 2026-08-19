import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme/colors";

interface StatCardProps {
  label: string;
  value: number;
  tone?: "primary" | "success" | "warning" | "danger";
}

const toneColors = {
  primary: { background: colors.accent, value: colors.primary },
  success: { background: colors.successSoft, value: colors.success },
  warning: { background: colors.warningSoft, value: colors.warning },
  danger: { background: colors.dangerSoft, value: colors.danger },
};

export function StatCard({ label, value, tone = "primary" }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: toneColors[tone].background }]}>
      <Text style={[styles.value, { color: toneColors[tone].value }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: "44%", borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm },
  value: { fontSize: 26, fontWeight: "800" },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", marginTop: 4 },
});
