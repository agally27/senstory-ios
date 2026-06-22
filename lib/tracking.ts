import { colors } from "@/lib/theme";

// Quick tags a parent can attach to an entry (from the prototype).
export const QUICK_TAGS = [
  "calm day",
  "off school",
  "screen time",
  "attention seeking",
  "sensory seeking",
  "anxious",
  "good focus",
  "transition",
  "tired",
  "constipated",
  "poor sleep",
  "ate well",
];

// Regulation status badge derived from a 1–5 "regulation after" reading.
export function regulationStatus(regulation: number | null) {
  if (regulation == null) return null;
  if (regulation >= 4)
    return { label: "Regulated", bg: "bg-emerald-100", text: "text-emerald-700", dot: colors.emerald[400] };
  if (regulation >= 3)
    return { label: "Mostly regulated", bg: "bg-amber-100", text: "text-amber-700", dot: colors.amber[400] };
  return { label: "Dysregulated", bg: "bg-rose-100", text: "text-rose-600", dot: colors.rose[500] };
}
