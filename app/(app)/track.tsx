import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { regulationStatus } from "@/lib/tracking";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import { MonthCalendar } from "@/components/ui/MonthCalendar";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
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

type Section = "entries" | "calendar";

function EntryCard({ item }: { item: ObservationEvent }) {
  const color = TYPE_COLORS[item.type] ?? colors.emerald[500];
  const date = new Date(item.occurred_at);
  const status = regulationStatus(item.regulation_after);
  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <Text className="font-semibold text-slate-800">{TYPE_LABELS[item.type]}</Text>
          </View>
          <Text className="text-xs text-slate-400">
            {format(date, "EEE, d MMM")} · {format(date, "HH:mm")}
          </Text>
          {item.notes ? (
            <Text className="text-sm text-slate-600 mt-2 leading-snug">{item.notes}</Text>
          ) : null}
          {/* Tags + status */}
          {(item.quick_tags?.length > 0 || status) && (
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {status && (
                <View className={`px-2 py-1 rounded-full ${status.bg}`}>
                  <Text className={`text-[11px] font-medium ${status.text}`}>{status.label}</Text>
                </View>
              )}
              {item.quick_tags?.map((tag) => (
                <View key={tag} className="px-2 py-1 rounded-full bg-slate-100">
                  <Text className="text-[11px] text-slate-500">{tag}</Text>
                </View>
              ))}
            </View>
          )}
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
}

export default function TrackScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [events, setEvents] = useState<ObservationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState<Section>("entries");
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

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
      .limit(200);
    setEvents((data ?? []) as ObservationEvent[]);
    setLoading(false);
  }, [selectedChildId]);

  useFocusEffect(useCallback(() => { loadEvents(); }, [loadEvents]));

  async function onRefresh() {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.emerald[400]} />
  );

  const markedDates = new Set(events.map((e) => format(new Date(e.occurred_at), "yyyy-MM-dd")));
  const dayEvents = events.filter((e) => isSameDay(new Date(e.occurred_at), selectedDay));

  const SECTIONS: { id: Section; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "entries", label: "All Entries", icon: "list" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
  ];

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 mt-2 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-800 font-heading">Track</Text>
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

        {/* Section pills */}
        <View className="flex-row gap-2 px-4 mb-3">
          {SECTIONS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSection(s.id)}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                section === s.id
                  ? "bg-emerald-100 border-emerald-200"
                  : "bg-white/70 border-slate-200"
              }`}
            >
              <Ionicons
                name={s.icon}
                size={15}
                color={section === s.id ? colors.emerald[700] : colors.slate[400]}
              />
              <Text className={`text-sm font-medium ${section === s.id ? "text-emerald-800" : "text-slate-500"}`}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <SkeletonList count={5} />
        ) : !selectedChild ? (
          <EmptyState
            icon="person-add-outline"
            title="No child yet"
            subtitle="Add a child on the Home tab to start tracking their day."
          />
        ) : section === "calendar" ? (
          <FlatList
            data={dayEvents}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-32"
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
            ListHeaderComponent={
              <View className="mb-3">
                <MonthCalendar
                  month={month}
                  selected={selectedDay}
                  markedDates={markedDates}
                  onSelect={setSelectedDay}
                  onPrev={() => setMonth((m) => subMonths(m, 1))}
                  onNext={() => setMonth((m) => addMonths(m, 1))}
                />
                <Text className="text-sm font-semibold text-slate-500 mt-4 mb-1 px-1">
                  {format(selectedDay, "EEEE, d MMMM")}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <Text className="text-slate-400 text-center mt-4 px-8">
                No entries on this day.
              </Text>
            }
            renderItem={({ item }) => <EntryCard item={item} />}
          />
        ) : events.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No entries yet"
            subtitle="Log a moment from the day — a calm patch, a wobble, a meal, anything worth remembering."
            ctaLabel="Log first entry"
            onCta={() => router.push("/(app)/log-event")}
          />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-32"
            showsVerticalScrollIndicator={false}
            windowSize={7}
            initialNumToRender={10}
            removeClippedSubviews
            refreshControl={refreshControl}
            renderItem={({ item }) => <EntryCard item={item} />}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
