import * as Haptics from "expo-haptics";

// Light tap feedback — used on dot loggers and selections, mirroring the
// prototype's subtle vibrate. Safe no-op if the device lacks a Taptic Engine.
export function tapHaptic() {
  Haptics.selectionAsync().catch(() => {});
}

// Success feedback — used when a save completes.
export function successHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
