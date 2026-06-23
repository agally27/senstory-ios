// Central palette for the Senstory app — mirrors the prototype's calm,
// emerald-led design language. Use these for non-className props (icons,
// gradients, chart strokes) where Tailwind classes can't reach.

export const colors = {
  // Primary — emerald/teal
  emerald: {
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
  },
  teal: { 100: "#ccfbf1", 200: "#99f6e4" },
  sky: { 100: "#e0f2fe", 200: "#bae6fd", 400: "#38bdf8", 600: "#0284c7" },
  amber: { 100: "#fef3c7", 200: "#fde68a", 400: "#fbbf24", 600: "#d97706" },
  rose: { 100: "#ffe4e6", 200: "#fecdd3", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48" },
  purple: { 100: "#f3e8ff", 200: "#e9d5ff", 600: "#9333ea" },
  violet: { 100: "#ede9fe", 200: "#ddd6fe", 700: "#6d28d9" },
  lime: { 100: "#ecfccb", 700: "#4d7c0f" },
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
  },
  white: "#ffffff",
};

// Background gradient for app screens (soft sky → white wash, Calm/Flo style)
export const screenGradient = ["#e0f2fe", "#f0f9ff", "#ffffff"] as const;

// Gradient presets for buttons, tiles, accents.
export const gradients = {
  primary: ["#34d399", "#0ea5e9"] as const, // emerald → sky
  emerald: ["#34d399", "#10b981"] as const,
  sky: ["#38bdf8", "#0284c7"] as const,
  rose: ["#fb7185", "#f43f5e"] as const,
  amber: ["#fbbf24", "#f59e0b"] as const,
  violet: ["#a78bfa", "#7c3aed"] as const,
};

// Metric row colours (Home wellbeing loggers)
export const metricColors = {
  regulation: "#34d399", // emerald-400
  sleep: "#7dc3fa", // soft blue
  mood: "#fbbf24", // amber-400
};
