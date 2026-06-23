import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { PressableCard } from "@/components/ui/PressableCard";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const [refreshing, setRefreshing] = useState(false);
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

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

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
          <SkeletonList count={4} />
        ) : !selectedChild ? (
          <EmptyState
            icon="person-add-outline"
            title="No child yet"
            subtitle="Add a child on the Home tab to create personalised social stories."
          />
        ) : shown.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title={tab === "favourites" ? "No favourites yet" : "No stories yet"}
            subtitle={
              tab === "favourites"
                ? "Tap the star on a story to keep it here."
                : "Create a calm, personalised social story for a moment that's tricky."
            }
            ctaLabel={tab === "all" ? "Create a story" : undefined}
            onCta={tab === "all" ? () => router.push("/(app)/story-builder") : undefined}
          />
        ) : (
          <FlatList
            data={shown}
            keyExtractor={(s) => s.id}
            contentContainerClassName="px-4 pb-32"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.emerald[400]} />}
            renderItem={({ item }) => (
              <PressableCard onPress={() => router.push(`/(app)/story/${item.id}`)} className="p-4 mb-3">
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
                </PressableCard>
            )}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
