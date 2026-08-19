import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useSettings } from "@/context/SettingsContext";
import { spacing } from "@/theme/colors";

function validateName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "Please enter your name to continue.";
  if (normalized.length < 2) return "Please use at least two characters.";
  return undefined;
}

export function WelcomeScreen() {
  const { colors, updateSettings } = useSettings();
  const [name, setName] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const float = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(1)).current;

  const normalizedName = useMemo(() => name.trim().replace(/\s+/g, " "), [name]);
  const nameError = hasSubmitted ? validateName(name) : undefined;
  const isValid = !validateName(name);
  const greeting = normalizedName ? `Hi, ${normalizedName}!` : "Hi, future achiever!";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
    ]).start();

    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -7, duration: 1500, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    floatingAnimation.start();
    return () => floatingAnimation.stop();
  }, [fade, float, scale]);

  const handleContinue = () => {
    setHasSubmitted(true);
    if (!isValid || isSaving) return;

    setIsSaving(true);
    Animated.sequence([
      Animated.timing(successScale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.timing(successScale, { toValue: 1.03, duration: 160, useNativeDriver: true }),
      Animated.timing(successScale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start(() => {
      updateSettings({ name: normalizedName, onboardingComplete: true });
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.container, { opacity: fade, transform: [{ scale }] }]}>
            <View style={styles.brandRow}>
              <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
                <Text style={[styles.brandMarkText, { color: colors.primary }]}>T</Text>
              </View>
              <Text style={[styles.brandName, { color: colors.primary }]}>TuonTa!</Text>
            </View>

            <Animated.View style={[styles.hero, { transform: [{ translateY: float }] }]}>
              <View style={[styles.orbit, styles.orbitOne, { borderColor: colors.accent }]} />
              <View style={[styles.orbit, styles.orbitTwo, { borderColor: colors.primary }]} />
              <View style={[styles.logoBackdrop, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image source={require("../../assets/branding/tuonta-icon.png")} style={styles.logo} resizeMode="contain" accessibilityLabel="TuonTa! app icon" />
              </View>
              <View style={[styles.accentDot, { backgroundColor: colors.success }]} />
              <View style={[styles.accentDotSmall, { backgroundColor: colors.primary }]} />
            </Animated.View>

            <Text style={[styles.eyebrow, { color: colors.primary }]}>A BETTER WAY TO BEGIN</Text>
            <Text style={[styles.title, { color: colors.text }]}>Make your next move count.</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>TuonTa! keeps your academic goals clear, organized, and moving forward.</Text>

            <Animated.View style={[styles.greetingCard, { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: successScale }] }]}>
              <Text style={[styles.greetingLabel, { color: colors.muted }]}>YOUR PERSONAL GREETING</Text>
              <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={2}>{greeting}</Text>
              <Text style={[styles.greetingHint, { color: colors.muted }]}>Let’s make progress together.</Text>
            </Animated.View>

            <View style={styles.formBlock}>
              <FormInput
                autoCapitalize="words"
                autoCorrect={false}
                label="What should we call you?"
                maxLength={32}
                onChangeText={(value) => { setName(value); if (hasSubmitted) setHasSubmitted(false); }}
                onSubmitEditing={handleContinue}
                placeholder="Enter your name"
                returnKeyType="done"
                value={name}
                error={nameError}
              />
              <PrimaryButton disabled={!isValid} label={isSaving ? "Preparing your space..." : "Enter TuonTa!"} loading={isSaving} onPress={handleContinue} />
            </View>

            <Text style={[styles.tagline, { color: colors.primary }]}>Tuon ta, human ta.</Text>
            <Text style={[styles.footer, { color: colors.muted }]}>Your tasks, your pace, your progress.</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl },
  container: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 680 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: spacing.xs, marginBottom: spacing.sm },
  brandMark: { alignItems: "center", borderRadius: 13, height: 28, justifyContent: "center", width: 28 },
  brandMarkText: { fontSize: 18, fontWeight: "900" },
  brandName: { fontSize: 17, fontWeight: "900", letterSpacing: 1.4 },
  hero: { alignItems: "center", height: 178, justifyContent: "center", marginBottom: spacing.sm, width: 210 },
  orbit: { borderRadius: 90, borderWidth: 1, height: 176, position: "absolute", transform: [{ rotate: "-14deg" }], width: 176 },
  orbitOne: { opacity: 0.45 },
  orbitTwo: { height: 142, opacity: 0.35, transform: [{ rotate: "22deg" }], width: 142 },
  logoBackdrop: { alignItems: "center", borderRadius: 55, borderWidth: 1, elevation: 5, height: 110, justifyContent: "center", shadowColor: "#0B2BAA", shadowOffset: { height: 10, width: 0 }, shadowOpacity: 0.14, shadowRadius: 18, width: 110 },
  logo: { height: 86, width: 86 },
  accentDot: { borderRadius: 9, bottom: 20, height: 18, position: "absolute", right: 25, width: 18 },
  accentDotSmall: { borderRadius: 5, height: 10, left: 27, position: "absolute", top: 28, width: 10 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: spacing.sm, textAlign: "center" },
  title: { fontSize: 29, fontWeight: "900", lineHeight: 35, marginTop: spacing.sm, maxWidth: 340, textAlign: "center" },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: spacing.sm, maxWidth: 340, textAlign: "center" },
  greetingCard: { borderRadius: 18, borderWidth: 1, marginTop: spacing.lg, padding: spacing.md, width: "100%" },
  greetingLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  greeting: { fontSize: 22, fontWeight: "900", marginTop: 7 },
  greetingHint: { fontSize: 12, marginTop: 4 },
  formBlock: { marginTop: spacing.lg, width: "100%" },
  tagline: { fontSize: 13, fontWeight: "900", marginTop: spacing.lg },
  footer: { fontSize: 12, marginTop: 5 },
});
