import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import type { ObservationType, EventOutcome } from "@/lib/types";

const EVENT_TYPES: { value: ObservationType; label: string }[] = [
  { value: "calm_moment", label: "Calm moment" },
  { value: "sensory_overwhelm", label: "Sensory overwhelm" },
  { value: "meltdown", label: "Meltdown" },
  { value: "shutdown", label: "Shutdown" },
  { value: "anxiety", label: "Anxiety" },
  { value: "transition_difficulty", label: "Transition" },
  { value: "demand_avoidance", label: "Demand avoidance" },
  { value: "sleep", label: "Sleep" },
  { value: "food", label: "Food" },
  { value: "school", label: "School" },
  { value: "social", label: "Social" },
  { value: "strategy_used", label: "Strategy used" },
  { value: "custom_note", label: "Note" },
];

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-2">{label}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            className={`flex-1 py-2.5 rounded-xl items-center border ${
              value === n
                ? "bg-emerald-100 border-emerald-200"
                : "bg-white/70 border-slate-200"
            }`}
          >
            <Text className={`font-semibold ${value === n ? "text-emerald-800" : "text-slate-400"}`}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function LogEventScreen() {
  const router = useRouter();
  const { selectedChildId } = useChildren();

  const [type, setType] = useState<ObservationType>("custom_note");
  const [intensity, setIntensity] = useState<number | null>(null);
  const [regulationBefore, setRegulationBefore] = useState<number | null>(null);
  const [regulationAfter, setRegulationAfter] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<EventOutcome>("unknown");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!selectedChildId) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("observation_events").insert({
      child_id: selectedChildId,
      created_by_id: user.id,
      type,
      occurred_at: new Date().toISOString(),
      intensity,
      regulation_before: regulationBefore,
      regulation_after: regulationAfter,
      location: location || null,
      notes,
      outcome,
    });
    if (error) {
      Alert.alert("Error", error.message);
      setSaving(false);
    } else {
      router.back();
    }
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="px-4 pt-2 pb-3 flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={26} color={colors.slate[700]} />
            </Pressable>
            <Text className="text-xl font-bold text-slate-800 font-heading">Log entry</Text>
          </View>

          <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
            <Text className="text-sm font-medium text-slate-700 mt-3 mb-2">Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {EVENT_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setType(t.value)}
                  className={`px-4 py-2 rounded-full border ${
                    type === t.value
                      ? "bg-emerald-100 border-emerald-200"
                      : "bg-white/70 border-slate-200"
                  }`}
                >
                  <Text className={`text-sm font-medium ${type === t.value ? "text-emerald-800" : "text-slate-500"}`}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Card className="p-4 mb-4">
              <RatingRow label="Intensity (1 mild – 5 severe)" value={intensity} onChange={setIntensity} />
              <RatingRow label="Regulation before" value={regulationBefore} onChange={setRegulationBefore} />
              <RatingRow label="Regulation after" value={regulationAfter} onChange={setRegulationAfter} />
            </Card>

            <Text className="text-sm font-medium text-slate-700 mb-2">Outcome</Text>
            <View className="flex-row gap-2 mb-5">
              {(["improved", "no_change", "worsened", "unknown"] as EventOutcome[]).map((o) => (
                <Pressable
                  key={o}
                  onPress={() => setOutcome(o)}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${
                    outcome === o ? "bg-emerald-100 border-emerald-200" : "bg-white/70 border-slate-200"
                  }`}
                >
                  <Text className={`text-xs font-medium ${outcome === o ? "text-emerald-800" : "text-slate-400"}`}>
                    {o === "no_change" ? "Same" : o.charAt(0).toUpperCase() + o.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-slate-700 mb-1">Location (optional)</Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4 text-base text-slate-900"
              placeholder="e.g. school, home, supermarket"
              placeholderTextColor={colors.slate[400]}
              value={location}
              onChangeText={setLocation}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">Notes</Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-8 text-base text-slate-900"
              placeholder="What happened? Any context…"
              placeholderTextColor={colors.slate[400]}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          <View className="px-4 pb-6">
            <Pressable
              onPress={save}
              disabled={saving}
              className={`bg-emerald-100 border border-emerald-200 rounded-full py-4 items-center ${saving ? "opacity-60" : ""}`}
            >
              <Text className="text-emerald-800 font-semibold text-base">
                {saving ? "Saving…" : "Save entry"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
