import { Stack } from "expo-router";

export default function ChildLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="log" />
      <Stack.Screen name="log-event" options={{ presentation: "modal" }} />
      <Stack.Screen name="checkin" options={{ presentation: "modal" }} />
    </Stack>
  );
}
