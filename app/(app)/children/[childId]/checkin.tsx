import { useEffect, useState } from "react";
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
import type { DailyCheckIn } from "@/lib/types";

function EmojiRating({
  label,
  emojis,
  value,
  onChange,
}: {
  label: string;
  emojis: string[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View className="flex-row justify-between">
        {emojis.map((emoji, i) => {
          const rating = i + 1;
          return (
            <TouchableOpacity
              key={rating}
              className={`items-center px-2 py-2 rounded-xl ${
                value === rating ? "bg-brand-100" : ""
              }`}
              onPress={() => onChange(rating)}
            >
              <Text className="text-3xl">{emoji}</Text>
              <Text
                className={`text-xs mt-1 ${
                  value === rating ? "text-brand-700 font-bold" : "text-gray-400"
                }`}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const REGULATION_EMOJIS = ["😤", "😟", "😐", "🙂", "😌"];
const SLEEP_EMOJIS = ["😴", "🥱", "😐", "😊", "⭐"];
const MOOD_EMOJIS = ["😢", "😟", "😐", "😊", "😄"];

export default function CheckInScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const router = useRouter();
  const [regulation, setRegulation] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<string | null>(null);

  useEffect(() => {
    loadExisting();
  }, [childId]);

  async function loadExisting() {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_check_ins")
      .select("*")
      .eq("child_id", childId)
      .eq("date", today)
      .maybeSingle() as { data: DailyCheckIn | null; error: unknown };
    if (data) {
      setExisting(data.id);
      setRegulation(data.regulation);
      setSleep(data.sleep);
      setMood(data.mood);
      setNotes(data.notes);
    }
  }

  async function handleSave() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const today = new Date().toISOString().split("T")[0];
    const payload = {
      child_id: childId,
      created_by_id: user.id,
      date: today,
      regulation,
      sleep,
      mood,
      notes,
    };

    const { error } = existing
      ? await supabase.from("daily_check_ins").update(payload).eq("id", existing)
      : await supabase.from("daily_check_ins").insert(payload);

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
            Daily check-in
          </Text>
        </View>

        <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
          <Text className="text-sm text-gray-400 mt-4 mb-5">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>

          <EmojiRating
            label="Regulation today (1 = very dysregulated, 5 = calm)"
            emojis={REGULATION_EMOJIS}
            value={regulation}
            onChange={setRegulation}
          />
          <EmojiRating
            label="Sleep quality last night"
            emojis={SLEEP_EMOJIS}
            value={sleep}
            onChange={setSleep}
          />
          <EmojiRating
            label="Overall mood today"
            emojis={MOOD_EMOJIS}
            value={mood}
            onChange={setMood}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-8 text-base text-gray-900"
            placeholder="Anything notable today?"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
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
              {loading ? "Saving…" : existing ? "Update check-in" : "Save check-in"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
