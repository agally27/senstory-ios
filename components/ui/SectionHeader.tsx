import { View, Text } from "react-native";

// Large friendly headline + soft-grey subtitle. Strong visual hierarchy.
export function SectionHeader({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <View className={className}>
      <Text className="text-3xl text-slate-800 font-heading">{title}</Text>
      {subtitle ? (
        <Text className="text-base text-slate-500 mt-1 leading-relaxed">{subtitle}</Text>
      ) : null}
    </View>
  );
}
