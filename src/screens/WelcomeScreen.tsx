import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
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

interface TutorialSlide {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
}

const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    emoji: "🏠",
    title: "Home Screen (Home Tab)",
    subtitle: "Your Daily Control Panel",
    description: "Displays your total tasks, completion percentage, and weekly stats. Tap the sun/moon button at the top-right to toggle Dark Mode. Tap the '+' button at the bottom to quickly plan a task, or tap any upcoming task to open its details.",
  },
  {
    emoji: "📋",
    title: "Task Organizer (Tasks Tab)",
    subtitle: "View & Filter Your Workload",
    description: "Manage your academic requirements. Tap 'Timeline' at the top-right to see tasks grouped by due date. Tap '+ Add' to create new tasks. You can also search, filter by tag, or cycle the sort order. Swipe RIGHT on any task card to mark it complete, or swipe LEFT to delete.",
  },
  {
    emoji: "⏱️",
    title: "Study Focus (Focus Timer)",
    subtitle: "Boost Concentration & Pomodoro",
    description: "Click 'Start focus session' inside any task's details. Pick a preset block, use the '+' or '−' buttons to set a custom duration (up to 180 min), or toggle 'Pomodoro' mode for structured 25-minute work rounds and breaks.",
  },
  {
    emoji: "📊",
    title: "Analytics (Insights Tab)",
    subtitle: "Your Momentum & Progress Tracker",
    description: "Examine your habits. View your consecutive daily completion streak (with a fire 🔥 icon), inspect your daily study duration chart over the last 7 days, and look at the focus breakdown to see which subjects consume the most study time.",
  },
  {
    emoji: "👤",
    title: "Profile & Settings (Profile Tab)",
    subtitle: "Personalize & Control Reminders",
    description: "Tap 'Edit profile' to update your name, course, year, and student ID. Toggle push notification reminders and see a list of scheduled deadline reminders. Scroll to the bottom to find the reset button if you want to wipe sample data.",
  },
];

export function WelcomeScreen() {
  const { colors, updateSettings } = useSettings();
  const [step, setStep] = useState<"name" | "tutorial">("name");
  const [activeSlide, setActiveSlide] = useState(0);
  const [name, setName] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const float = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(1)).current;
  const slideFade = useRef(new Animated.Value(1)).current;

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
      ])
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
      setIsSaving(false);
      setStep("tutorial");
    });
  };

  const handleNextSlide = () => {
    if (activeSlide < TUTORIAL_SLIDES.length - 1) {
      Animated.timing(slideFade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setActiveSlide((prev) => prev + 1);
        Animated.timing(slideFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    } else {
      updateSettings({ name: normalizedName, onboardingComplete: true });
    }
  };

  const handlePrevSlide = () => {
    if (activeSlide > 0) {
      Animated.timing(slideFade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setActiveSlide((prev) => prev - 1);
        Animated.timing(slideFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "name" ? (
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
                  <Image
                    source={require("../../assets/branding/tuonta-icon.png")}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="TuonTa! app icon"
                  />
                </View>
                <View style={[styles.accentDot, { backgroundColor: colors.success }]} />
                <View style={[styles.accentDotSmall, { backgroundColor: colors.primary }]} />
              </Animated.View>

              <Text style={[styles.eyebrow, { color: colors.primary }]}>A BETTER WAY TO BEGIN</Text>
              <Text style={[styles.title, { color: colors.text }]}>Make your next move count.</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                TuonTa! keeps your academic goals clear, organized, and moving forward.
              </Text>

              <Animated.View
                style={[
                  styles.greetingCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: successScale }] },
                ]}
              >
                <Text style={[styles.greetingLabel, { color: colors.muted }]}>YOUR PERSONAL GREETING</Text>
                <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={2}>
                  {greeting}
                </Text>
                <Text style={[styles.greetingHint, { color: colors.muted }]}>Let’s make progress together.</Text>
              </Animated.View>

              <View style={styles.formBlock}>
                <FormInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  label="What should we call you?"
                  maxLength={32}
                  onChangeText={(value) => {
                    setName(value);
                    if (hasSubmitted) setHasSubmitted(false);
                  }}
                  onSubmitEditing={handleContinue}
                  placeholder="Enter your name"
                  returnKeyType="done"
                  value={name}
                  error={nameError}
                />
                <PrimaryButton
                  disabled={!isValid}
                  label={isSaving ? "Preparing your space..." : "Enter TuonTa!"}
                  loading={isSaving}
                  onPress={handleContinue}
                />
              </View>

              <Text style={[styles.tagline, { color: colors.primary }]}>Tuon ta, human ta.</Text>
              <Text style={[styles.footer, { color: colors.muted }]}>Your tasks, your pace, your progress.</Text>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.container, { opacity: fade }]}>
              <View style={styles.brandRow}>
                <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.brandMarkText, { color: colors.primary }]}>T</Text>
                </View>
                <Text style={[styles.brandName, { color: colors.primary }]}>TuonTa!</Text>
              </View>

              <Text style={[styles.eyebrow, { color: colors.primary, marginTop: spacing.md }]}>NAVIGATION GUIDE</Text>
              <Text style={[styles.title, { color: colors.text }]}>Explore Your Workspace</Text>

              <Animated.View
                style={[
                  styles.slideCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: slideFade },
                ]}
              >
                <Text style={styles.slideEmoji}>{TUTORIAL_SLIDES[activeSlide].emoji}</Text>
                <Text style={[styles.slideTitle, { color: colors.text }]}>
                  {TUTORIAL_SLIDES[activeSlide].title}
                </Text>
                <Text style={[styles.slideSubtitle, { color: colors.primary }]}>
                  {TUTORIAL_SLIDES[activeSlide].subtitle}
                </Text>
                <Text style={[styles.slideDescription, { color: colors.muted }]}>
                  {TUTORIAL_SLIDES[activeSlide].description}
                </Text>
              </Animated.View>

              {/* Progress Indicator dots */}
              <View style={styles.indicatorRow}>
                {TUTORIAL_SLIDES.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.indicatorDot,
                      {
                        backgroundColor: idx === activeSlide ? colors.primary : colors.border,
                        width: idx === activeSlide ? 18 : 8,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.tutorialActions}>
                {activeSlide > 0 ? (
                  <Pressable
                    onPress={handlePrevSlide}
                    accessibilityRole="button"
                    accessibilityLabel="Previous slide"
                    style={[styles.prevButton, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.prevButtonText, { color: colors.text }]}>Back</Text>
                  </Pressable>
                ) : (
                  <View style={styles.prevPlaceholder} />
                )}

                <Pressable
                  onPress={handleNextSlide}
                  accessibilityRole="button"
                  accessibilityLabel={activeSlide === TUTORIAL_SLIDES.length - 1 ? "Start using TuonTa!" : "Next slide"}
                  style={[styles.nextButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.nextButtonText}>
                    {activeSlide === TUTORIAL_SLIDES.length - 1 ? "Get Started" : "Next"}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
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
  orbit: {
    borderRadius: 90,
    borderWidth: 1,
    height: 176,
    position: "absolute",
    transform: [{ rotate: "-14deg" }],
    width: 176,
  },
  orbitOne: { opacity: 0.45 },
  orbitTwo: { height: 142, opacity: 0.35, transform: [{ rotate: "22deg" }], width: 142 },
  logoBackdrop: {
    alignItems: "center",
    borderRadius: 55,
    borderWidth: 1,
    elevation: 5,
    height: 110,
    justifyContent: "center",
    shadowColor: "#0B2BAA",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    width: 110,
  },
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

  // Tutorial styles
  slideCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.xl,
    width: "100%",
    alignItems: "center",
    minHeight: 330,
    justifyContent: "center",
    shadowColor: "#0B2BAA",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  slideEmoji: { fontSize: 60, marginBottom: spacing.sm },
  slideTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  slideSubtitle: { fontSize: 13, fontWeight: "800", marginTop: 4, marginBottom: spacing.md, textTransform: "uppercase", letterSpacing: 1.2 },
  slideDescription: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  indicatorRow: { flexDirection: "row", gap: 6, marginVertical: spacing.xl, justifyContent: "center" },
  indicatorDot: { height: 8, borderRadius: 4 },
  tutorialActions: { flexDirection: "row", width: "100%", gap: spacing.md },
  prevButton: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  prevButtonText: { fontSize: 15, fontWeight: "800" },
  prevPlaceholder: { flex: 1 },
  nextButton: {
    flex: 1.5,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  nextButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
