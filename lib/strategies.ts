import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface Strategy {
  id: string;
  title: string;
  summary: string;
  icon: IoniconName;
  tint: string;
  bg: string;
  steps: string[];
}

// Supportive, general strategies — not clinical advice. Mirrors the prototype's
// Support → Strategies library (Meltdown, Shutdown, Burnout, Transition,
// Hyperactivity).
export const STRATEGIES: Strategy[] = [
  {
    id: "meltdown",
    title: "Meltdown Support",
    summary: "Understand and respond to meltdowns with compassion.",
    icon: "flame-outline",
    tint: colors.rose[500],
    bg: "bg-rose-100",
    steps: [
      "Stay calm and lower your own voice — your regulation helps theirs.",
      "Reduce sensory input: dim lights, lower noise, give space.",
      "Keep words minimal. Offer reassurance, not demands or questions.",
      "Move to a safe, quiet spot if you can.",
      "Wait for the wave to pass before problem-solving or talking it through.",
      "Afterwards, reconnect gently and offer comfort, food, or rest.",
    ],
  },
  {
    id: "shutdown",
    title: "Shutdown Support",
    summary: "Help when they withdraw or become unresponsive.",
    icon: "cloud-outline",
    tint: colors.sky[600],
    bg: "bg-sky-100",
    steps: [
      "Recognise withdrawal as overwhelm, not defiance.",
      "Remove pressure — pause demands and expectations.",
      "Sit nearby quietly; presence without pressure is reassuring.",
      "Offer a low-demand comfort (a blanket, a favourite object).",
      "Let them re-emerge at their own pace.",
    ],
  },
  {
    id: "burnout",
    title: "Burnout Prevention",
    summary: "Recognise and prevent autistic burnout.",
    icon: "battery-half-outline",
    tint: colors.amber[600],
    bg: "bg-amber-100",
    steps: [
      "Watch for rising signs: more meltdowns, less speech, exhaustion.",
      "Reduce the overall load — fewer activities, more downtime.",
      "Protect time for special interests and genuine rest.",
      "Lower demands at home and, where possible, at school.",
      "Prioritise sleep, food, and predictable routines.",
    ],
  },
  {
    id: "transition",
    title: "Transition Strategies",
    summary: "Make changes and transitions easier.",
    icon: "swap-horizontal-outline",
    tint: colors.emerald[600],
    bg: "bg-emerald-100",
    steps: [
      "Give advance warning — countdowns or a visual timer.",
      "Use visual schedules so what's next is predictable.",
      "Build in a transition object or ritual to bridge activities.",
      "Keep transitions consistent day to day.",
      "Allow extra time; rushing increases distress.",
    ],
  },
  {
    id: "hyperactivity",
    title: "Hyperactivity Support",
    summary: "Channel and support high energy.",
    icon: "flash-outline",
    tint: colors.violet[700],
    bg: "bg-violet-100",
    steps: [
      "Plan regular movement breaks before energy peaks.",
      "Offer heavy-work or proprioceptive activities (pushing, carrying).",
      "Break tasks into short, active chunks.",
      "Reduce wait times, which are hard during high energy.",
      "Use clear, simple, one-step instructions.",
    ],
  },
];
