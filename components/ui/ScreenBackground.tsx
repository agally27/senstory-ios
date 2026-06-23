import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { screenGradient, colors } from "@/lib/theme";

const { width } = Dimensions.get("window");

// Soft emerald → sky wash with layered waves at the bottom, mirroring the
// prototype's calm background.
export function ScreenBackground({ children }: { children: ReactNode }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={screenGradient} style={StyleSheet.absoluteFill} />
      {/* Decorative waves pinned to the bottom */}
      <View style={styles.waves} pointerEvents="none">
        <Svg width={width} height={180} viewBox={`0 0 ${width} 180`}>
          <Path
            d={`M0 90 Q ${width * 0.25} 50 ${width * 0.5} 90 T ${width} 90 V180 H0 Z`}
            fill={colors.emerald[200]}
            opacity={0.25}
          />
          <Path
            d={`M0 120 Q ${width * 0.3} 80 ${width * 0.6} 120 T ${width} 120 V180 H0 Z`}
            fill={colors.sky[200]}
            opacity={0.3}
          />
          <Path
            d={`M0 145 Q ${width * 0.25} 115 ${width * 0.5} 145 T ${width} 145 V180 H0 Z`}
            fill={colors.teal[100]}
            opacity={0.5}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  waves: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
