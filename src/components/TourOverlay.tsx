import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { TOUR_STEPS, useTour } from "@/context/TourContext";
import { spacing } from "@/theme/colors";

function SwipeDemo() {
  const { colors } = useSettings();
  const swipeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        // Swipe right (complete)
        Animated.timing(swipeAnim, { toValue: 80, duration: 1000, useNativeDriver: true }),
        Animated.delay(1000),
        // Swipe back
        Animated.timing(swipeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.delay(500),
        // Swipe left (delete)
        Animated.timing(swipeAnim, { toValue: -80, duration: 1000, useNativeDriver: true }),
        Animated.delay(1000),
        // Swipe back
        Animated.timing(swipeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [swipeAnim]);

  const bgCompleteOpacity = swipeAnim.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const bgDeleteOpacity = swipeAnim.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.demoContainer, { borderColor: colors.border }]}>
      {/* Background action complete */}
      <Animated.View
        style={[
          styles.demoBg,
          styles.demoBgComplete,
          { backgroundColor: colors.successSoft, opacity: bgCompleteOpacity },
        ]}
      >
        <Text style={[styles.demoBgText, { color: colors.success }]}>✓ Complete</Text>
      </Animated.View>

      {/* Background action delete */}
      <Animated.View
        style={[styles.demoBg, styles.demoBgDelete, { backgroundColor: colors.dangerSoft, opacity: bgDeleteOpacity }]}
      >
        <Text style={[styles.demoBgText, { color: colors.danger }]}>Delete ✕</Text>
      </Animated.View>

      {/* Sliding card */}
      <Animated.View
        style={[
          styles.demoCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ translateX: swipeAnim }],
          },
        ]}
      >
        <View style={styles.demoHeader}>
          <Text style={[styles.demoTitle, { color: colors.text }]} numberOfLines={1}>
            Demo Assignment Task
          </Text>
          <Text
            style={[
              styles.demoTag,
              { backgroundColor: colors.dangerSoft, color: colors.danger, borderColor: colors.danger },
            ]}
          >
            HIGH
          </Text>
        </View>
        <Text style={[styles.demoSubtitle, { color: colors.muted }]}>Swipe right to complete, left to delete.</Text>
      </Animated.View>

      {/* Animated finger pointer indicator */}
      <Animated.Text
        style={[
          styles.demoFinger,
          {
            transform: [
              {
                translateX: swipeAnim.interpolate({
                  inputRange: [-80, 0, 80],
                  outputRange: [-40, 20, 80],
                }),
              },
              {
                translateY: swipeAnim.interpolate({
                  inputRange: [-80, 0, 80],
                  outputRange: [25, 20, 25],
                }),
              },
            ],
            opacity: swipeAnim.interpolate({
              inputRange: [-80, -40, 0, 40, 80],
              outputRange: [0, 1, 1, 1, 0],
            }),
          },
        ]}
      >
        👆
      </Animated.Text>
    </View>
  );
}

export function TourOverlay() {
  const { colors } = useSettings();
  const { tourActive, currentStep, nextStep, prevStep, skipTour } = useTour();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Set up pointer bounce animation
  useEffect(() => {
    if (!tourActive) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 6, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bounceAnim, tourActive, currentStep]);

  if (!tourActive) return null;

  const stepData = TOUR_STEPS[currentStep];
  const { arrowPos, tooltipPos } = stepData;

  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Translate animation direction based on arrow type
  let translateY = new Animated.Value(0);
  let translateX = new Animated.Value(0);
  if (arrowPos.type === "up") {
    translateY = bounceAnim.interpolate({ inputRange: [0, 6], outputRange: [0, -6] }) as Animated.Value;
  } else if (arrowPos.type === "down") {
    translateY = bounceAnim.interpolate({ inputRange: [0, 6], outputRange: [0, 6] }) as Animated.Value;
  } else if (arrowPos.type === "left") {
    translateX = bounceAnim.interpolate({ inputRange: [0, 6], outputRange: [0, -6] }) as Animated.Value;
  } else if (arrowPos.type === "right") {
    translateX = bounceAnim.interpolate({ inputRange: [0, 6], outputRange: [0, 6] }) as Animated.Value;
  }

  return (
    <Modal transparent visible={tourActive} animationType="fade" onRequestClose={skipTour}>
      <View style={styles.backdrop}>
        {/* Pointer Arrow */}
        {arrowPos.type !== "none" && (
          <Animated.View
            style={[
              styles.arrowContainer,
              {
                top: arrowPos.top as number,
                bottom: arrowPos.bottom as number,
                left: arrowPos.left as number,
                right: arrowPos.right as number,
                transform: [{ translateY }, { translateX }],
              },
            ]}
          >
            {arrowPos.type === "up" && <View style={[styles.arrowUp, { borderBottomColor: colors.primary }]} />}
            {arrowPos.type === "down" && <View style={[styles.arrowDown, { borderTopColor: colors.primary }]} />}
            {arrowPos.type === "left" && <View style={[styles.arrowLeft, { borderRightColor: colors.primary }]} />}
            {arrowPos.type === "right" && <View style={[styles.arrowRight, { borderLeftColor: colors.primary }]} />}
          </Animated.View>
        )}

        {/* Tooltip Card */}
        <View
          style={[
            styles.tooltipCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              top: tooltipPos.top as number,
              bottom: tooltipPos.bottom as number,
              left: tooltipPos.left as number,
              right: tooltipPos.right as number,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>{stepData.emoji}</Text>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>{stepData.title}</Text>
              <Text style={[styles.stepIndicator, { color: colors.primary, backgroundColor: colors.accent }]}>
                {currentStep + 1} of {TOUR_STEPS.length}
              </Text>
            </View>
          </View>
          <Text style={[styles.description, { color: colors.muted }]}>{stepData.description}</Text>

          {/* Render Swipe animation demo during step index 5 */}
          {currentStep === 5 && <SwipeDemo />}

          <View style={styles.actions}>
            <Pressable
              onPress={skipTour}
              accessibilityRole="button"
              accessibilityLabel="Skip walkthrough"
              style={styles.skipButton}
            >
              <Text style={[styles.skipText, { color: colors.muted }]}>Skip</Text>
            </Pressable>

            <View style={styles.navButtons}>
              {currentStep > 0 && (
                <Pressable
                  onPress={prevStep}
                  accessibilityRole="button"
                  accessibilityLabel="Previous step"
                  style={[styles.prevButton, { borderColor: colors.border }]}
                >
                  <Text style={[styles.prevText, { color: colors.text }]}>Back</Text>
                </Pressable>
              )}
              <Pressable
                onPress={nextStep}
                accessibilityRole="button"
                accessibilityLabel={isLastStep ? "Complete walkthrough" : "Next step"}
                style={[styles.nextButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.nextText}>{isLastStep ? "Finish" : "Next"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(8,18,56,0.5)",
  },
  arrowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  arrowUp: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  arrowDown: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  arrowLeft: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 15,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  arrowRight: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 15,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  tooltipCard: {
    position: "absolute",
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: "#0B2BAA",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 9998,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    flex: 1,
    marginRight: spacing.xs,
  },
  stepIndicator: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  navButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  prevButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  prevText: {
    fontSize: 13,
    fontWeight: "700",
  },
  nextButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  // Swipe Demo styles
  demoContainer: {
    height: 72,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginVertical: spacing.md,
  },
  demoBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  demoBgComplete: {
    alignItems: "flex-start",
  },
  demoBgDelete: {
    alignItems: "flex-end",
  },
  demoBgText: {
    fontSize: 12,
    fontWeight: "800",
  },
  demoCard: {
    height: "100%",
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    zIndex: 2,
  },
  demoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "80%",
  },
  demoTag: {
    fontSize: 9,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
  },
  demoSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  demoFinger: {
    fontSize: 24,
    position: "absolute",
    bottom: 4,
    zIndex: 999,
  },
});
