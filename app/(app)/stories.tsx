import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";

interface Story {
  id: string;
  title: string;
  goal: string;
  status: string;
  favourite: boolean;
  length: string;
  created_at: string;
}

export default function StoriesScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "favourites">("all");

  const load = useCallback(async () => {
    if (!selectedChildId) {
      setStories([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("stories")
      .select("*")
      .eq("child_id", selectedChildId)
      .order("created_at", { ascending: false });
    setStories((data ?? []) as Story[]);
    setLoading(false);
  }, [selectedChildId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function toggleFavourite(story: Story) {
    await supabase.from("stories").update({ favourite: !story.favourite }).eq("id", story.id);
    load();
  }

  const shown = tab === "favourites" ? stories.filter((s) => s.favourite) : stories;

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 mt-2 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-800 font-heading">Social Stories</Text>
            <Text className="text-sm text-slate-500">
              {selectedChild ? `For ${selectedChild.name}` : "Personalised social stories"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/story-builder")}
            disabled={!selectedChildId}
            className="bg-emerald-100 border border-emerald-200 rounded-full w-11 h-11 items-center justify-center"
          >
            <Ionicons name="add" size={24} color={colors.emerald[800]} />
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 px-4 mb-3">
          {(["all", "favourites"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-4 py-2 rounded-full border ${
                tab === t ? "bg-emerald-100 border-emerald-200" : "bg-white/70 border-slate-200"
              }`}
            >
              <Text className={`text-sm font-medium ${tab === t ? "text-emerald-800" : "text-slate-500"}`}>
                {t === "all" ? "Your Stories" : "Favourites"}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.emerald[500]} />
          </View>
        ) : !selectedChild ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-slate-400 text-center">
              Add a child on the Home tab to create stories.
            </Text>
          </View>
        ) : shown.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="book-outline" size={48} color={colors.slate[300]} />
            <Text className="text-slate-400 text-center mt-4">
              {tab === "favourites" ? "No favourites yet" : "No stories yet"}
            </Text>
            {tab === "all" && (
              <Pressable
                onPress={() => router.push("/(app)/story-builder")}
                className="mt-6 bg-emerald-100 border border-emerald-200 rounded-full px-6 py-3"
              >
                <Text className="text-emerald-800 font-semibold">Create a story</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <FlatList
            data={shown}
            keyExtractor={(s) => s.id}
            contentContainerClassName="px-4 pb-32"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/(app)/story/${item.id}`)}>
                <Card className="p-4 mb-3">
                  <View className="flex-row items-start gap-3">
                    <View className="w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center">
                      <Ionicons name="book" size={22} color={colors.amber[600]} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-800">{item.title}</Text>
                      {item.goal ? (
                        <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                          {item.goal}
                        </Text>
                      ) : null}
                      <Text className="text-[11px] text-slate-400 mt-1">
                        {item.length} · {format(new Date(item.created_at), "d MMM")}
                      </Text>
                    </View>
                    <Pressable onPress={() => toggleFavourite(item)} hitSlop={8}>
                      <Ionicons
                        name={item.favourite ? "star" : "star-outline"}
                        size={20}
                        color={item.favourite ? colors.amber[400] : colors.slate[300]}
                      />
                    </Pressable>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
