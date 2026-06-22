import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors, metricColors } from "@/lib/theme";
import { successHaptic } from "@/lib/haptics";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import { MetricDotRow } from "@/components/ui/MetricDotRow";
import { GradientIconTile } from "@/components/ui/GradientIconTile";
import type { DailyCheckIn } from "@/lib/types";

const QUICK_LINKS = [
  { label: "Daily Log", route: "/(app)/track", icon: "calendar" as const, colors: [colors.emerald[100], colors.teal[100]] as const, iconColor: colors.emerald[600] },
  { label: "AI Insights", route: "/(app)/insights", icon: "trending-up" as const, colors: [colors.purple[100], colors.violet[100]] as const, iconColor: colors.purple[600] },
  { label: "Check-in", route: "/(app)/checkin", icon: "happy" as const, colors: [colors.rose[100], colors.rose[200]] as const, iconColor: colors.rose[600] },
  { label: "Support", route: "/(app)/support", icon: "heart" as const, colors: [colors.amber[100], colors.amber[200]] as const, iconColor: colors.amber[600] },
];

function summaryLabel(avg: number) {
  if (avg <= 3) return "May need extra support today";
  if (avg <= 6) return "Steady and managing";
  return "Feeling calm and regulated";
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

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!selectedChildId) return;
    setLogged(false);
    setExistingId(null);
    loadCheckIn();
  }, [selectedChildId]);

  async function loadCheckIn() {
    const { data } = (await supabase
      .from("daily_check_ins")
      .select("*")
      .eq("child_id", selectedChildId)
      .eq("date", today)
      .maybeSingle()) as { data: DailyCheckIn | null };
    if (data) {
      setRegulation(data.regulation ?? 5);
      setSleep(data.sleep ?? 5);
      setMood(data.mood ?? 5);
      setExistingId(data.id);
      setLogged(true);
    } else {
      setRegulation(5);
      setSleep(5);
      setMood(5);
    }
  }

  async function saveWellbeing() {
    if (!selectedChildId) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = {
      child_id: selectedChildId,
      created_by_id: user.id,
      date: today,
      regulation,
      sleep,
      mood,
    };
    const { error } = existingId
      ? await supabase.from("daily_check_ins").update(payload).eq("id", existingId)
      : await supabase.from("daily_check_ins").insert(payload);
    if (error) Alert.alert("Error", error.message);
    else { successHaptic(); setLogged(true); loadCheckIn(); }
    setSaving(false);
  }

  async function pickPhoto() {
    if (!selectedChildId) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (res.canceled || !res.assets[0]?.base64) return;
    const dataUrl = `data:${res.assets[0].mimeType ?? "image/jpeg"};base64,${res.assets[0].base64}`;
    const { error } = await supabase
      .from("children")
      .update({ photo_url: dataUrl })
      .eq("id", selectedChildId);
    if (error) Alert.alert("Error", error.message);
    else refresh();
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
          <Ionicons name="sunny" size={56} color={colors.emerald[400]} />
          <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">
            Welcome to Senstory
          </Text>
          <Text className="text-slate-500 text-center mb-6">
            Start by adding your child's profile.
          </Text>
          <Pressable
            className="bg-emerald-100 border border-emerald-200 rounded-full px-6 py-3 flex-row items-center gap-2"
            onPress={() => router.push("/(app)/add-child")}
          >
            <Ionicons name="add" size={18} color={colors.emerald[800]} />
            <Text className="text-emerald-800 font-semibold">Add child profile</Text>
          </Pressable>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const avg = (regulation + sleep + mood) / 3;

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between mt-2 mb-6">
            <Text className="text-sm text-slate-600">{selectedChild.name}'s Day</Text>
            <Text className="text-sm text-slate-600">
              {format(new Date(), "EEE, MMM d")}
            </Text>
          </View>

          {/* Child photo */}
          <View className="items-center mb-4">
            <Pressable
              onPress={pickPhoto}
              accessibilityRole="button"
              accessibilityLabel={`${selectedChild.name}'s photo. Tap to change.`}
            >
              <View
                className="w-36 h-36 rounded-full overflow-hidden border-4 border-white"
                style={{ shadowColor: "#0f172a", shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}
              >
                {selectedChild.photo_url ? (
                  <Image source={{ uri: selectedChild.photo_url }} className="w-full h-full" />
                ) : (
                  <View className="w-full h-full bg-emerald-100 items-center justify-center">
                    <Text className="text-5xl font-semibold text-emerald-400">
                      {selectedChild.name[0]?.toUpperCase()}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-1">Tap to add photo</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          {/* Child selector pills */}
          {children.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {children.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedChildId(c.id)}
                    className={`px-4 py-2 rounded-full border ${
                      c.id === selectedChildId
                        ? "bg-emerald-100 border-emerald-200"
                        : "bg-white/70 border-slate-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        c.id === selectedChildId ? "text-emerald-800" : "text-slate-500"
                      }`}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Wellbeing logger */}
          <Card className="p-6 mb-4">
            <Text className="text-base font-semibold text-slate-700 text-center mb-6">
              {summaryLabel(avg)}
            </Text>
            <View className="gap-4 mb-6">
              <MetricDotRow label="Regulation" value={regulation} onChange={setRegulation} color={metricColors.regulation} scoreColor="text-emerald-600" />
              <MetricDotRow label="Sleep" value={sleep} onChange={setSleep} color={metricColors.sleep} scoreColor="text-blue-400" />
              <MetricDotRow label="Mood" value={mood} onChange={setMood} color={metricColors.mood} scoreColor="text-amber-400" />
            </View>
            <Pressable
              onPress={saveWellbeing}
              disabled={saving}
              className={`bg-emerald-100 border border-emerald-200 rounded-full py-3.5 items-center ${saving ? "opacity-60" : ""}`}
            >
              <Text className="text-emerald-800 font-semibold">
                {saving ? "Saving…" : logged ? "Update today's wellbeing" : "Log today's wellbeing"}
              </Text>
            </Pressable>
          </Card>

          {/* Quick links */}
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {QUICK_LINKS.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => router.push(link.route as any)}
                style={{ width: "47.5%" }}
              >
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
