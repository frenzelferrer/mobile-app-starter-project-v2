import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useSettings } from "@/context/SettingsContext";
import { TOUR_STEPS, useTour } from "@/context/TourContext";
import { spacing } from "@/theme/colors";

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
});
