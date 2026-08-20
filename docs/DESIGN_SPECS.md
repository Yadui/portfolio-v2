# Portfolio Design Specs
> Generated from impeccable · emil-design-eng · web-design-guidelines · design-taste-frontend · redesign-existing-projects
> Last updated: 2025-06

---

## Design identity

**Register:** Brand (design IS the product — portfolio = the work itself)  
**Theme:** Dark, intentional. Black stage, `#00ff99` accent, white type.  
**Motion personality:** Crisp and precise. Fast ease-out for UI, slow ease-in-out for reveals. No bounce. No elastic.  
**Core tension to maintain:** Technical credibility vs. creative craft. Every section must show both.

---

## Token reference

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#00ff99` | Primary interactive / highlight |
| `--accent-soft` | `rgba(0,255,153,0.07)` | Glow, radial bg |
| `--surface` | `#0b0b0f` | Cards |
| `--border` | `rgba(255,255,255,0.15)` | All card borders |
| `--text-dim` | `rgba(255,255,255,0.4)` | Kickers, meta |
| `--text-muted` | `rgba(255,255,255,0.3)` | Secondary labels |
| `--red` | `#ff2d2d` | Timeline path |
| `--ease-out` | `cubic-bezier(0.23,1,0.32,1)` | All entrance/hover |
| `--ease-in-out` | `cubic-bezier(0.77,0,0.175,1)` | On-screen movement |

---

## Section specs

---

### INTRO / HERO

**Current state:** Strong. Headline with rotating icon slots, shimmer on "AI systems", radial glow, CTA arrow button.  
**What's missing:** Zero background texture. The black stage is empty — no depth cue, no visual anchor for the corners.

#### Micrographic spec

Goal: subtle corner presence that doesn't compete with the headline. Visible on a second look, not the first.

```
Pattern:    SVG — sparse dot grid, NOT the full topology (too busy)
Color:      #00ff99
Opacity:    0.06 on dots, 0.04 on lines (if any)
Density:    120px cell spacing — one dot per 120×120px area
Mask:       radial — transparent at center (48% radius), opaque toward all four corners
            gradient: black 0% → black 40% → transparent 100% on the center punch-out
Position:   absolute inset-0, pointer-events-none, overflow-hidden
```

**Why 120px not 80px:** 80px was used before and was too dense — competed with the headline. 120px gives ~6×5 dots on a 1440px viewport — sparse enough to read as texture, not pattern.

**Why dots only, no lines:** The topology SVG (dots + connecting lines) was too visually active. Dots alone read as a field; dots + lines read as a diagram. A field is background; a diagram is foreground.

#### CTA button improvement

Current: `border-white/20` circle with `↗` arrow. Hover: `border-[#00ff99]` + bg tint.  
Missing: the arrow itself doesn't animate — it just changes color.

Spec:
- On hover: `transform: rotate(45deg)` on the arrow glyph (already exists via `group-hover:rotate-45` ✓)
- Add: `transition: transform 180ms cubic-bezier(0.23,1,0.32,1)` explicit (currently relies on Tailwind default)
- Add: a hair-thin underline draw on "Let's work together" text — `::after` pseudo or a `<span>` with `scaleX 0→1` on hover

#### Entrance animation audit

- Kicker (`Abhinav Yadav — Cloud & AI Engineer`) has no entrance — appears with the container fade. **Spec:** stagger 80ms behind headline, fade-up `y: 8 → 0`.
- Sub-line + CTA already has `opacity 0.7s ease 0.5s` delay — acceptable.
- **Issue:** `opacity 0 → opacity 1` without `transform` feels flat. Add `translateY(16px → 0)` to the sub-line block.

---

### WORK / PROJECTS

**Current state:** Flowing menu list with ledger rules, `WORK` heading + project count metadata top-right. Grid background removed (good).  
**What's missing:** The `WORK` heading has no visual weight relative to the list. The metadata labels (`19 projects / 2022–2025`) are `text-white/25` — nearly invisible.

#### Spec: heading weight

- Raise metadata label opacity from `text-white/25` to `text-white/40`
- Add a `1px` horizontal rule between the heading row and the list — `border-b border-white/10` on the heading wrapper — separates header from content without adding visual noise

#### Spec: ledger rules

Current ledger: `backgroundSize: 100% 72px` — one horizontal line every 72px.  
Issue: 72px doesn't align to the actual row height of the ProjectListMenu items, so lines cut through content randomly.

**Spec:** Read the actual rendered row height from `ProjectListMenu` and sync — or replace with `border-b border-white/[0.04]` on each row item directly (more reliable than a background pattern).

#### Spec: hover state depth

The ProjectListMenu already handles hover. No changes needed beyond confirming the image preview (if any) has a `will-change: transform` on its container to prevent jank.

---

### ACHIEVEMENTS

**Current state:** Floating parallax cards on desktop, stacked on mobile. Radial SVG emblem behind center title. Achievement cards have colored top border using `item.accent`.  

**What's missing:**
1. The radial emblem renders correctly but is identical in weight to the title — they compete. The emblem needs to be clearly behind.
2. Card content hierarchy is weak — `type — year` kicker, title, summary, and rank are the same visual weight tier.

#### Spec: emblem z-index

- Emblem SVG: `z-index: 0`, title wrapper: `z-index: 10` (already `relative z-10` — verify this is actually above the SVG)
- Emblem opacity: currently `0.055` — raise to `0.07` so it's visible without competing

#### Spec: card hierarchy

| Element | Current | Spec |
|---|---|---|
| `type — year` kicker | `text-[0.6rem] text-white/35` | Keep — it's correctly dim |
| Title | `text-base font-light text-white` | Raise to `font-normal` — light weight makes it merge with body |
| Summary | `text-[0.7rem] text-white/45` | Keep |
| Rank | `text-lg font-light` | Raise to `font-normal` + `tracking-tight` |
| Organization | `text-[0.62rem] text-white/35` | Keep |

#### Spec: card entrance (mobile)

Cards on mobile fade up independently. Missing: the colored top border should also "draw in" — start at `width: 0` and expand to full width over `400ms` as the card enters view. Achievable with a `::before` pseudo or a `<div>` with `scaleX` transform origin left.

---

### TIMELINE / JOURNEY

**Current state:** Work cards have `3px #ff2d2d` left border, education cards have faint white. Mobile has a vertical connecting line with dot nodes.  

**What's missing:**
1. Desktop floating cards — the `Floating` parallax component applies uniform depth to all cards. Work entries should be `depth: 1.2–1.6` (closer), education `depth: 0.6–0.8` (further back), reinforcing the visual hierarchy.
2. The journey text ("Three roles and a degree...") is `text-white/50` — barely legible at small size.
3. No entrance animation on the connecting line — it appears instantly.

#### Spec: desktop depth hierarchy

```js
// Work entries — closer depth
{ depth: 1.4, style: { translate: "-520px -270px" } }
{ depth: 1.6, style: { translate:  "260px -250px" } }

// Education/other entries — further depth
{ depth: 0.6, style: { translate: "-510px  120px" } }
{ depth: 0.8, style: { translate:  "270px  120px" } }
```

Assign work entries (`item.slug` is truthy) to the higher-depth slots.

#### Spec: connecting line entrance (mobile)

The vertical line should draw from top to bottom as the mobile section scrolls into view:
- `scaleY: 0 → 1` with `transform-origin: top`
- Duration: `600ms`, delay `100ms` after section enters view
- Easing: `cubic-bezier(0.23,1,0.32,1)`

#### Spec: body text contrast

Journey description: raise from `text-white/50` → `text-white/60`. Contrast ratio at 50% white on black is ~3.8:1 — below the 4.5:1 WCAG AA requirement for body text.

---

### SKILLS

**Desktop:** Gas simulation with weighted node sizes, group-color borders. Nodes drift and bounce. Original fade+blur entrance. ✓  
**Mobile:** 2-column cluster grid with hub+satellite wheel layout, skill name labels, animated entrance.

**What's missing (desktop):**
1. Skill name tooltip appears only on hover — fine for desktop, but the tooltip `bg-slate-800` is off-brand (should be `bg-[#0b0b0f] border border-white/15`).
2. Node label on hover has no entrance animation — appears instantly. Should fade in over `120ms`.

#### Spec: tooltip style

```jsx
// Current
"bg-slate-800 px-2 py-1"

// Spec
"bg-[#0b0b0f] border border-white/15 px-2 py-1 backdrop-blur-sm"
// + transition: opacity 120ms ease-out (add to className)
```

**What's missing (mobile clusters):**
1. Hub glow (`box-shadow: 0 0 0 3px {color}22`) — the `22` hex is ~13% — may not read on dark bg. Test: if invisible, raise to `33` (~20%).
2. The 5th cluster ("Dev & Design") reuses `typescript` and `docker` from other clusters — nodes appear in two different clusters simultaneously. This is confusing.

#### Spec: fix duplicate nodes in Dev & Design cluster

Replace duplicates with unique tools. Updated cluster:
```js
{
  label: "Dev & Design",
  color: "#F24E1E",
  hub:   byId("figma"),           // Figma as hub — it's the design tool
  inner: [byId("github"), byId("vscode"), byId("notion")],
  outer: [byId("grafana"), byId("powerbi")],
}
```

---

### CONTACT

**Current state:** `TALK` watermark, draw-in send button underline, contact links grid.  

**What's missing:**
1. Form inputs have no focus state beyond the default browser outline — `outline: none` is set with nothing replacing it.
2. The `TALK` watermark uses `font-heading font-light` — the light weight makes it nearly disappear at `opacity: 0.028`. Either raise opacity to `0.04` or use `font-normal`.
3. No visual connection between the contact links section and the form — they feel like two separate components dropped on the same page.

#### Spec: input focus state

```jsx
// Current — no visible focus
"border-b border-white/20 pb-2"

// Spec — accent underline on focus
"border-b border-white/20 pb-2 transition-colors duration-200 focus-within:border-[#00ff99]/60"
```

#### Spec: TALK watermark

Raise `opacity` from `0.028` → `0.04`. At `font-light` the strokes are thin; `0.04` keeps it subliminal while being visible.

#### Spec: section connector

Add a thin `1px` horizontal rule between the contact links and the form divider — `border-t border-white/8` — makes the two sub-sections feel intentionally separated rather than accidentally stacked.

---

## Motion system summary

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Section entrance (fade+translate) | `550ms` | `cubic-bezier(0.22,1,0.36,1)` | Current — keep |
| Hover (border/color change) | `200–300ms` | `ease` | Current — keep |
| CTA arrow rotate | `180ms` | `cubic-bezier(0.23,1,0.32,1)` | Add explicit |
| Card top-border draw | `400ms` | `cubic-bezier(0.23,1,0.32,1)` | New — Achievements |
| Timeline line draw | `600ms` | `cubic-bezier(0.23,1,0.32,1)` | New — Timeline mobile |
| Tooltip fade-in | `120ms` | `ease-out` | New — Skills desktop |
| Preloader word entrance | `280ms` | `cubic-bezier(0.22,1,0.36,1)` | Current ✓ |
| Send button underline | `300ms` | `ease` | Current ✓ |

**Rules enforced from emil-design-eng:**
- No animation on keyboard-triggered actions
- No `ease-in` on any UI element
- No `scale(0)` — minimum `scale(0.92)` on entrance
- All durations under `300ms` except reveals and line draws
- `prefers-reduced-motion` — every animated element has a fallback

---

## Micrographics placement plan

| Section | Element | Spec |
|---|---|---|
| **Intro** | Dot field, corners only | `120px` grid, `#00ff99 @ 6%`, radial mask hides center |
| **Achievements** | Radial emblem behind title | 12-spoke, `opacity: 0.07` — already implemented |
| **Contact** | `TALK` watermark | Already implemented — raise opacity to `0.04` |

**Explicitly excluded:** Projects (ledger rules already do the texture job), Timeline (the red path line is the visual texture), Skills desktop (the drifting nodes are the texture).

---

## What to build next (priority order)

1. **Intro dot-field micrographic** — highest visual impact, cleanest implementation
2. **Input focus states** (Contact) — accessibility requirement, not just aesthetics  
3. **Achievements card border draw animation** — high craft signal, small scope
4. **Timeline connecting line draw animation** (mobile) — completes the timeline narrative
5. **Skills duplicate node fix** (Dev & Design cluster) — correctness issue
6. **Tooltip style update** (Skills desktop) — polish, 2-line change
7. **Timeline depth hierarchy** (desktop) — requires reading `workDetails` slugs at render time
