import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { STRATEGIES } from "@/lib/strategies";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";

export default function StrategyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const strategy = STRATEGIES.find((s) => s.id === id);

  if (!strategy) {
    return (
      <ScreenBackground>
        <SafeAreaView className="flex-1 items-center justify-center">
          <Text className="text-slate-400">Strategy not found.</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 pt-2 pb-3 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
          </Pressable>
          <Text className="text-xl font-bold text-slate-800 font-heading flex-1">
            {strategy.title}
          </Text>
        </View>

        <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
          <View className="items-center my-4">
            <View className={`w-16 h-16 rounded-3xl items-center justify-center ${strategy.bg}`}>
              <Ionicons name={strategy.icon} size={32} color={strategy.tint} />
            </View>
            <Text className="text-slate-500 text-center mt-3 px-6">{strategy.summary}</Text>
          </View>

          <Card className="p-5">
            {strategy.steps.map((step, i) => (
              <View key={i} className="flex-row gap-3 mb-4 last:mb-0">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                  style={{ backgroundColor: strategy.tint }}
                >
                  <Text className="text-white text-xs font-bold">{i + 1}</Text>
                </View>
                <Text className="text-slate-700 flex-1 leading-relaxed">{step}</Text>
              </View>
            ))}
          </Card>

          <Text className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed px-4">
            Supportive, general information — not clinical advice. Always consult a
            professional for diagnosis or treatment.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
