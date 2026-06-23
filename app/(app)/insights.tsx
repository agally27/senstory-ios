import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors, metricColors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { LineChart, BarList, DonutChart } from "@/components/ui/charts";
import type { Insight, DailyCheckIn, ObservationEvent } from "@/lib/types";

const DONUT_COLORS = [
  colors.emerald[400], colors.sky[400], colors.amber[400],
  colors.rose[400], colors.violet[700], colors.purple[600],
];

export default function InsightsScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [events, setEvents] = useState<ObservationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const chartWidth = Dimensions.get("window").width - 32 - 40; // screen - page padding - card padding

  const load = useCallback(async () => {
    if (!selectedChildId) {
      setInsights([]); setCheckIns([]); setEvents([]);
      setLoading(false);
      return;
    }
    const [insRes, ciRes, evRes] = await Promise.all([
      supabase.from("insights").select("*").eq("child_id", selectedChildId).order("created_at", { ascending: false }),
      supabase.from("daily_check_ins").select("*").eq("child_id", selectedChildId).order("date", { ascending: true }).limit(30),
      supabase.from("observation_events").select("*").eq("child_id", selectedChildId).order("occurred_at", { ascending: false }).limit(200),
    ]);
    setInsights((insRes.data ?? []) as Insight[]);
    setCheckIns((ciRes.data ?? []) as DailyCheckIn[]);
    setEvents((evRes.data ?? []) as ObservationEvent[]);
    setLoading(false);
  }, [selectedChildId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function review(id: string, status: "confirmed" | "rejected") {
    await supabase.from("insights").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  // Derived chart data
  const recent = checkIns.slice(-14);
  const hasTrend = recent.length >= 2;
  const regSeries = recent.map((c) => c.regulation ?? 0);
  const sleepSeries = recent.map((c) => c.sleep ?? 0);
  const moodSeries = recent.map((c) => c.mood ?? 0);

  const tagCounts: Record<string, number> = {};
  events.forEach((e) => e.quick_tags?.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([label, value]) => ({ label, value }));

  const typeCounts: Record<string, number> = {};
  events.forEach((e) => { typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1; });
  const typeData = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([label, value], i) => ({
      label: label.replace(/_/g, " "),
      value,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));

  const hasAnyData = checkIns.length > 0 || events.length > 0 || insights.length > 0;

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
        ) : !hasAnyData ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="bulb-outline" size={48} color={colors.slate[300]} />
            <Text className="text-slate-400 text-center mt-4 leading-relaxed">
              No data yet. Log wellbeing and events — patterns and charts will
              appear here as your advisor learns about {selectedChild?.name ?? "your child"}.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
            {/* Analyse CTA */}
            <View className="mb-4">
              <GradientButton
                label="Analyse patterns"
                icon="sparkles"
                variant="violet"
                onPress={() => router.push("/(app)/analyse")}
              />
            </View>

            {/* Wellbeing trend */}
            {hasTrend && (
              <Card className="p-5 mb-3">
                <Text className="font-semibold text-slate-700 mb-1">Wellbeing trend</Text>
                <Text className="text-xs text-slate-400 mb-3">Last {recent.length} check-ins</Text>
                <LineChart
                  width={chartWidth}
                  series={[
                    { color: metricColors.regulation, values: regSeries },
                    { color: metricColors.sleep, values: sleepSeries },
                    { color: metricColors.mood, values: moodSeries },
                  ]}
                />
                <View className="flex-row gap-4 mt-3">
                  <Legend color={metricColors.regulation} label="Regulation" />
                  <Legend color={metricColors.sleep} label="Sleep" />
                  <Legend color={metricColors.mood} label="Mood" />
                </View>
              </Card>
            )}

            {/* Event types donut */}
            {typeData.length > 0 && (
              <Card className="p-5 mb-3">
                <Text className="font-semibold text-slate-700 mb-3">What you've logged</Text>
                <DonutChart data={typeData} />
              </Card>
            )}

            {/* Top tags */}
            {topTags.length > 0 && (
              <Card className="p-5 mb-3">
                <Text className="font-semibold text-slate-700 mb-3">Most common tags</Text>
                <BarList data={topTags} color={colors.sky[400]} />
              </Card>
            )}

            {/* AI insight review cards */}
            {insights.length > 0 && (
              <Text className="text-sm font-semibold text-slate-500 mt-4 mb-2 px-1">
                Insights to review
              </Text>
            )}
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
                <Text className="text-slate-800 font-medium leading-snug mb-1">{insight.claim}</Text>
                {insight.suggested_action ? (
                  <Text className="text-sm text-slate-500 mb-2">{insight.suggested_action}</Text>
                ) : null}
                {insight.safety_caveat ? (
                  <Text className="text-xs text-slate-400 italic mb-2">{insight.safety_caveat}</Text>
                ) : null}
                {insight.status === "pending" && (
                  <View className="flex-row gap-2 mt-2">
                    <Pressable onPress={() => review(insight.id, "confirmed")} className="flex-1 bg-emerald-100 border border-emerald-200 rounded-full py-2.5 items-center">
                      <Text className="text-emerald-800 font-medium text-sm">This fits</Text>
                    </Pressable>
                    <Pressable onPress={() => review(insight.id, "rejected")} className="flex-1 bg-white border border-slate-200 rounded-full py-2.5 items-center">
                      <Text className="text-slate-500 font-medium text-sm">Not quite</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            ))}

            <Text className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
              Senstory offers supportive, general information — not clinical advice.
              Always consult a professional for diagnosis or treatment.
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-slate-500">{label}</Text>
    </View>
  );
}
