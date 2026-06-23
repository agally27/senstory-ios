import { Pressable, View, ViewProps } from "react-native";
import { tapHaptic } from "@/lib/haptics";

// Interactive card: subtle scale-down + light haptic on press. Use for any
// tappable card (nav tiles, list rows, recommendations).
export function PressableCard({
  onPress,
  className = "",
  children,
  haptic = true,
  ...props
}: ViewProps & { onPress: () => void; className?: string; haptic?: boolean }) {
  return (
    <Pressable
      onPress={() => { if (haptic) tapHaptic(); onPress(); }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
      accessibilityRole="button"
    >
      <View
        className={`bg-white/90 rounded-[26px] ${className}`}
        style={{
          shadowColor: "#0c4a6e",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }}
        {...props}
      >
        {children}
      </View>
    </Pressable>
  );
}
