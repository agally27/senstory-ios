# Senstory — Design Specification

Derived from the screen recording of the live prototype (`base44.app`),
captured 31 May 2026. This is the visual reference for the senstory4 iOS app.

---

## Brand

- **Wordmark:** "Senstory" in emerald/teal, rounded friendly type, with a small
  multi-colour gradient squircle logo icon to its left.
- **Tagline:** "autism support for parents" — small, emerald-green, under the wordmark.
- **Voice:** warm, calm, supportive, non-clinical.

## Colour system

| Role | Colour | Usage |
|------|--------|-------|
| Primary | Emerald / teal | Brand, primary actions, "regulated" states |
| Regulation metric | Green | Wellbeing dot row 1 |
| Sleep metric | Soft blue | Wellbeing dot row 2 |
| Mood metric | Amber / yellow | Wellbeing dot row 3 |
| Trigger / warning | Orange–red | Trigger cards (left border), "Dysregulated" badge |
| Strategy / positive | Green | "What helps" cards (left border), "Regulated" badge |
| Insights accent | Purple / violet | Insights tab active, AI sections |
| Stories accent | Blue | Stories tab active |
| Background | Very light blue→emerald wash | Whole-app gradient, subtle waves at bottom |
| Surface | White / 80% white | Cards |
| Text | Slate-800 (headings), slate-500/600 (body/muted) | — |

## Typography

- Rounded, friendly, approachable (implemented as **Varela Round** headings +
  **Nunito Sans** body).

## Components

- **Header bar:** translucent white; logo + tagline left; two circular icon
  buttons right (calm "waves" icon, profile/person icon).
- **Cards:** white, ~24px radius, soft shadow, generous padding.
- **Primary button:** soft pill — tinted fill (e.g. emerald-100) with darker
  text (emerald-800). e.g. "Update wellbeing for today".
- **Wellbeing logger:** status sentence ("Feeling calm and regulated") above
  three 10-dot rows (Regulation green / Sleep blue / Mood amber).
- **Status badges:** rounded pills — green "Mostly Regulated", orange/red
  "Dysregulated".
- **Tag chips:** small light rounded pills for quick tags (off school, screen
  time, constipated, calm day, attention seeking…).
- **Colour-coded list cards:** numbered, with a coloured left border — orange =
  trigger, green = strategy that helped.
- **Charts:** line (wellbeing trends), donut/pie, and bar (Insights).
- **Bottom tab bar:** floating, rounded, translucent. **5 tabs** — Home, Track,
  Insights, Support, Stories. Active tab is a **filled pill** (coloured
  background + white icon & label).

## Motion

- Gentle spring scale on tap (cards/buttons), soft fades, success animations.
