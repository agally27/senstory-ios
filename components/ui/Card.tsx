import { View, ViewProps } from "react-native";

// Floating, elevated card: large radius (24pt), soft layered shadow, near-white.
export function Card({ className = "", children, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-white/90 rounded-[26px] ${className}`}
      style={{
        shadowColor: "#0c4a6e",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
