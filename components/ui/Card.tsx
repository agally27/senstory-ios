import { View, ViewProps } from "react-native";

// Soft, calm card matching the prototype: near-white, rounded, gentle shadow.
export function Card({ className = "", children, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-white/80 rounded-3xl ${className}`}
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
