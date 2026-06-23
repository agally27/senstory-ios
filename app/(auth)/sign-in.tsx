import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GradientButton } from "@/components/ui/GradientButton";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Sign in failed", error.message);
    setLoading(false);
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-1 justify-center px-6">
            <Text className="text-4xl font-bold text-emerald-800 mb-2 font-heading">Senstory</Text>
            <Text className="text-slate-500 mb-10">
              Supporting your family, one day at a time.
            </Text>

            <Text className="text-sm font-medium text-slate-700 mb-1">Email</Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4 text-base text-slate-900"
              placeholder="you@example.com"
              placeholderTextColor={colors.slate[400]}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1">Password</Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-6 text-base text-slate-900"
              placeholder="••••••••"
              placeholderTextColor={colors.slate[400]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <GradientButton label="Sign in" onPress={handleSignIn} loading={loading} />

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="text-emerald-600 font-medium">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
