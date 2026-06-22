import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

// Small rounded gradient square with an icon — used in quick-link rows.
export function GradientIconTile({
  icon,
  colors,
  iconColor,
  size = 36,
}: {
  icon: IoniconName;
  colors: readonly [string, string];
  iconColor: string;
  size?: number;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={size * 0.45} color={iconColor} />
    </LinearGradient>
  );
}
