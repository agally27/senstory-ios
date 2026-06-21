import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

export default function SettingsScreen() {
  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <View className="px-4 pt-2">
        <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <TouchableOpacity
            className="px-4 py-4 border-b border-gray-50"
            onPress={handleSignOut}
          >
            <Text className="text-red-500 font-medium">Sign out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400 text-center mt-8">
          Senstory — for families, with care.
        </Text>
      </View>
    </SafeAreaView>
  );
}
