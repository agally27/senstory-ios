import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { format, isAfter, subDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors, metricColors } from "@/lib/theme";
import { successHaptic } from "@/lib/haptics";
import { STRATEGIES } from "@/lib/strategies";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import { MetricDotRow } from "@/components/ui/MetricDotRow";
import { GradientIconTile } from "@/components/ui/GradientIconTile";
import { GradientButton } from "@/components/ui/GradientButton";
import { PressableCard } from "@/components/ui/PressableCard";
import { LineChart } from "@/components/ui/charts";
import type { DailyCheckIn, ObservationEvent } from "@/lib/types";

const TIPS = [
  "Logging little and often beats trying to capture everything — a quick check-in each day builds the clearest picture.",
  "Notice the calm moments too. What was happening when your child felt regulated is just as useful as the hard times.",
  "Big feelings pass like waves. Staying calm yourself is often the most powerful co-regulation tool you have.",
  "Patterns take time to appear. A week or two of check-ins and your Insights tab starts to come alive.",
  "Transitions are easier with warning. A countdown or a visual cue can soften the jump between activities.",
];

const QUICK_LINKS = [
  { label: "Daily Log", route: "/(app)/track", icon: "calendar" as const, colors: [colors.emerald[100], colors.teal[100]] as const, iconColor: colors.emerald[600] },
  { label: "AI Insights", route: "/(app)/insights", icon: "trending-up" as const, colors: [colors.purple[100], colors.violet[100]] as const, iconColor: colors.purple[600] },
  { label: "Check-in", route: "/(app)/checkin", icon: "happy" as const, colors: [colors.rose[100], colors.rose[200]] as const, iconColor: colors.rose[600] },
  { label: "Visual Symbols", route: "/(app)/visual-symbols", icon: "grid" as const, colors: [colors.sky[100], colors.sky[200]] as const, iconColor: colors.sky[600] },
  { label: "Social Stories", route: "/(app)/stories", icon: "book" as const, colors: [colors.amber[100], colors.amber[200]] as const, iconColor: colors.amber[600] },
  { label: "Support", route: "/(app)/support", icon: "heart" as const, colors: [colors.rose[100], colors.rose[200]] as const, iconColor: colors.rose[600] },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function summaryLabel(avg: number) {
  if (avg <= 3) return "May need extra support today";
  if (avg <= 6) return "Steady and managing";
  return "Feeling calm and regulated";
}

function ageFrom(dob: string | null) {
  if (!dob) return null;
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 864e5));
  return years >= 0 ? `${years} yrs` : null;
}

export default function HomeScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId, children, setSelectedChildId, loading, refresh } =
    useChildren();

  const [regulation, setRegulation] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [mood, setMood] = useState(5);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logged, setLogged] = useState(false);
  const [history, setHistory] = useState<DailyCheckIn[]>([]);
  const [recent, setRecent] = useState<ObservationEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadCheckIn(), loadHistory(), loadRecent(), refresh()]);
    setRefreshing(false);
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const chartWidth = Dimensions.get("window").width - 32 - 40;
  const tip = TIPS[new Date().getDate() % TIPS.length];

  useEffect(() => {
    if (!selectedChildId) return;
    setLogged(false);
    setExistingId(null);
    loadCheckIn();
    loadHistory();
    loadRecent();
  }, [selectedChildId]);

  async function loadCheckIn() {
    const { data } = (await supabase
      .from("daily_check_ins").select("*")
      .eq("child_id", selectedChildId).eq("date", today).maybeSingle()) as { data: DailyCheckIn | null };
    if (data) {
      setRegulation(data.regulation ?? 5); setSleep(data.sleep ?? 5); setMood(data.mood ?? 5);
      setExistingId(data.id); setLogged(true);
    } else { setRegulation(5); setSleep(5); setMood(5); }
  }
  async function loadHistory() {
    const { data } = await supabase.from("daily_check_ins").select("*")
      .eq("child_id", selectedChildId).order("date", { ascending: true }).limit(14);
    setHistory((data ?? []) as DailyCheckIn[]);
  }
  async function loadRecent() {
    const { data } = await supabase.from("observation_events").select("*")
      .eq("child_id", selectedChildId).order("occurred_at", { ascending: false }).limit(30);
    setRecent((data ?? []) as ObservationEvent[]);
  }

  async function saveWellbeing() {
    if (!selectedChildId) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = { child_id: selectedChildId, created_by_id: user.id, date: today, regulation, sleep, mood };
    const { error } = existingId
      ? await supabase.from("daily_check_ins").update(payload).eq("id", existingId)
      : await supabase.from("daily_check_ins").insert(payload);
    if (error) Alert.alert("Error", error.message);
    else { successHaptic(); setLogged(true); loadCheckIn(); loadHistory(); }
    setSaving(false);
  }

  async function pickPhoto() {
    if (!selectedChildId) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true,
    });
    if (res.canceled || !res.assets[0]?.base64) return;
    const dataUrl = `data:${res.assets[0].mimeType ?? "image/jpeg"};base64,${res.assets[0].base64}`;
    const { error } = await supabase.from("children").update({ photo_url: dataUrl }).eq("id", selectedChildId);
    if (error) Alert.alert("Error", error.message); else refresh();
  }

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.emerald[500]} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (!selectedChild) {
    return (
      <ScreenBackground>
        <SafeAreaView className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-3xl bg-white/80 items-center justify-center mb-5" style={{ shadowColor: "#0c4a6e", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }}>
            <Ionicons name="sunny" size={40} color={colors.emerald[400]} />
          </View>
          <Text className="text-3xl text-slate-800 font-heading mb-2">Welcome to Senstory</Text>
          <Text className="text-slate-500 text-center mb-8 text-base leading-relaxed">
            Add your child's profile to start tracking, understanding, and supporting their day.
          </Text>
          <View className="w-full">
            <GradientButton label="Add child profile" icon="add" onPress={() => router.push("/(app)/add-child")} />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const avg = (regulation + sleep + mood) / 3;
  const weekCount = recent.filter((e) => isAfter(new Date(e.occurred_at), subDays(new Date(), 7))).length;
  const calmCount = recent.filter((e) => e.type === "calm_moment").length;
  const recommendation = STRATEGIES[new Date().getDate() % STRATEGIES.length];
  const age = ageFrom(selectedChild.date_of_birth);

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          contentContainerClassName="px-4 pb-32"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.emerald[400]} />}
        >
          {/* Header: wordmark + utilities */}
          <View className="flex-row items-center justify-between mt-2 mb-5">
            <View>
              <Text className="text-2xl text-emerald-700 font-heading">Senstory</Text>
              <Text className="text-[11px] text-emerald-600">autism support for parents</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(app)/support")}
              className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
            >
              <Ionicons name="person-outline" size={20} color={colors.slate[500]} />
            </Pressable>
          </View>

          {/* Greeting */}
          <Text className="text-3xl text-slate-800 font-heading">{greeting()}</Text>
          <Text className="text-base text-slate-500 mb-5">{format(new Date(), "EEEE, d MMMM")}</Text>

          {/* Child summary */}
          <Card className="p-5 mb-4 flex-row items-center gap-4">
            <Pressable onPress={pickPhoto} accessibilityLabel={`${selectedChild.name}'s photo, tap to change`}>
              <View className="w-20 h-20 rounded-full overflow-hidden border-4 border-white" style={{ shadowColor: "#0c4a6e", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
                {selectedChild.photo_url ? (
                  <Image source={{ uri: selectedChild.photo_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={200} />
                ) : (
                  <View className="w-full h-full bg-emerald-100 items-center justify-center">
                    <Text className="text-3xl font-semibold text-emerald-400">{selectedChild.name[0]?.toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </Pressable>
            <View className="flex-1">
              <Text className="text-xl text-slate-800 font-heading">{selectedChild.name}</Text>
              {age ? <Text className="text-sm text-slate-400 mb-1">{age}</Text> : null}
              <View className="flex-row items-center gap-1.5 mt-1">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: avg > 6 ? colors.emerald[400] : avg > 3 ? colors.amber[400] : colors.rose[500] }} />
                <Text className="text-xs text-slate-500">{summaryLabel(avg)}</Text>
              </View>
            </View>
          </Card>

          {/* Child selector pills */}
          {children.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {children.map((c) => (
                  <Pressable key={c.id} onPress={() => setSelectedChildId(c.id)}
                    className={`px-4 py-2 rounded-full border ${c.id === selectedChildId ? "bg-emerald-100 border-emerald-200" : "bg-white/70 border-slate-200"}`}>
                    <Text className={`text-sm font-medium ${c.id === selectedChildId ? "text-emerald-800" : "text-slate-500"}`}>{c.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Key metrics */}
          <View className="flex-row gap-3 mb-4">
            <MetricStat icon="pulse" tint={colors.emerald[600]} bg="bg-emerald-100" value={`${weekCount}`} label="entries / wk" />
            <MetricStat icon="sunny" tint={colors.amber[600]} bg="bg-amber-100" value={`${calmCount}`} label="calm moments" />
            <MetricStat icon="flame" tint={colors.rose[500]} bg="bg-rose-100" value={logged ? "✓" : "–"} label="today" />
          </View>

          {/* Wellbeing logger */}
          <Card className="p-6 mb-4">
            <Text className="text-base font-semibold text-slate-700 text-center mb-6">{summaryLabel(avg)}</Text>
            <View className="gap-4 mb-6">
              <MetricDotRow label="Regulation" value={regulation} onChange={setRegulation} color={metricColors.regulation} scoreColor="text-emerald-600" />
              <MetricDotRow label="Sleep" value={sleep} onChange={setSleep} color={metricColors.sleep} scoreColor="text-blue-400" />
              <MetricDotRow label="Mood" value={mood} onChange={setMood} color={metricColors.mood} scoreColor="text-amber-400" />
            </View>
            <GradientButton
              label={saving ? "Saving…" : logged ? "Update today's wellbeing" : "Log today's wellbeing"}
              onPress={saveWellbeing} loading={saving}
            />
          </Card>

          {/* Wellbeing trend */}
          {history.length >= 2 && (
            <Card className="p-5 mb-4">
              <Text className="text-base font-semibold text-slate-700 mb-1">Wellbeing trend</Text>
              <Text className="text-xs text-slate-400 mb-3">Last {history.length} check-ins</Text>
              <LineChart width={chartWidth} series={[
                { color: metricColors.regulation, values: history.map((c) => c.regulation ?? 0) },
                { color: metricColors.sleep, values: history.map((c) => c.sleep ?? 0) },
                { color: metricColors.mood, values: history.map((c) => c.mood ?? 0) },
              ]} />
              <View className="flex-row gap-4 mt-3">
                <Legend color={metricColors.regulation} label="Regulation" />
                <Legend color={metricColors.sleep} label="Sleep" />
                <Legend color={metricColors.mood} label="Mood" />
              </View>
            </Card>
          )}

          {/* Recommendation */}
          <Text className="text-lg text-slate-800 font-heading mb-2 mt-1">Recommended for you</Text>
          <PressableCard onPress={() => router.push(`/(app)/strategy/${recommendation.id}`)} className="p-5 mb-4 flex-row items-center gap-3">
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${recommendation.bg}`}>
              <Ionicons name={recommendation.icon} size={24} color={recommendation.tint} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-slate-800">{recommendation.title}</Text>
              <Text className="text-xs text-slate-500 mt-0.5">{recommendation.summary}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.slate[300]} />
          </PressableCard>

          {/* Today's tip */}
          <Card className="p-5 mb-4 flex-row gap-3">
            <View className="w-9 h-9 rounded-xl bg-amber-100 items-center justify-center">
              <Ionicons name="bulb" size={18} color={colors.amber[600]} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-700 mb-1">Today's tip</Text>
              <Text className="text-sm text-slate-500 leading-relaxed">{tip}</Text>
            </View>
          </Card>

          {/* Recent activity */}
          {recent.length > 0 && (
            <>
              <Text className="text-lg text-slate-800 font-heading mb-2 mt-1">Recent activity</Text>
              <Card className="p-2 mb-4">
                {recent.slice(0, 3).map((e, i) => (
                  <View key={e.id} className={`flex-row items-center gap-3 px-3 py-3 ${i < 2 ? "border-b border-slate-50" : ""}`}>
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: e.type === "calm_moment" ? colors.emerald[400] : e.type === "meltdown" ? colors.rose[500] : colors.sky[400] }} />
                    <Text className="text-sm text-slate-700 flex-1" numberOfLines={1}>
                      {e.type.replace(/_/g, " ")}
                    </Text>
                    <Text className="text-xs text-slate-400">{format(new Date(e.occurred_at), "d MMM")}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {/* Explore */}
          <Text className="text-lg text-slate-800 font-heading mb-2 mt-1">Explore</Text>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {QUICK_LINKS.map((link) => (
              <Pressable key={link.label} onPress={() => router.push(link.route as any)} style={{ width: "47.5%" }}>
                <Card className="p-4 flex-row items-center gap-3">
                  <GradientIconTile icon={link.icon} colors={link.colors} iconColor={link.iconColor} />
                  <Text className="text-sm font-medium text-slate-700 flex-1">{link.label}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function MetricStat({ icon, tint, bg, value, label }: { icon: keyof typeof Ionicons.glyphMap; tint: string; bg: string; value: string; label: string }) {
  return (
    <Card className="flex-1 py-4 items-center">
      <View className={`w-9 h-9 rounded-xl items-center justify-center mb-1.5 ${bg}`}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text className="text-xl font-bold text-slate-800 font-heading">{value}</Text>
      <Text className="text-[11px] text-slate-400">{label}</Text>
    </Card>
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
