import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useChildren } from "@/lib/child-context";
import { colors } from "@/lib/theme";
import { successHaptic } from "@/lib/haptics";
import { analyse } from "@/lib/analyse";
import type { DailyCheckIn, ObservationEvent } from "@/lib/types";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { GradientButton } from "@/components/ui/GradientButton";

const STAGES = [
  "Reading daily check-ins…",
  "Reviewing logged events…",
  "Looking for patterns…",
  "Writing supportive insights…",
];

export default function AnalyseScreen() {
  const router = useRouter();
  const { selectedChild, selectedChildId } = useChildren();
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !selectedChildId) return;
    started.current = true;
    run();
  }, [selectedChildId]);

  async function run() {
    // Kick off data fetch immediately
    const dataPromise = Promise.all([
      supabase.from("daily_check_ins").select("*").eq("child_id", selectedChildId).order("date", { ascending: true }).limit(60),
      supabase.from("observation_events").select("*").eq("child_id", selectedChildId).order("occurred_at", { ascending: false }).limit(200),
    ]);

    // Animate through stages
    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      setProgress((i + 1) / (STAGES.length + 1));
      await wait(750);
    }

    const [ciRes, evRes] = await dataPromise;
    const drafts = analyse(
      (ciRes.data ?? []) as DailyCheckIn[],
      (evRes.data ?? []) as ObservationEvent[]
    );

    // Clear previous pending insights, then write fresh ones
    await supabase.from("insights").delete().eq("child_id", selectedChildId).eq("status", "pending");
    if (drafts.length > 0) {
      await supabase.from("insights").insert(
        drafts.map((d) => ({
          child_id: selectedChildId,
          claim: d.claim,
          confidence: d.confidence,
          suggested_action: d.suggested_action,
          safety_caveat: d.safety_caveat,
          data_limitations: d.data_limitations,
          status: "pending",
        }))
      );
    }

    setProgress(1);
    setCount(drafts.length);
    await wait(500);
    successHaptic();
    setDone(true);
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-2 pb-3 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={26} color={colors.slate[700]} />
          </Pressable>
          <Text className="text-xl font-bold text-slate-800 font-heading">Analyse patterns</Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <ProgressRing progress={progress} />

          {!done ? (
            <Text className="text-base text-slate-500 mt-8 text-center">{STAGES[stage]}</Text>
          ) : (
            <View className="items-center mt-8">
              <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-3">
                <Ionicons name="checkmark" size={28} color={colors.emerald[600]} />
              </View>
              <Text className="text-xl text-slate-800 font-heading text-center mb-1">
                Analysis complete
              </Text>
              <Text className="text-base text-slate-500 text-center">
                {count} insight{count === 1 ? "" : "s"} ready for {selectedChild?.name ?? "your child"} to review.
              </Text>
            </View>
          )}
        </View>

        {done && (
          <View className="px-6 pb-8">
            <GradientButton label="View insights" icon="arrow-forward" onPress={() => router.replace("/(app)/insights")} />
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
