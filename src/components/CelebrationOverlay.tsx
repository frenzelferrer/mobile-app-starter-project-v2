import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { useSettings } from "@/context/SettingsContext";

interface CelebrationOverlayProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const confetti = [
  { left: 12, color: "#0DBAA5", rotate: "-18deg" },
  { left: 24, color: "#F79009", rotate: "12deg" },
  { left: 38, color: "#FFFFFF", rotate: "-30deg" },
  { left: 52, color: "#0DBAA5", rotate: "18deg" },
  { left: 66, color: "#F79009", rotate: "-12deg" },
  { left: 80, color: "#FFFFFF", rotate: "30deg" },
];

export function CelebrationOverlay({ visible, title, message, onClose }: CelebrationOverlayProps) {
  const { settings, colors } = useSettings();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!visible) return undefined;
    if (settings.completionFeedbackEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    fade.setValue(0);
    scale.setValue(0.82);
    burst.setValue(0);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }),
      Animated.timing(burst, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();
    closeTimer.current = setTimeout(onClose, 1900);
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, [burst, fade, onClose, scale, settings.completionFeedbackEnabled, visible]);

  return <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.confettiLayer}>{confetti.map((piece, index) => <Animated.View key={`${piece.left}-${index}`} style={[styles.confetti, { backgroundColor: piece.color, left: `${piece.left}%`, transform: [{ translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [80, -80 - (index % 2) * 30] }) }, { rotate: piece.rotate }, { scale: burst.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.65] }) }], opacity: burst.interpolate({ inputRange: [0, 0.18, 0.8, 1], outputRange: [0, 1, 1, 0] }) }]} />)}</View><Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: fade, transform: [{ scale }] }]}><View style={[styles.checkCircle, { backgroundColor: colors.successSoft }]}><Text style={[styles.check, { color: colors.success }]}>✓</Text></View><Text style={[styles.title, { color: colors.text }]}>{title}</Text><Text style={[styles.message, { color: colors.muted }]}>{message}</Text><Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.doneButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.doneText}>Keep going</Text></Pressable></Animated.View></View></Modal>;
}

const styles = StyleSheet.create({
  backdrop: { alignItems: "center", backgroundColor: "rgba(8,18,56,0.66)", flex: 1, justifyContent: "center", padding: 24 }, confettiLayer: { ...StyleSheet.absoluteFill }, confetti: { borderRadius: 2, height: 12, position: "absolute", top: "48%", width: 7 }, card: { alignItems: "center", borderRadius: 24, borderWidth: 1, maxWidth: 340, padding: 26, width: "100%" }, checkCircle: { alignItems: "center", borderRadius: 36, height: 72, justifyContent: "center", width: 72 }, check: { fontSize: 42, fontWeight: "900" }, title: { fontSize: 23, fontWeight: "900", marginTop: 16, textAlign: "center" }, message: { fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: "center" }, doneButton: { borderRadius: 12, marginTop: 20, minWidth: 150, paddingHorizontal: 18, paddingVertical: 12 }, doneText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", textAlign: "center" }, pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
