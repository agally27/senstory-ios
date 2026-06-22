import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { screenGradient } from "@/lib/theme";

// Soft emerald → sky wash used behind every screen.
export function ScreenBackground({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={screenGradient} style={StyleSheet.absoluteFill}>
      {children}
    </LinearGradient>
  );
}
