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
import { successHaptic } from "@/lib/haptics";
import { generateStory } from "@/lib/story-generator";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-slate-700 mb-2">{label}</Text>
      <View className="flex-row gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              className={`flex-1 rounded-2xl border py-3 items-center ${
                on ? "bg-emerald-100 border-emerald-300" : "bg-white/70 border-slate-200"
              }`}
            >
              <Text className={`text-sm font-semibold ${on ? "text-emerald-800" : "text-slate-600"}`}>
                {o.label}
              </Text>
              {o.hint ? (
                <Text className={`text-[11px] mt-0.5 ${on ? "text-emerald-600" : "text-slate-400"}`}>
                  {o.hint}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function StoryBuilderScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [perspective, setPerspective] = useState<"first" | "third">("first");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [style, setStyle] = useState<"text_focused" | "balanced" | "image_rich">("balanced");
  const [display, setDisplay] = useState<"page" | "scroll">("page");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!selectedChildId || !selectedChild) return;
    if (!title.trim()) {
      Alert.alert("Title needed", "Give your story a title.");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const pages = generateStory({
      childName: selectedChild.name,
      title: title.trim(),
      goal: goal.trim(),
      perspective,
      length,
      tone: "calm",
    });

    const { data: story, error } = await supabase
      .from("stories")
      .insert({
        child_id: selectedChildId,
        title: title.trim(),
        goal: goal.trim(),
        status: "active",
        style,
        display,
        length,
        perspective,
      })
      .select()
      .single();

    if (error || !story) {
      Alert.alert("Error", error?.message ?? "Could not create story.");
      setSaving(false);
      return;
    }

    const pageRows = pages.map((p, i) => ({
      story_id: story.id,
      order: i,
      heading: p.heading,
      text: p.text,
    }));
    const { error: pagesError } = await supabase.from("story_pages").insert(pageRows);
    if (pagesError) {
      Alert.alert("Error", pagesError.message);
      setSaving(false);
      return;
    }

    successHaptic();
    router.replace(`/(app)/story/${story.id}`);
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
            <Text className="text-xl font-bold text-slate-800 font-heading">New story</Text>
          </View>

          <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
            <Text className="text-sm font-medium text-slate-700 mt-2 mb-1">Title</Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4 text-base text-slate-900"
              placeholder="e.g. Going to the dentist"
              placeholderTextColor={colors.slate[400]}
              value={title}
              onChangeText={setTitle}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">
              What is the story about?
            </Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-5 text-base text-slate-900"
              placeholder="e.g. visiting the dentist for a check-up"
              placeholderTextColor={colors.slate[400]}
              value={goal}
              onChangeText={setGoal}
            />

            <Choice
              label="Perspective"
              value={perspective}
              onChange={setPerspective}
              options={[
                { value: "first", label: "First", hint: '"I can…"' },
                { value: "third", label: "Third", hint: `"${selectedChild?.name ?? "Name"} can…"` },
              ]}
            />

            <Choice
              label="Length"
              value={length}
              onChange={setLength}
              options={[
                { value: "short", label: "Short", hint: "4 pages" },
                { value: "medium", label: "Medium", hint: "7 pages" },
                { value: "long", label: "Long", hint: "10 pages" },
              ]}
            />

            <Choice
              label="Style"
              value={style}
              onChange={setStyle}
              options={[
                { value: "text_focused", label: "Text", hint: "fewer images" },
                { value: "balanced", label: "Balanced", hint: "text + image" },
                { value: "image_rich", label: "Visual", hint: "more images" },
              ]}
            />

            <Choice
              label="Display"
              value={display}
              onChange={setDisplay}
              options={[
                { value: "page", label: "Page by page" },
                { value: "scroll", label: "Single scroll" },
              ]}
            />

            <Card className="p-4 mb-8 flex-row items-start gap-2">
              <Ionicons name="information-circle-outline" size={18} color={colors.slate[400]} />
              <Text className="text-xs text-slate-500 flex-1 leading-relaxed">
                Pages are generated on your device from these settings. You can read
                and reuse the story any time — illustrations can be added later.
              </Text>
            </Card>
          </ScrollView>

          <View className="px-4 pb-6">
            <Pressable
              onPress={create}
              disabled={saving}
              className={`bg-emerald-500 rounded-full py-4 items-center ${saving ? "opacity-60" : ""}`}
            >
              <Text className="text-white font-semibold text-base">
                {saving ? "Creating…" : "Create story"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
