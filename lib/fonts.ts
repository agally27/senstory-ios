import { Text as RNText, StyleSheet, TextStyle } from "react-native";
import { VarelaRound_400Regular } from "@expo-google-fonts/varela-round";
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";

// Font map for useFonts() in the root layout.
export const fontMap = {
  VarelaRound_400Regular,
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
};

// Custom fonts in RN don't respond to fontWeight, so we map each resolved
// weight to the matching Nunito Sans file.
function weightToNunito(weight?: TextStyle["fontWeight"]): string {
  switch (String(weight)) {
    case "700":
    case "800":
    case "900":
    case "bold":
      return "NunitoSans_700Bold";
    case "600":
      return "NunitoSans_600SemiBold";
    case "500":
      return "NunitoSans_500Medium";
    default:
      return "NunitoSans_400Regular";
  }
}

let patched = false;

// Patches RN Text once so every <Text> uses the Nunito Sans body font by
// default (weight-aware). Text that explicitly sets a fontFamily — e.g. the
// `font-heading` (Varela Round) class on titles — is left untouched.
export function applyGlobalFont() {
  if (patched) return;
  patched = true;
  const TextAny = RNText as any;
  const originalRender = TextAny.render;
  TextAny.render = function render(props: any, ref: any) {
    const flat = (StyleSheet.flatten(props.style) || {}) as TextStyle;
    const family = flat.fontFamily ?? weightToNunito(flat.fontWeight);
    return originalRender.call(this, {
      ...props,
      style: [props.style, { fontFamily: family }],
    }, ref);
  };
}
