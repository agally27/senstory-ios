import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import type { Child } from "@/lib/types";

export default function DashboardScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .order("name");
    if (error) Alert.alert("Error", error.message);
    else setChildren(data ?? []);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Senstory</Text>
        <TouchableOpacity
          className="bg-brand-600 rounded-full p-2"
          onPress={() => router.push("/(app)/children/add")}
        >
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : children.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="people-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-400 text-center mt-4 text-base">
            Add your first child to start tracking
          </Text>
          <TouchableOpacity
            className="mt-6 bg-brand-600 rounded-xl px-6 py-3"
            onPress={() => router.push("/(app)/children/add")}
          >
            <Text className="text-white font-semibold">Add a child</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(c) => c.id}
          contentContainerClassName="px-4 pt-2 pb-8"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
              onPress={() => router.push(`/(app)/children/${item.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-full bg-brand-100 items-center justify-center">
                    <Text className="text-brand-700 text-lg font-bold">
                      {item.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.name}
                    </Text>
                    {item.date_of_birth && (
                      <Text className="text-sm text-gray-400">
                        {new Date(item.date_of_birth).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
