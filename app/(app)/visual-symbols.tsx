import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";

interface Symbol {
  id: string;
  label: string;
  emoji: string;
  category: string;
}

// A calming default set so the library is useful immediately.
const STARTER: Symbol[] = [
  { id: "s-happy", label: "Happy", emoji: "😊", category: "emotion" },
  { id: "s-calm", label: "Calm", emoji: "😌", category: "emotion" },
  { id: "s-sad", label: "Sad", emoji: "😢", category: "emotion" },
  { id: "s-angry", label: "Angry", emoji: "😠", category: "emotion" },
  { id: "s-worried", label: "Worried", emoji: "😟", category: "emotion" },
  { id: "s-tired", label: "Tired", emoji: "😴", category: "emotion" },
  { id: "s-eat", label: "Eat", emoji: "🍎", category: "routine" },
  { id: "s-drink", label: "Drink", emoji: "🥤", category: "routine" },
  { id: "s-toilet", label: "Toilet", emoji: "🚽", category: "routine" },
  { id: "s-wash", label: "Wash", emoji: "🛁", category: "routine" },
  { id: "s-sleep", label: "Sleep", emoji: "🛏️", category: "routine" },
  { id: "s-play", label: "Play", emoji: "🧸", category: "routine" },
  { id: "s-school", label: "School", emoji: "🎒", category: "routine" },
  { id: "s-break", label: "Break", emoji: "⏸️", category: "routine" },
];

const EMOJI_PICKER = ["😊","😌","🙂","😢","😠","😟","😴","🤩","😄","😵","🍎","🥤","🚽","🛁","🛏️","🧸","🎒","⏸️","📚","🎵","🚗","🐶","☀️","🌧️","⭐","❤️","✅","➡️"];

export default function VisualSymbolsScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [custom, setCustom] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("😊");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!selectedChildId) { setCustom([]); setLoading(false); return; }
    const { data } = await supabase
      .from("visual_symbols")
      .select("id,label,emoji,category")
      .eq("child_id", selectedChildId)
      .order("created_at", { ascending: false });
    setCustom((data ?? []) as Symbol[]);
    setLoading(false);
  }, [selectedChildId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function addSymbol() {
    if (!selectedChildId || !newLabel.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("visual_symbols").insert({
      child_id: selectedChildId,
      label: newLabel.trim(),
      emoji: newEmoji,
      category: "custom",
    });
    if (error) Alert.alert("Error", error.message);
    setSaving(false);
    setAdding(false);
    setNewLabel("");
    setNewEmoji("😊");
    load();
  }

  async function removeSymbol(s: Symbol) {
    await supabase.from("visual_symbols").delete().eq("id", s.id);
    load();
  }

  const all = [...custom, ...STARTER];

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 pt-2 pb-3 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-800 font-heading">Visual Symbols</Text>
            <Text className="text-xs text-slate-500">Symbols, emotions & routines</Text>
          </View>
          <Pressable
            onPress={() => setAdding(true)}
            disabled={!selectedChildId}
            className="bg-emerald-100 border border-emerald-200 rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="add" size={22} color={colors.emerald[800]} />
          </Pressable>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.emerald[500]} />
          </View>
        ) : !selectedChild ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-slate-400 text-center">Add a child to use symbols.</Text>
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {all.map((s) => {
                const isCustom = s.category === "custom";
                return (
                  <Pressable
                    key={s.id}
                    onLongPress={isCustom ? () => removeSymbol(s) : undefined}
                    style={{ width: "30.5%" }}
                  >
                    <Card className="items-center py-4">
                      <Text style={{ fontSize: 40 }}>{s.emoji}</Text>
                      <Text className="text-xs font-medium text-slate-600 mt-1">{s.label}</Text>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-[11px] text-slate-400 text-center mt-4">
              Long-press a symbol you added to remove it.
            </Text>
          </ScrollView>
        )}

        {/* Add modal */}
        <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-800 font-heading">Add symbol</Text>
                <Pressable onPress={() => setAdding(false)}>
                  <Ionicons name="close" size={24} color={colors.slate[500]} />
                </Pressable>
              </View>

              <View className="items-center mb-3">
                <Text style={{ fontSize: 56 }}>{newEmoji}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {EMOJI_PICKER.map((e) => (
                    <Pressable
                      key={e}
                      onPress={() => setNewEmoji(e)}
                      className={`w-12 h-12 rounded-xl items-center justify-center border ${
                        newEmoji === e ? "bg-emerald-100 border-emerald-300" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text style={{ fontSize: 26 }}>{e}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4 text-base text-slate-900"
                placeholder="Label, e.g. Snack time"
                placeholderTextColor={colors.slate[400]}
                value={newLabel}
                onChangeText={setNewLabel}
              />

              <Pressable
                onPress={addSymbol}
                disabled={saving || !newLabel.trim()}
                className={`bg-emerald-500 rounded-full py-4 items-center ${saving || !newLabel.trim() ? "opacity-50" : ""}`}
              >
                <Text className="text-white font-semibold">{saving ? "Saving…" : "Add symbol"}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenBackground>
  );
}
