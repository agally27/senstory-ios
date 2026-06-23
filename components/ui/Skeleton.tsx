import { useEffect, useRef, useState } from "react";
import { Animated, View, AccessibilityInfo } from "react-native";

// Shimmering placeholder block. Respects Reduce Motion (static when enabled).
export function Skeleton({
  width,
  height,
  radius = 12,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion]);

  const opacity = reduceMotion ? 0.5 : anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View
      style={[
        { width: width ?? "100%", height, borderRadius: radius, backgroundColor: "#e2e8f0", opacity },
        style,
      ]}
    />
  );
}

// A card-shaped skeleton used in lists while loading.
export function SkeletonCard() {
  return (
    <View
      className="bg-white/80 rounded-[26px] p-5 mb-3"
      style={{ shadowColor: "#0c4a6e", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}
    >
      <View className="flex-row items-center gap-3 mb-3">
        <Skeleton width={44} height={44} radius={14} />
        <View className="flex-1 gap-2">
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} />
        </View>
      </View>
      <Skeleton width="100%" height={11} />
      <View style={{ height: 6 }} />
      <Skeleton width="80%" height={11} />
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View className="px-4 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
