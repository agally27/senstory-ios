# Senstory — Screen Inventory & Build Plan

Frame-by-frame audit of the prototype, mapped to the production iOS build.
Source of truth: the 31 May 2026 recording + `design-spec.md`.

## Design system (foundation — build first)
- **WaveBackground** — light blue→white gradient + layered decorative waves.
- **Card** — 24pt radius, elevated soft shadow, generous padding.
- **GradientButton** — full-width pill, gradient fill, press feedback.
- **SectionHeader** — large friendly headline + soft-grey subtitle.
- **Pill / Chip** — rounded tag/segment control.
- **ProgressRing** — animated circular percentage (analysis flow).
- **StatTile / MetricRow** — key metrics.
- **Typography scale** — Varela Round headings, Nunito Sans body.

## Flows

### Onboarding  (new)
- Intro screen with illustration + wordmark + tagline.
- 3 educational cards (track / understand / support), swipeable, progress dots.
- Gradient CTA "Get started" → sign up.
- Wave backgrounds throughout.

### Child Profile flow
- Child selection (pills/avatars) where multiple.
- Add child: name, DOB, **add photo** with upload interaction.
- Rich profile fields (about, strengths, sensory, what helps…).

### Analysis flow  (maps to AI insight generation)
- Trigger from Insights ("Analyse patterns").
- Upload/empty state → **processing state** with animated progress ring,
  sequential stage messages, then completion.
- Generates insights from logged data (on-device heuristic for now).

### Results flow
- Summary screen, insight cards, recommendation cards.
- Development metrics, status indicators, progress visualisations.

### Home Dashboard
- Header: wordmark + tagline + utility icons.
- Personalised greeting + date.
- Child profile summary (photo, name, status).
- Wellbeing dials + trend graph.
- Key metrics, recommendations, recent activity, educational resources.

## Build phases
1. **Design system + Home dashboard** ← current
2. **Onboarding flow**
3. **Analysis + Results flow**
4. **Child profile flow polish**
