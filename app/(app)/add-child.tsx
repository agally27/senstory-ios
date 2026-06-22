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

export default function AddChildScreen() {
  const router = useRouter();
  const { refresh } = useChildren();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter the child's name.");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("children").insert({
      owner_id: user.id,
      name: name.trim(),
      date_of_birth: dob || null,
    });
    if (error) {
      Alert.alert("Error", error.message);
      setSaving(false);
    } else {
      await refresh();
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
              <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
            </Pressable>
            <Text className="text-xl font-bold text-slate-800">Add a child</Text>
          </View>

          <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
            <View className="mt-4 mb-5">
              <Text className="text-sm font-medium text-slate-700 mb-1">
                Child's name
              </Text>
              <TextInput
                className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900"
                placeholder="e.g. Sam"
                placeholderTextColor={colors.slate[400]}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="mb-5">
              <Text className="text-sm font-medium text-slate-700 mb-1">
                Date of birth (optional)
              </Text>
              <TextInput
                className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.slate[400]}
                value={dob}
                onChangeText={setDob}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </ScrollView>

          <View className="px-4 pb-6">
            <Pressable
              onPress={save}
              disabled={saving}
              className={`bg-emerald-100 border border-emerald-200 rounded-full py-4 items-center ${saving ? "opacity-60" : ""}`}
            >
              <Text className="text-emerald-800 font-semibold text-base">
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
