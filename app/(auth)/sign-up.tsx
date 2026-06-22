import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      Alert.alert("Sign up failed", error.message);
    } else if (!data.session) {
      Alert.alert("Check your email", "We've sent you a confirmation link.");
    }
    setLoading(false);
  }

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="justify-center px-6 py-12 flex-grow"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-4xl font-bold text-emerald-800 mb-2 font-heading">Create account</Text>
            <Text className="text-slate-500 mb-10">Join Senstory to start tracking.</Text>

            <Text className="text-sm font-medium text-slate-700 mb-1">Your name</Text>
            <TextInput
              className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4 text-base text-slate-900"
              placeholder="Alex Smith"
              placeholderTextColor={colors.slate[400]}
              value={name}
              onChangeText={setName}
            />

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
              placeholder="At least 8 characters"
              placeholderTextColor={colors.slate[400]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              className={`bg-emerald-500 rounded-full py-4 items-center ${loading ? "opacity-60" : ""}`}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-base">
                {loading ? "Creating account…" : "Create account"}
              </Text>
            </Pressable>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="text-emerald-600 font-medium">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
