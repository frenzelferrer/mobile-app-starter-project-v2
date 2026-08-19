import { StyleSheet, Text, View } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";

interface StatCardProps { label: string; value: number; tone?: "primary" | "success" | "warning" | "danger"; }

export function StatCard({ label, value, tone = "primary" }: StatCardProps) {
  const { colors } = useSettings();
  const toneColors = {
    primary: { background: colors.accent, value: colors.primary },
    success: { background: colors.successSoft, value: colors.success },
    warning: { background: colors.warningSoft, value: colors.warning },
    danger: { background: colors.dangerSoft, value: colors.danger },
  };
  return <View style={[styles.card, { backgroundColor: toneColors[tone].background }]}><Text style={[styles.value, { color: toneColors[tone].value }]}>{value}</Text><Text style={[styles.label, { color: colors.muted }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: "44%", borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm },
  value: { fontSize: 26, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "700", marginTop: 4 },
});
