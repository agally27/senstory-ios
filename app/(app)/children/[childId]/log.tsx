import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
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
  calm_moment: "#16a34a",
  meltdown: "#dc2626",
  shutdown: "#7c3aed",
  sensory_overwhelm: "#ea580c",
  anxiety: "#d97706",
};

export default function EventLogScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const router = useRouter();
  const [events, setEvents] = useState<ObservationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [childId]);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("observation_events")
      .select("*")
      .eq("child_id", childId)
      .order("occurred_at", { ascending: false })
      .limit(50);
    if (error) Alert.alert("Error", error.message);
    setEvents(data ?? []);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Event log</Text>
        </View>
        <TouchableOpacity
          className="bg-brand-600 rounded-full p-2"
          onPress={() =>
            router.push(`/(app)/children/${childId}/log-event`)
          }
        >
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : events.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="time-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-400 text-center mt-4">
            No events logged yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerClassName="px-4 pt-2 pb-8"
          renderItem={({ item }) => {
            const color = TYPE_COLORS[item.type] ?? "#0284c7";
            const date = new Date(item.occurred_at);
            return (
              <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <Text className="font-semibold text-gray-900">
                        {TYPE_LABELS[item.type]}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">
                      {date.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      ·{" "}
                      {date.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    {item.notes ? (
                      <Text className="text-sm text-gray-600 mt-2 leading-snug">
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>
                  {item.intensity != null && (
                    <View className="ml-3 items-center">
                      <Text className="text-xs text-gray-400">intensity</Text>
                      <Text className="font-bold text-lg" style={{ color }}>
                        {item.intensity}/5
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
