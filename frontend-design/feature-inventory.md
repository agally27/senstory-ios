# Senstory — Feature Inventory

Every screen/feature observed in the 31 May 2026 prototype recording, with
current status in the senstory4 iOS app. Use this to decide what to build next.

Legend: ✅ built · 🟡 partial · ⬜ not yet

---

## 1. Home / Daily  — 🟡
- ✅ Child photo (tap to change)
- ✅ Wellbeing logger: Regulation / Sleep / Mood (10-dot rows)
- ✅ Status summary sentence + update button
- ✅ Quick-link grid
- ⬜ Wellbeing **trend line chart**
- ⬜ Today's tasks / progress bar
- ⬜ "Today's tip" + parent insight cards
- ⬜ Header utility buttons (calm waves, profile)

## 2. Track  — 🟡
- ✅ Event logging form
- ✅ Entry list
- ⬜ **Quick tags / chips** on entries (off school, screen time, calm day…)
- ⬜ **Regulation status badge** per entry (Regulated / Dysregulated)
- ⬜ **Calendar month view** with per-day indicators
- ⬜ Section pills (Daily Log / All Entries / Calendar)

## 3. Insights  — 🟡
- ✅ Insight cards with confirm/reject review
- ⬜ "Triggers and What Helps" — colour-coded trigger vs strategy cards
- ⬜ "Monthly Summary" — top triggers + most effective strategies, month picker
- ⬜ **Charts** (line trend, donut breakdown, bar comparison)

## 4. Support  — 🟡
- ✅ Account / children / sign out
- ⬜ **Strategies library**: Meltdown, Shutdown, Burnout Prevention, Transition,
  Hyperactivity support (icon cards + descriptions)
- ⬜ Videos tab
- ⬜ Knowledge Base / Support Hub articles
- ⬜ About Us

## 5. Stories (Social Stories)  — ⬜
- ⬜ Tab in bottom nav (currently 4 tabs; prototype has 5)
- ⬜ Your Stories / Favourites tabs
- ⬜ Storyteller voice selector
- ⬜ Story cards with AI illustrations, Read button, favourite star
- ⬜ Story builder: style (Text Focused / Balanced / Image Heavy), display
  (Page by Page / Single Scroll), length (Short 4 / Medium 7 / Long 10 pages),
  language level, perspective, tone
- ⬜ Generated illustrated story pages (day-labelled, engagement tags)
  - Note: AI text + illustrations are server-side; needs an API + (for images)
    a billing-enabled image model.

## 6. Visual Symbols  — ⬜
- ⬜ Symbols / emotions / schedules
- ⬜ Create Symbol, Add Emotion, Print
- ⬜ Search + style filters (Basic, Classic, Soft, Pastel, Bold, Hand Drawn,
  Watercolour, Line, Sensory)
- ⬜ Symbol/emotion grid

## 7. Profile / Child Profile  — 🟡
- ✅ Add child (name, DOB, photo)
- ⬜ Full profile fields (about me, strengths, communication, sensory needs,
  signs of distress, what helps, what to avoid, school notes, emergency plan)
  — schema columns already exist
- ⬜ Parent profile screen

## 8. Emotion Check-in  — ✅
- ✅ 8-emotion gradient picker

---

## Suggested build order (highest value first)
1. **Stories tab + Visual Symbols** — the two whole features missing from nav;
   biggest gap vs prototype.
2. **Track upgrades** — quick tags, status badges, calendar view.
3. **Insights charts** — line/donut/bar to match the prototype's analytics feel.
4. **Support strategies library** — static content, quick win.
5. **Home enrichment** — trend chart, tips, tasks.
6. **Full child profile** — fields already in the schema.
