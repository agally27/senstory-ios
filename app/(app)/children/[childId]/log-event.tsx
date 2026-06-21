import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import type { ObservationType, EventOutcome } from "@/lib/types";

const EVENT_TYPES: { value: ObservationType; label: string }[] = [
  { value: "calm_moment", label: "Calm moment" },
  { value: "sensory_overwhelm", label: "Sensory overwhelm" },
  { value: "meltdown", label: "Meltdown" },
  { value: "shutdown", label: "Shutdown" },
  { value: "anxiety", label: "Anxiety" },
  { value: "transition_difficulty", label: "Transition difficulty" },
  { value: "demand_avoidance", label: "Demand avoidance" },
  { value: "sleep", label: "Sleep" },
  { value: "food", label: "Food" },
  { value: "school", label: "School" },
  { value: "social", label: "Social" },
  { value: "strategy_used", label: "Strategy used" },
  { value: "custom_note", label: "Custom note" },
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
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            className={`flex-1 py-2 rounded-lg items-center border ${
              value === n
                ? "bg-brand-600 border-brand-600"
                : "bg-white border-gray-200"
            }`}
            onPress={() => onChange(n)}
          >
            <Text
              className={`font-semibold ${value === n ? "text-white" : "text-gray-500"}`}
            >
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function LogEventScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const router = useRouter();

  const [type, setType] = useState<ObservationType>("custom_note");
  const [intensity, setIntensity] = useState<number | null>(null);
  const [regulationBefore, setRegulationBefore] = useState<number | null>(null);
  const [regulationAfter, setRegulationAfter] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<EventOutcome>("unknown");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase.from("observation_events").insert({
      child_id: childId,
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
    } else {
      router.back();
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="px-5 pt-4 pb-3 flex-row items-center gap-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1">
            Log event
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          {/* Event type */}
          <Text className="text-sm font-medium text-gray-700 mt-4 mb-2">
            Type *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2 py-1">
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  className={`px-4 py-2 rounded-full border ${
                    type === t.value
                      ? "bg-brand-600 border-brand-600"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => setType(t.value)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      type === t.value ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <RatingRow
            label="Intensity (1 = mild, 5 = severe)"
            value={intensity}
            onChange={setIntensity}
          />
          <RatingRow
            label="Regulation before (1 = very dysregulated, 5 = calm)"
            value={regulationBefore}
            onChange={setRegulationBefore}
          />
          <RatingRow
            label="Regulation after"
            value={regulationAfter}
            onChange={setRegulationAfter}
          />

          {/* Outcome */}
          <Text className="text-sm font-medium text-gray-700 mb-2">Outcome</Text>
          <View className="flex-row gap-2 mb-4">
            {(["improved", "no_change", "worsened", "unknown"] as EventOutcome[]).map(
              (o) => (
                <TouchableOpacity
                  key={o}
                  className={`flex-1 py-2 rounded-lg items-center border ${
                    outcome === o
                      ? "bg-brand-600 border-brand-600"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => setOutcome(o)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      outcome === o ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {o === "no_change" ? "No change" : o.charAt(0).toUpperCase() + o.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-1">
            Location (optional)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base text-gray-900"
            placeholder="e.g. school, home, supermarket"
            value={location}
            onChangeText={setLocation}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">Notes</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-8 text-base text-gray-900"
            placeholder="What happened? Any context or observations…"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            value={notes}
            onChangeText={setNotes}
          />
        </ScrollView>

        <View className="px-5 pb-6">
          <TouchableOpacity
            className={`bg-brand-600 rounded-xl py-4 items-center ${loading ? "opacity-60" : ""}`}
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Saving…" : "Save event"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
