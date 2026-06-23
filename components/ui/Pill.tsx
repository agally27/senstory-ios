import { Pressable, Text, View } from "react-native";
import { tapHaptic } from "@/lib/haptics";

// Segmented pill row — used for section toggles and tabs.
export function PillRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => { tapHaptic(); onChange(o.value); }}
            className={`px-4 py-2 rounded-full border ${
              on ? "bg-emerald-100 border-emerald-200" : "bg-white/70 border-slate-200"
            }`}
          >
            <Text className={`text-sm font-semibold ${on ? "text-emerald-800" : "text-slate-500"}`}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
