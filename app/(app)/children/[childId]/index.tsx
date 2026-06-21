import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import type { Child, DailyCheckIn, Insight } from "@/lib/types";

export default function ChildOverviewScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [pendingInsights, setPendingInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [childId]);

  async function loadData() {
    const today = new Date().toISOString().split("T")[0];
    const [childRes, checkInRes, insightsRes] = await Promise.all([
      supabase.from("children").select("*").eq("id", childId).single(),
      supabase
        .from("daily_check_ins")
        .select("*")
        .eq("child_id", childId)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("insights")
        .select("*")
        .eq("child_id", childId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);
    if (childRes.error) Alert.alert("Error", childRes.error.message);
    setChild(childRes.data);
    setTodayCheckIn(checkInRes.data);
    setPendingInsights(insightsRes.data ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0284c7" />
      </SafeAreaView>
    );
  }

  if (!child) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">{child.name}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-2" contentContainerClassName="pb-10">
        {/* Quick actions */}
        <View className="flex-row gap-3 mb-5">
          <TouchableOpacity
            className="flex-1 bg-brand-600 rounded-2xl p-4 items-center gap-1"
            onPress={() => router.push(`/(app)/children/${childId}/log-event`)}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-sm">Log event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-2xl p-4 items-center gap-1 ${
              todayCheckIn
                ? "bg-green-100 border border-green-200"
                : "bg-white border border-gray-200"
            }`}
            onPress={() =>
              router.push(`/(app)/children/${childId}/checkin`)
            }
          >
            <Ionicons
              name={todayCheckIn ? "checkmark-circle" : "sunny-outline"}
              size={24}
              color={todayCheckIn ? "#16a34a" : "#0284c7"}
            />
            <Text
              className={`font-semibold text-sm ${
                todayCheckIn ? "text-green-700" : "text-brand-700"
              }`}
            >
              {todayCheckIn ? "Checked in" : "Daily check-in"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event log shortcut */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center justify-between"
          onPress={() => router.push(`/(app)/children/${childId}/log`)}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="time-outline" size={22} color="#0284c7" />
            <Text className="font-medium text-gray-800">Event log</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        {/* Insights */}
        {pendingInsights.length > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              Insights to review
            </Text>
            {pendingInsights.map((insight) => (
              <View
                key={insight.id}
                className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-3"
              >
                <Text className="text-brand-900 font-medium leading-snug">
                  {insight.claim}
                </Text>
                {insight.suggested_action ? (
                  <Text className="text-brand-600 text-sm mt-1">
                    {insight.suggested_action}
                  </Text>
                ) : null}
                <Text className="text-xs text-brand-400 mt-2">
                  {Math.round(insight.confidence * 100)}% confidence ·{" "}
                  {insight.safety_caveat}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
