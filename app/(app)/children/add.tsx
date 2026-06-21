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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

export default function AddChildScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter the child's name.");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase.from("children").insert({
      owner_id: user.id,
      name: name.trim(),
      date_of_birth: dob || null,
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
        <View className="px-5 pt-4 pb-3 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Add a child</Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-5 mt-2">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Child's name *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="e.g. Sam"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Date of birth (optional)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="YYYY-MM-DD"
              value={dob}
              onChangeText={setDob}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </ScrollView>

        <View className="px-5 pb-6">
          <TouchableOpacity
            className={`bg-brand-600 rounded-xl py-4 items-center ${loading ? "opacity-60" : ""}`}
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Saving…" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
