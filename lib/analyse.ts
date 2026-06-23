import type { DailyCheckIn, ObservationEvent } from "@/lib/types";

export interface InsightDraft {
  claim: string;
  confidence: number;
  suggested_action: string;
  safety_caveat: string;
  data_limitations: string;
}

const CAVEAT = "This is a gentle observation, not a clinical finding.";

// On-device pattern analysis over logged data. Produces supportive,
// non-clinical insight drafts. (A server-side AI analyser can replace this;
// the output shape matches the insights table.)
export function analyse(
  checkIns: DailyCheckIn[],
  events: ObservationEvent[]
): InsightDraft[] {
  const drafts: InsightDraft[] = [];
  const limited = checkIns.length < 5 && events.length < 5;

  // 1. Regulation trend
  if (checkIns.length >= 4) {
    const regs = checkIns.map((c) => c.regulation ?? 0).filter(Boolean);
    const half = Math.floor(regs.length / 2);
    const early = avg(regs.slice(0, half));
    const late = avg(regs.slice(half));
    const diff = late - early;
    if (Math.abs(diff) >= 0.8) {
      drafts.push({
        claim:
          diff > 0
            ? "Regulation has been trending upward over recent check-ins."
            : "Regulation has dipped a little over recent check-ins.",
        confidence: Math.min(0.4 + Math.abs(diff) / 10, 0.85),
        suggested_action:
          diff > 0
            ? "Whatever you've been doing seems to be helping — keep it steady."
            : "It may be worth easing demands and protecting rest and routine this week.",
        safety_caveat: CAVEAT,
        data_limitations: `Based on ${checkIns.length} daily check-ins.`,
      });
    }
  }

  // 2. Common trigger tag on dysregulated events
  const dysreg = events.filter((e) => (e.regulation_after ?? 5) <= 2);
  const tagCounts: Record<string, number> = {};
  dysreg.forEach((e) => e.quick_tags?.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
  const topTrigger = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
  if (topTrigger && topTrigger[1] >= 2) {
    drafts.push({
      claim: `"${topTrigger[0]}" shows up around several harder moments.`,
      confidence: Math.min(0.4 + topTrigger[1] / 10, 0.8),
      suggested_action: `When "${topTrigger[0]}" is coming up, extra warning and support may help soften it.`,
      safety_caveat: CAVEAT,
      data_limitations: `Seen in ${topTrigger[1]} logged events.`,
    });
  }

  // 3. Sleep ↔ regulation link
  const paired = checkIns.filter((c) => c.sleep != null && c.regulation != null);
  if (paired.length >= 5) {
    const lowSleep = paired.filter((c) => (c.sleep ?? 0) <= 4);
    if (lowSleep.length >= 2) {
      const lowSleepReg = avg(lowSleep.map((c) => c.regulation ?? 0));
      const overallReg = avg(paired.map((c) => c.regulation ?? 0));
      if (overallReg - lowSleepReg >= 1) {
        drafts.push({
          claim: "On nights with poorer sleep, the next day's regulation tends to be lower.",
          confidence: 0.7,
          suggested_action: "Protecting sleep and a calm bedtime routine may pay off the following day.",
          safety_caveat: CAVEAT,
          data_limitations: `Based on ${paired.length} check-ins.`,
        });
      }
    }
  }

  // 4. Calm-moment context
  const calm = events.filter((e) => e.type === "calm_moment");
  const calmTags: Record<string, number> = {};
  calm.forEach((e) => e.quick_tags?.forEach((t) => { calmTags[t] = (calmTags[t] ?? 0) + 1; }));
  const topCalm = Object.entries(calmTags).sort((a, b) => b[1] - a[1])[0];
  if (topCalm && topCalm[1] >= 2) {
    drafts.push({
      claim: `Calm moments often involve "${topCalm[0]}".`,
      confidence: Math.min(0.4 + topCalm[1] / 10, 0.8),
      suggested_action: `Leaning into "${topCalm[0]}" could be a reliable way to help regulation.`,
      safety_caveat: CAVEAT,
      data_limitations: `Seen in ${topCalm[1]} calm moments.`,
    });
  }

  if (drafts.length === 0) {
    drafts.push({
      claim: limited
        ? "There isn't quite enough data yet to spot clear patterns."
        : "No strong patterns stand out right now — that's okay.",
      confidence: 0.3,
      suggested_action: "Keep logging wellbeing and events. Patterns usually emerge over a week or two.",
      safety_caveat: CAVEAT,
      data_limitations: `Based on ${checkIns.length} check-ins and ${events.length} events.`,
    });
  }

  return drafts;
}

function avg(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
