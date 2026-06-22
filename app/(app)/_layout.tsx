import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChildProvider } from "@/lib/child-context";
import { colors } from "@/lib/theme";

export default function AppLayout() {
  return (
    <ChildProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.emerald[600],
          tabBarInactiveTintColor: colors.slate[400],
          tabBarStyle: {
            position: "absolute",
            borderTopWidth: 0,
            backgroundColor: "rgba(255,255,255,0.92)",
            elevation: 0,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sunny-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: "Track",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trending-up-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: "Support",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        {/* Modal / detail routes hidden from the tab bar */}
        <Tabs.Screen name="add-child" options={{ href: null }} />
        <Tabs.Screen name="log-event" options={{ href: null }} />
        <Tabs.Screen name="checkin" options={{ href: null }} />
      </Tabs>
    </ChildProvider>
  );
}
