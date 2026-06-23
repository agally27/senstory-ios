import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { gradients } from "@/lib/theme";
import { tapHaptic } from "@/lib/haptics";

type IoniconName = keyof typeof Ionicons.glyphMap;

// Full-width gradient pill button with press feedback — the primary CTA.
export function GradientButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  size = "lg",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: keyof typeof gradients;
  icon?: IoniconName;
  size?: "lg" | "md";
}) {
  const isOff = disabled || loading;
  return (
    <Pressable
      onPress={() => { if (!isOff) { tapHaptic(); onPress(); } }}
      disabled={isOff}
      style={({ pressed }) => ({
        opacity: isOff ? 0.55 : 1,
        transform: [{ scale: pressed && !isOff ? 0.97 : 1 }],
        borderRadius: 999,
        shadowColor: "#0ea5e9",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      })}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 999,
          paddingVertical: size === "lg" ? 17 : 13,
          paddingHorizontal: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={size === "lg" ? 20 : 18} color="white" />}
            <Text className="text-white font-bold" style={{ fontSize: size === "lg" ? 17 : 15 }}>
              {label}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// Soft secondary button (tinted, not gradient).
export function SoftButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: IoniconName;
}) {
  return (
    <Pressable
      onPress={() => { tapHaptic(); onPress(); }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
    >
      <View className="bg-white/80 border border-slate-200 rounded-full py-4 px-6 flex-row items-center justify-center gap-2">
        {icon && <Ionicons name={icon} size={18} color="#334155" />}
        <Text className="text-slate-700 font-semibold text-base">{label}</Text>
      </View>
    </Pressable>
  );
}
