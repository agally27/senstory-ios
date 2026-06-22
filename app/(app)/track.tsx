import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import type { ObservationEvent, ObservationType } from "@/lib/types";

const TYPE_LABELS: Record<ObservationType, string> = {
  calm_moment: "Calm moment",
  sensory_overwhelm: "Sensory overwhelm",
  meltdown: "Meltdown",
  shutdown: "Shutdown",
  anxiety: "Anxiety",
  transition_difficulty: "Transition difficulty",
  demand_avoidance: "Demand avoidance",
  sleep: "Sleep",
  food: "Food",
  school: "School",
  medical: "Medical",
  toileting: "Toileting",
  social: "Social",
  strategy_used: "Strategy used",
  story_used: "Story used",
  custom_note: "Note",
};

const TYPE_COLORS: Partial<Record<ObservationType, string>> = {
  calm_moment: colors.emerald[400],
  meltdown: colors.rose[500],
  shutdown: colors.violet[700],
  sensory_overwhelm: colors.amber[600],
  anxiety: colors.amber[400],
};

export default function TrackScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [events, setEvents] = useState<ObservationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!selectedChildId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("observation_events")
      .select("*")
      .eq("child_id", selectedChildId)
      .order("occurred_at", { ascending: false })
      .limit(100);
    setEvents((data ?? []) as ObservationEvent[]);
    setLoading(false);
  }, [selectedChildId]);

  useFocusEffect(useCallback(() => { loadEvents(); }, [loadEvents]));

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-4 mt-2 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-800">Track</Text>
            <Text className="text-sm text-slate-500">
              {selectedChild ? `${selectedChild.name}'s daily log` : "Daily logging"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/log-event")}
            disabled={!selectedChildId}
            className="bg-emerald-100 border border-emerald-200 rounded-full w-11 h-11 items-center justify-center"
          >
            <Ionicons name="add" size={24} color={colors.emerald[800]} />
          </Pressable>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.emerald[500]} />
          </View>
        ) : !selectedChild ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-slate-400 text-center">
              Add a child on the Home tab to start tracking.
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="document-text-outline" size={48} color={colors.slate[300]} />
            <Text className="text-slate-400 text-center mt-4">No entries yet</Text>
            <Pressable
              onPress={() => router.push("/(app)/log-event")}
              className="mt-6 bg-emerald-100 border border-emerald-200 rounded-full px-6 py-3"
            >
              <Text className="text-emerald-800 font-semibold">Log first entry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
            {events.map((item) => {
              const color = TYPE_COLORS[item.type] ?? colors.emerald[500];
              const date = new Date(item.occurred_at);
              return (
                <Card key={item.id} className="p-4 mb-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <Text className="font-semibold text-slate-800">
                          {TYPE_LABELS[item.type]}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-400">
                        {format(date, "EEE, d MMM")} · {format(date, "HH:mm")}
                      </Text>
                      {item.notes ? (
                        <Text className="text-sm text-slate-600 mt-2 leading-snug">
                          {item.notes}
                        </Text>
                      ) : null}
                    </View>
                    {item.intensity != null && (
                      <View className="ml-3 items-center">
                        <Text className="text-xs text-slate-400">intensity</Text>
                        <Text className="font-bold text-lg" style={{ color }}>
                          {item.intensity}/5
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
