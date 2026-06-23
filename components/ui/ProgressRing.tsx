import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { colors } from "@/lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Animated circular progress ring with a percentage in the centre.
export function ProgressRing({
  progress, // 0..1 target
  size = 180,
  thickness = 14,
  durationMs = 800,
}: {
  progress: number;
  size?: number;
  thickness?: number;
  durationMs?: number;
}) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const id = anim.addListener(({ value }) => setPct(Math.round(value * 100)));
    return () => anim.removeListener(id);
  }, [progress]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.emerald[400]} />
            <Stop offset="1" stopColor={colors.sky[400]} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.slate[100]} strokeWidth={thickness} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-4xl font-bold text-slate-800 font-heading">{pct}%</Text>
    </View>
  );
}
