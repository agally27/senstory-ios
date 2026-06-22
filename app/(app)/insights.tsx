import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/lib/types";

export default function InsightsScreen() {
  const { selectedChild, selectedChildId } = useChildren();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!selectedChildId) {
      setInsights([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("insights")
      .select("*")
      .eq("child_id", selectedChildId)
      .order("created_at", { ascending: false });
    setInsights((data ?? []) as Insight[]);
    setLoading(false);
  }, [selectedChildId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function review(id: string, status: "confirmed" | "rejected") {
    await supabase
      .from("insights")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    load();
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 mt-2 mb-4">
          <Text className="text-2xl font-bold text-slate-800 font-heading">AI Insights</Text>
          <Text className="text-sm text-slate-500">
            {selectedChild ? `Patterns for ${selectedChild.name}` : "Patterns from your logs"}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.emerald[500]} />
          </View>
        ) : insights.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="bulb-outline" size={48} color={colors.slate[300]} />
            <Text className="text-slate-400 text-center mt-4 leading-relaxed">
              No insights yet. Keep logging events and check-ins — patterns will
              appear here as your advisor learns about {selectedChild?.name ?? "your child"}.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
            {insights.map((insight) => (
              <Card key={insight.id} className="p-5 mb-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-9 h-9 rounded-xl bg-purple-100 items-center justify-center">
                    <Ionicons name="bulb" size={18} color={colors.purple[600]} />
                  </View>
                  <Text className="text-xs text-slate-400 flex-1">
                    {Math.round(insight.confidence * 100)}% confidence
                  </Text>
                  {insight.status !== "pending" && (
                    <View className={`px-2 py-1 rounded-full ${insight.status === "confirmed" ? "bg-emerald-100" : "bg-slate-100"}`}>
                      <Text className={`text-xs font-medium ${insight.status === "confirmed" ? "text-emerald-700" : "text-slate-500"}`}>
                        {insight.status}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-slate-800 font-medium leading-snug mb-1">
                  {insight.claim}
                </Text>
                {insight.suggested_action ? (
                  <Text className="text-sm text-slate-500 mb-2">
                    {insight.suggested_action}
                  </Text>
                ) : null}
                {insight.safety_caveat ? (
                  <Text className="text-xs text-slate-400 italic mb-2">
                    {insight.safety_caveat}
                  </Text>
                ) : null}
                {insight.status === "pending" && (
                  <View className="flex-row gap-2 mt-2">
                    <Pressable
                      onPress={() => review(insight.id, "confirmed")}
                      className="flex-1 bg-emerald-100 border border-emerald-200 rounded-full py-2.5 items-center"
                    >
                      <Text className="text-emerald-800 font-medium text-sm">This fits</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => review(insight.id, "rejected")}
                      className="flex-1 bg-white border border-slate-200 rounded-full py-2.5 items-center"
                    >
                      <Text className="text-slate-500 font-medium text-sm">Not quite</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            ))}
          </ScrollView>
        )}

        <View className="px-6 pb-2">
          <Text className="text-[10px] text-slate-400 text-center leading-relaxed">
            Senstory offers supportive, general information — not clinical advice.
            Always consult a professional for diagnosis or treatment.
          </Text>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
