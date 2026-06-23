import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { GradientButton } from "@/components/ui/GradientButton";

type IoniconName = keyof typeof Ionicons.glyphMap;

// Consistent, friendly empty state: soft icon tile, title, subtitle, optional CTA.
export function EmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <View
        className="w-20 h-20 rounded-3xl bg-white/80 items-center justify-center mb-5"
        style={{ shadowColor: "#0c4a6e", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }}
      >
        <Ionicons name={icon} size={38} color={colors.emerald[400]} />
      </View>
      <Text className="text-xl text-slate-800 font-heading text-center mb-1.5">{title}</Text>
      {subtitle ? (
        <Text className="text-base text-slate-500 text-center leading-relaxed">{subtitle}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <View className="w-full mt-7">
          <GradientButton label={ctaLabel} onPress={onCta} />
        </View>
      ) : null}
    </View>
  );
}
