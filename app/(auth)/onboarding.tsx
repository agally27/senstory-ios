import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { colors, gradients } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GradientButton, SoftButton } from "@/components/ui/GradientButton";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "sunny" as const,
    grad: gradients.emerald,
    title: "Welcome to Senstory",
    body: "A calm, supportive companion for parents of children with autism, ADHD and sensory differences.",
  },
  {
    icon: "calendar" as const,
    grad: gradients.sky,
    title: "Track the day",
    body: "Log wellbeing, moods, triggers and calm moments in seconds — little and often builds the clearest picture.",
  },
  {
    icon: "trending-up" as const,
    grad: gradients.violet,
    title: "Spot the patterns",
    body: "Your advisor learns about your child over time and surfaces gentle, supportive insights — never clinical claims.",
  },
  {
    icon: "heart" as const,
    grad: gradients.rose,
    title: "Support every day",
    body: "Strategies, visual symbols and personalised social stories, ready whenever you need them.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    SecureStore.getItemAsync("onboarded").then((v) => {
      if (v === "true") router.replace("/(auth)/sign-in");
    });
  }, []);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function next() {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      finish("/(auth)/sign-up");
    }
  }

  async function finish(path: "/(auth)/sign-up" | "/(auth)/sign-in") {
    await SecureStore.setItemAsync("onboarded", "true");
    router.replace(path);
  }

  const last = index === SLIDES.length - 1;

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1">
        {/* Skip */}
        <View className="flex-row justify-end px-5 pt-2">
          <Pressable onPress={() => finish("/(auth)/sign-in")} hitSlop={10}>
            <Text className="text-slate-400 font-medium">Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          className="flex-1"
        >
          {SLIDES.map((s) => (
            <View key={s.title} style={{ width }} className="items-center justify-center px-10">
              <LinearGradient
                colors={s.grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 132, height: 132, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 36 }}
              >
                <Ionicons name={s.icon} size={60} color="white" />
              </LinearGradient>
              <Text className="text-3xl text-slate-800 font-heading text-center mb-3">{s.title}</Text>
              <Text className="text-base text-slate-500 text-center leading-relaxed">{s.body}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                backgroundColor: i === index ? colors.emerald[500] : colors.slate[200],
              }}
            />
          ))}
        </View>

        {/* CTAs */}
        <View className="px-6 pb-8 gap-3">
          <GradientButton label={last ? "Get started" : "Next"} onPress={next} icon={last ? "arrow-forward" : undefined} />
          {last && <SoftButton label="I already have an account" onPress={() => finish("/(auth)/sign-in")} />}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
