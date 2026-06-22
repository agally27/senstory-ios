import { View, Text, Pressable } from "react-native";
import { tapHaptic } from "@/lib/haptics";

// 10-dot metric row from the prototype — tap a dot to set the level 1–10.
// Filled dots take the metric colour with opacity ramping up toward the score.
export function MetricDotRow({
  label,
  value,
  onChange,
  color,
  scoreColor,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  scoreColor: string;
}) {
  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityRole="adjustable"
      accessibilityLabel={`${label}, ${value} out of 10`}
    >
      <Text className="text-xs text-slate-600 w-16">{label}</Text>
      <View className="flex-row gap-1 flex-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < value;
          return (
            <Pressable
              key={i}
              onPress={() => {
                tapHaptic();
                onChange(i + 1);
              }}
              className="flex-1"
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Set ${label} to ${i + 1}`}
            >
              <View
                className="rounded-full w-full"
                style={{
                  height: 10,
                  backgroundColor: filled ? color : "rgba(203,213,225,0.35)",
                  opacity: filled ? 0.3 + (value / 10) * 0.7 : 1,
                }}
              />
            </Pressable>
          );
        })}
      </View>
      <Text className={`text-xs font-semibold w-5 text-right ${scoreColor}`}>
        {value}
      </Text>
    </View>
  );
}
