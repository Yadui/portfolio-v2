# Design System

## Intent

The portfolio should now be designed from the language already established by the hero and Projects sections: bright, editorial, technical, and motion-aware. This system shifts the site away from the older dark-neon default and toward a lighter paper stage with sharper ink contrast, restrained neon accenting, and premium depth.

## Source of Truth

The visual direction is anchored to:

- `components/Header.jsx`
- `components/Projects.jsx`
- shared tokens and primitives in `app/globals.css`

Future sections should inherit this system unless they have a deliberate product reason to break it.

## Brand Principles

- Editorial: large typographic statements, strong whitespace, outcome-first hierarchy
- Technical: mono body rhythm, exact spacing, visible structure, clean rules and dividers
- Premium motion: smooth interpolation, low-friction reveals, no noisy animation loops
- Contrast with warmth: charcoal ink, paper surfaces, acid-green highlights, sunrise amber warmth

## Core Palette

| Token | Value | Purpose |
| --- | --- | --- |
| Paper | `#f5f1e8` | Primary light section background |
| Paper elevated | `rgba(255, 252, 246, 0.88)` | Glass-like section shells |
| Paper solid | `#fffdf8` | Card tops and high-emphasis surfaces |
| Ink | `#101828` | Primary text and hard contrast |
| Ink soft | `#536074` | Body copy and support text |
| Ink faint | `#8892a4` | Labels, metadata, rails |
| Line | `rgba(16, 24, 40, 0.1)` | Standard borders and dividers |
| Line strong | `rgba(16, 24, 40, 0.16)` | Hover state borders |
| Accent | `#00ff99` | Primary interaction, active state, motion line |
| Accent soft | `rgba(0, 255, 153, 0.14)` | Low-emphasis highlight fill |
| Sunrise | `#ffbf73` | Secondary warmth, spotlight, award emphasis |
| Sunrise soft | `rgba(255, 191, 115, 0.18)` | Ambient glow and warm backgrounds |
| Steel | `#cad4e3` | Neutral cool accent for quieter highlights |

## Typography

| Role | Guidance |
| --- | --- |
| Primary body | `JetBrains Mono` remains the default for UI and body text |
| Display titles | Use bold mono with tight tracking before reaching for decorative fonts |
| Decorative fonts | `Electroharmonix` and `Qubiko` are accent tools, not section defaults |
| Labels | Uppercase, wide tracking, small size, muted ink |

## Layout Rules

- Build sections as editorial compositions, not generic centered blocks.
- Prefer asymmetry between copy panels and card grids.
- Use rounded shells and cards to create layered depth on light surfaces.
- Keep a clear section intro zone before the primary proof surface.

## Motion Rules

- Motion should feel guided and continuous, not pulsing or ornamental.
- Use motion to reveal hierarchy, connect surfaces, and soften transitions between states.
- Favor `expo.out`, `power3.out`, and custom cubic curves over abrupt springs on premium surfaces.
- Dense reading sections should have restrained hover motion and minimal perpetual animation.

## Reusable Primitives

Defined in `app/globals.css`:

- `.portfolio-section`
- `.portfolio-paper-stage`
- `.portfolio-shell`
- `.portfolio-card`
- `.portfolio-kicker`
- `.portfolio-title`
- `.portfolio-body`
- `.portfolio-chip`
- `.portfolio-meta-label`
- `.portfolio-metric`

These classes are the starting point for the rest of the site. New sections should compose from them before introducing new one-off treatments.

## Section Blueprint

Each major section should follow this structure:

1. Eyebrow or kicker
2. Large title with strong contrast
3. One concise support paragraph
4. Proof surface: cards, timeline, graph, form, or case-study canvas
5. Metadata or supporting rails if needed

## Component Guidance

- Hero: keep the white-pill reveal, sunrise transfer, and ring typography as signature moments
- Projects: keep the horizontal case-study gallery as the benchmark for premium interaction
- Achievements: use paper-stage surfaces, structured metadata, and restrained warm accents
- Contact, Work, Services: migrate old dark card patterns toward shells, paper stages, and editorial spacing

## Adoption Plan

- Convert remaining dark utility sections to light paper stages where they sit beside hero/projects content
- Reuse portfolio cards and chips before creating new card systems
- Standardize headings and metadata styling across work, services, contact, and modal surfaces
- Keep accent green rare enough to preserve meaning