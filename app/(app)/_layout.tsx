import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
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
            backgroundColor: "transparent",
            elevation: 0,
          },
          tabBarBackground: () => (
            <BlurView
              tint="light"
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ),
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
        <Tabs.Screen
          name="stories"
          options={{
            title: "Stories",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        {/* Modal / detail routes hidden from the tab bar */}
        <Tabs.Screen name="add-child" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="log-event" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="checkin" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="strategy/[id]" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="visual-symbols" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="story-builder" options={{ href: null, tabBarStyle: { display: "none" } }} />
        <Tabs.Screen name="story/[id]" options={{ href: null, tabBarStyle: { display: "none" } }} />
      </Tabs>
    </ChildProvider>
  );
}
