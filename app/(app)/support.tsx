import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { STRATEGIES } from "@/lib/strategies";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";
import { PressableCard } from "@/components/ui/PressableCard";

export default function SupportScreen() {
  const router = useRouter();
  const { children } = useChildren();

  function signOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 mt-2 mb-4">
          <Text className="text-2xl font-bold text-slate-800 font-heading">Support</Text>
          <Text className="text-sm text-slate-500">Strategies & account</Text>
        </View>

        <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
          {/* Strategies library */}
          <Text className="text-xs font-semibold text-slate-400 uppercase mb-2 px-1">
            Strategies
          </Text>
          {STRATEGIES.map((s) => (
            <PressableCard key={s.id} onPress={() => router.push(`/(app)/strategy/${s.id}`)} className="p-4 mb-3 flex-row items-center gap-3">
              <View className={`w-11 h-11 rounded-2xl items-center justify-center ${s.bg}`}>
                <Ionicons name={s.icon} size={22} color={s.tint} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">{s.title}</Text>
                <Text className="text-xs text-slate-500 mt-0.5">{s.summary}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.slate[300]} />
            </PressableCard>
          ))}

          {/* Account */}
          <Text className="text-xs font-semibold text-slate-400 uppercase mb-2 mt-4 px-1">
            Account
          </Text>
          {children.length > 0 && (
            <Card className="p-4 mb-3">
              {children.map((c) => (
                <View key={c.id} className="flex-row items-center gap-3 py-2">
                  <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center">
                    <Text className="text-emerald-700 font-bold">{c.name[0]?.toUpperCase()}</Text>
                  </View>
                  <Text className="text-slate-700 font-medium">{c.name}</Text>
                </View>
              ))}
            </Card>
          )}

          <Card className="p-2 mb-3">
            <Pressable
              onPress={() => router.push("/(app)/add-child")}
              className="flex-row items-center gap-3 px-3 py-3.5"
            >
              <Ionicons name="person-add-outline" size={20} color={colors.emerald[600]} />
              <Text className="text-slate-700 font-medium flex-1">Add a child profile</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.slate[300]} />
            </Pressable>
          </Card>

          <Card className="p-2">
            <Pressable onPress={signOut} className="flex-row items-center gap-3 px-3 py-3.5">
              <Ionicons name="log-out-outline" size={20} color={colors.rose[500]} />
              <Text className="text-rose-500 font-medium flex-1">Sign out</Text>
            </Pressable>
          </Card>

          <Text className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed px-4">
            Strategies offer supportive, general information — not clinical advice.
            Always consult a professional for diagnosis or treatment.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
