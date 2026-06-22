import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";

const EMOTIONS = [
  { id: "happy", emoji: "😊", label: "Happy", colors: [colors.amber[200], colors.amber[100]] as const },
  { id: "calm", emoji: "😌", label: "Calm", colors: [colors.emerald[200], colors.teal[200]] as const },
  { id: "okay", emoji: "🙂", label: "Okay", colors: [colors.sky[200], colors.sky[100]] as const },
  { id: "worried", emoji: "😟", label: "Worried", colors: [colors.purple[200], colors.violet[200]] as const },
  { id: "sad", emoji: "😢", label: "Sad", colors: [colors.sky[200], colors.violet[200]] as const },
  { id: "angry", emoji: "😠", label: "Angry", colors: [colors.rose[200], colors.rose[100]] as const },
  { id: "overwhelmed", emoji: "😵", label: "Too Much", colors: [colors.amber[200], colors.rose[200]] as const },
  { id: "tired", emoji: "😴", label: "Tired", colors: [colors.slate[200], colors.slate[100]] as const },
];

export default function CheckInScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!selected || !selectedChildId) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("emotion_check_ins").insert({
      child_id: selectedChildId,
      created_by_id: user.id,
      emotion: selected,
      date: format(new Date(), "yyyy-MM-dd"),
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
        <View className="px-4 pt-2 pb-3 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={26} color={colors.slate[700]} />
          </Pressable>
          <Text className="text-xl font-bold text-slate-800">Check-in</Text>
        </View>

        <ScrollView contentContainerClassName="px-4 pb-8" showsVerticalScrollIndicator={false}>
          <View className="items-center my-6">
            <View className="w-20 h-20 rounded-full bg-rose-100 items-center justify-center mb-4">
              <Ionicons name="heart" size={36} color={colors.rose[500]} />
            </View>
            <Text className="text-2xl font-bold text-slate-800 mb-1">
              How are you feeling?
            </Text>
            <Text className="text-slate-500">
              {selectedChild ? `Pick the face that matches, ${selectedChild.name}` : "Pick the face that matches"}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {EMOTIONS.map((e) => {
              const active = selected === e.id;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => setSelected(e.id)}
                  style={{ width: "48%", marginBottom: 14 }}
                >
                  <LinearGradient
                    colors={e.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 24,
                      paddingVertical: 24,
                      alignItems: "center",
                      borderWidth: active ? 3 : 0,
                      borderColor: colors.rose[400],
                    }}
                  >
                    <Text style={{ fontSize: 48, marginBottom: 6 }}>{e.emoji}</Text>
                    <Text className="text-lg font-bold text-slate-700">{e.label}</Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {selected && (
          <View className="px-4 pb-6">
            <Pressable
              onPress={submit}
              disabled={saving}
              className={`bg-rose-500 rounded-full py-4 flex-row items-center justify-center gap-2 ${saving ? "opacity-60" : ""}`}
            >
              <Ionicons name="checkmark" size={22} color="white" />
              <Text className="text-white font-bold text-base">
                {saving ? "Saving…" : "Done!"}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
