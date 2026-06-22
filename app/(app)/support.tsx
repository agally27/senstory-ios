import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";

type IoniconName = keyof typeof Ionicons.glyphMap;

export default function SupportScreen() {
  const router = useRouter();
  const { children } = useChildren();

  function signOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => supabase.auth.signOut() },
    ]);
  }

  const rows: { label: string; icon: IoniconName; onPress: () => void; tint: string }[] = [
    {
      label: "Add a child profile",
      icon: "person-add-outline",
      onPress: () => router.push("/(app)/add-child"),
      tint: colors.emerald[600],
    },
  ];

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 mt-2 mb-4">
          <Text className="text-2xl font-bold text-slate-800">Support</Text>
          <Text className="text-sm text-slate-500">Manage your family & account</Text>
        </View>

        <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
          {children.length > 0 && (
            <Card className="p-4 mb-4">
              <Text className="text-xs font-semibold text-slate-400 uppercase mb-3">
                Children
              </Text>
              {children.map((c) => (
                <View key={c.id} className="flex-row items-center gap-3 py-2">
                  <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center">
                    <Text className="text-emerald-700 font-bold">
                      {c.name[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-slate-700 font-medium">{c.name}</Text>
                </View>
              ))}
            </Card>
          )}

          <Card className="p-2 mb-4">
            {rows.map((row) => (
              <Pressable
                key={row.label}
                onPress={row.onPress}
                className="flex-row items-center gap-3 px-3 py-3.5"
              >
                <Ionicons name={row.icon} size={20} color={row.tint} />
                <Text className="text-slate-700 font-medium flex-1">{row.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.slate[300]} />
              </Pressable>
            ))}
          </Card>

          <Card className="p-2">
            <Pressable onPress={signOut} className="flex-row items-center gap-3 px-3 py-3.5">
              <Ionicons name="log-out-outline" size={20} color={colors.rose[500]} />
              <Text className="text-rose-500 font-medium flex-1">Sign out</Text>
            </Pressable>
          </Card>

          <Text className="text-xs text-slate-400 text-center mt-8">
            Senstory — for families, with care.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
