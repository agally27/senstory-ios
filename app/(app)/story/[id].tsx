import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { Card } from "@/components/ui/Card";

interface Story {
  id: string;
  title: string;
  display: string;
}
interface Page {
  id: string;
  order: number;
  heading: string;
  text: string;
}

function PageArt() {
  // Placeholder illustration block (real illustrations need a backend image model).
  return (
    <View className="w-full h-44 rounded-2xl bg-emerald-100 items-center justify-center mb-5">
      <Ionicons name="image-outline" size={40} color={colors.emerald[400]} />
      <Text className="text-xs text-emerald-500 mt-1">illustration</Text>
    </View>
  );
}

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    const [sRes, pRes] = await Promise.all([
      supabase.from("stories").select("id,title,display").eq("id", id).single(),
      supabase.from("story_pages").select("id,order,heading,text").eq("story_id", id).order("order"),
    ]);
    setStory(sRes.data as Story);
    setPages((pRes.data ?? []) as Page[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function remove() {
    Alert.alert("Delete story", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("stories").delete().eq("id", id);
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.emerald[500]} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (!story) return null;
  const isPaged = story.display === "page";
  const page = pages[index];

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-4 pt-2 pb-3 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
          </Pressable>
          <Text className="text-lg font-bold text-slate-800 font-heading flex-1" numberOfLines={1}>
            {story.title}
          </Text>
          <Pressable onPress={remove} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color={colors.rose[400]} />
          </Pressable>
        </View>

        {isPaged ? (
          <View className="flex-1 px-4">
            <ScrollView className="flex-1" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
              <Card className="p-5 mt-2">
                <PageArt />
                {page?.heading ? (
                  <Text className="text-lg font-bold text-slate-800 mb-2 font-heading">
                    {page.heading}
                  </Text>
                ) : null}
                <Text className="text-base text-slate-700 leading-relaxed">{page?.text}</Text>
              </Card>
            </ScrollView>

            {/* Pager controls */}
            <View className="flex-row items-center justify-between py-3">
              <Pressable
                onPress={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className={`w-12 h-12 rounded-full bg-white/80 items-center justify-center ${index === 0 ? "opacity-30" : ""}`}
              >
                <Ionicons name="chevron-back" size={22} color={colors.slate[600]} />
              </Pressable>
              <Text className="text-sm text-slate-500">
                {index + 1} of {pages.length}
              </Text>
              <Pressable
                onPress={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
                disabled={index >= pages.length - 1}
                className={`w-12 h-12 rounded-full bg-emerald-500 items-center justify-center ${index >= pages.length - 1 ? "opacity-30" : ""}`}
              >
                <Ionicons name="chevron-forward" size={22} color="white" />
              </Pressable>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-4 pb-32" showsVerticalScrollIndicator={false}>
            {pages.map((p) => (
              <Card key={p.id} className="p-5 mb-3">
                <PageArt />
                {p.heading ? (
                  <Text className="text-lg font-bold text-slate-800 mb-2 font-heading">{p.heading}</Text>
                ) : null}
                <Text className="text-base text-slate-700 leading-relaxed">{p.text}</Text>
              </Card>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
