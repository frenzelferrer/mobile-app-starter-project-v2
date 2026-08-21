import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useSettings } from "@/context/SettingsContext";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonLoader({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonLoaderProps) {
  const { colors } = useSettings();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}

/** A card-shaped skeleton placeholder for loading task lists. */
export function SkeletonCard() {
  const { colors } = useSettings();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <SkeletonLoader width="70%" height={18} />
          <SkeletonLoader width="40%" height={13} style={{ marginTop: 8 }} />
        </View>
        <SkeletonLoader width={60} height={24} borderRadius={8} />
      </View>
      <SkeletonLoader width="90%" height={13} style={{ marginTop: 12 }} />
      <SkeletonLoader width="60%" height={13} style={{ marginTop: 6 }} />
      <View style={styles.cardFooter}>
        <SkeletonLoader width={100} height={12} />
        <SkeletonLoader width={70} height={24} borderRadius={8} />
      </View>
    </View>
  );
}

/** Stat card shaped skeleton. */
export function SkeletonStatCard() {
  const { colors } = useSettings();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
      <SkeletonLoader width={40} height={26} />
      <SkeletonLoader width={60} height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleWrap: { flex: 1, marginRight: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
});
