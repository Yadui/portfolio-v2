## Change History

### 2026-08-04
#### [FEAT] Add always-on Taste Skill integration for portfolio design
- **Template/File:** `AGENTS.md`, agent adapter files, `docs/PORTFOLIO_TASTE_STANDARD.md`, and `vendor/taste-skill/*`
- **Record:** `e988add20dab0fa97d7a76781c48961c8184288e`
- **What changed:** Vendored the complete tracked Taste Skill snapshot and added repository-local instructions for common coding agents and models.
- **Before:** Taste Skill was not available as a repository-local source or always-on instruction.
- **After:** Public portfolio design tasks use the Portfolio adapter, upstream references, explicit design dials, audit-first redesign guidance, and a required pre-flight checklist.
- **Why:** Keep future portfolio design work consistently intentional, accessible, responsive, and resistant to generic AI UI patterns.
- **Fix/Notes:** Existing Portfolio tokens, routes, dependencies, and functionality remain the source of truth. The upstream snapshot is preserved unchanged under `vendor/taste-skill/`.

### 2026-08-05
#### [FIX] Remove blocking home loader and split the hero
- **Template/File:** `components/HomeClient.jsx`, `components/SiteHeader.jsx`, `components/Intro.jsx`, and `app/globals.css`
- **Record:** `home-hero-loader-split`
- **What changed:** Removed the full-screen greeting preloader from the homepage lifecycle, revealed the header immediately, removed the Delhi map from the hero, and changed the hero to an image-over-paper split composition.
- **Before:** A timer-driven greeting sequence blocked scroll and delayed the first useful view for roughly three seconds. The hero used the Delhi map as its main visual field.
- **After:** The homepage renders directly into the hero. The hero uses the existing local fractal asset in an upper visual half and the current hero message on a solid paper lower half. Existing routes and hero copy remain intact.
- **Why:** The portfolio has no data-loading reason to delay access, and the visual reference calls for a clear split composition with the message grounded in a solid lower stage.
- **Fix/Notes:** The old `Preloader.jsx` file and Delhi map assets remain untouched for reversibility and other possible uses. The home intro context is complete immediately so project content does not wait behind a curtain.

### 2026-08-05
#### [FIX] Use the supplied hero image at viewport height
- **Template/File:** `app/globals.css` and `public/assets/backgrounds/portolio-hero-image*`
- **Record:** `hero-image-viewport-split`
- **What changed:** Replaced the textured abstract fallback and gradient overlays with the supplied `portolio-hero-image` asset. Added a rotated landscape derivative for desktop and retained the original portrait crop for mobile. The hero now uses exactly the available viewport below the fixed header, split into equal visual and copy halves.
- **Before:** The hero used a generated derivative with color overlays and could grow taller than the first viewport because the copy determined its height.
- **After:** The supplied image is used without vertical blur lines or overlay treatment. Desktop uses the rotated image to fill its half; mobile uses the original portrait image. The split is constrained to `calc(100dvh - var(--site-header-h))`.
- **Why:** Match the supplied reference more faithfully and make the first view feel immediate and composed.
- **Fix/Notes:** The existing `hero-abstract.webp` remains in the repository but is no longer referenced by the hero.

### 2026-08-05
#### [FEAT] Left-align hero typography and add diagonal technology marquee
- **Template/File:** `components/Intro.jsx`, `app/globals.css`, `app/layout.tsx`, and `public/fonts/Fluctuation-Lt.otf`
- **Record:** `hero-typography-logo-marquee`
- **What changed:** Replaced the rotating hero icon slots with one consistent Fluctuation type treatment, moved the hero copy and CTA to a left-aligned stack, and added a diagonal two-rail technology logo marquee with faded edges in the paper half.
- **Before:** Hero words used multiple decorative font treatments and rotating technology icons inline with the headline. The paper half had no separate technology proof surface.
- **After:** The hero message uses one display family, reads as clear left-aligned lines, and the technology marks move independently below the copy. The marquee uses transform-only CSS motion and becomes static for reduced-motion users.
- **Why:** Improve readability and hierarchy while retaining a visual expression of the engineering toolset without making the headline wait on or compete with rotating logos.
- **Fix/Notes:** The supplied `fluctuation.zip` contained the Fluctuation font files and its EULA; the font is self-hosted through `next/font/local`. Logo marks remain local package icons, with no new runtime dependency or external image request.

### 2026-08-05
#### [FIX] Move technology marquee beside hero copy
- **Template/File:** `app/globals.css` and `components/Intro.jsx`
- **Record:** `hero-side-marquee`
- **What changed:** Reduced the desktop hero text scale and left inset, changed the paper half to a two-column layout, and moved the diagonal logo marquee into the right column. Mobile keeps the marquee below the text as the explicit fallback.
- **Before:** The lower paper half stacked the large text and marquee vertically.
- **After:** Desktop presents a quieter left copy column and a separate right-side diagonal technology field, while the hero retains its fixed viewport height and edge fades.
- **Why:** Improve scanability and give the technology proof its own visual zone without competing with the headline.
- **Fix/Notes:** No route, copy, font, or reduced-motion contracts changed.

### 2026-08-05
#### [FIX] Make the side marquee icon-only and same-direction
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-icon-marquee`
- **What changed:** Removed logo labels, tilted every icon tile consistently, and made both diagonal rows travel in the same direction with different durations.
- **Before:** The marquee displayed icon and text pairs, with the second row moving in reverse.
- **After:** The right-side marquee is an icon-only field with consistent negative tilt, faded horizontal edges, and two same-direction speeds. Reduced-motion users see a static tilted arrangement.
- **Why:** Match the provided visual reference more closely and keep the technology field graphic rather than typographic.
- **Fix/Notes:** The implementation remains transform-only CSS motion and preserves the mobile stacked fallback.

### 2026-08-05
#### [FIX] Speed up and normalize icon marquee motion
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-icon-marquee-fast-ltr`
- **What changed:** Set both diagonal icon rows to the same fast `18s` duration, changed both tracks to travel left-to-right, removed the green marquee tint, and increased the icon sizes.
- **Before:** The rows used different durations and moved leftward, with a subtle green background wash.
- **After:** Both rows move left-to-right at the same speed over the neutral paper surface, with larger consistently tilted icons and the existing edge fade.
- **Why:** Match the requested motion direction and make the technology field more legible and graphic.
- **Fix/Notes:** Reduced-motion behavior remains static and no page layout or route contracts changed.

### 2026-08-05
#### [FEAT] Expand technology marquee coverage
- **Template/File:** `components/Intro.jsx`
- **Record:** `hero-icon-marquee-technology-coverage`
- **What changed:** Added Microsoft Foundry, Copilot, Copilot Studio, Azure AI, Azure Bot Service, Power Automate, Azure Functions, SQL Server, VS Code, LangChain, and n8n to the repeated icon sequence.
- **Before:** The marquee covered 12 core tools and platforms.
- **After:** The marquee contains 23 technology marks, duplicated for a seamless infinite loop with the existing same-speed left-to-right motion.
- **Why:** Better represent the portfolio's AI, Azure, automation, developer tooling, and data stack.
- **Fix/Notes:** Reused existing `react-icons/si` dependencies; no new package or external asset request was added.

### 2026-08-05
#### [FIX] Split marquee into colorful unique technology rows
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-icon-marquee-unique-colorful-rows`
- **What changed:** Split the expanded technology catalog into two non-overlapping row sets, added additional AI, cloud, data, frontend, automation, and observability marks, applied each brand color, and slowed both infinite tracks to the same `32s` speed.
- **Before:** Both rows used the same full logo catalog, so technologies repeated across rows and icons were muted monochrome.
- **After:** Each row has a unique visible technology set, with 45 total technology marks across the two rows. Each row duplicates its own sequence internally only to make the left-to-right loop seamless.
- **Why:** Improve technology coverage and visual recognition while keeping the marquee infinite and calm enough to read as a considered tool field.
- **Fix/Notes:** Existing tilt, edge fade, responsive collapse, and reduced-motion behavior remain unchanged.

### 2026-08-05
#### [FIX] Straighten and enlarge marquee icons
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-icon-marquee-straight-large`
- **What changed:** Removed the diagonal rail rotation and per-icon tilt, then increased desktop and mobile icon sizing.
- **Before:** Both rows and each icon were rotated for a diagonal treatment.
- **After:** Both rows remain horizontal and all marks sit upright, with larger colorful icons and the same infinite left-to-right motion.
- **Why:** Improve logo recognition and follow the requested clean horizontal treatment.
- **Fix/Notes:** Row separation, edge fading, same-speed animation, reduced-motion fallback, and mobile overflow protection remain in place.

### 2026-08-05
#### [FIX] Give cloud headline and marquee rows explicit separation
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-cloud-line-unique-marquee-rows`
- **What changed:** Wrapped the headline into explicit lines so `Cloud infrastructure.` always starts on its own line, and made the two marquee row partitions explicit through separate slices of the technology catalog.
- **Before:** Cloud could wrap as an independent flex item and the row split was implicit in the shared sequence.
- **After:** The headline has deliberate line grouping, and each marquee row receives a unique technology set while duplicating only within its own row for the infinite loop.
- **Why:** Improve headline rhythm and prevent accidental cross-row logo repetition.
- **Fix/Notes:** The title remains responsive, both marquee rows stay colorful and infinite, and the mobile fallback remains unchanged.

### 2026-08-05
#### [FIX] Make marquee looping seamless
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-icon-marquee-seamless-loop`
- **What changed:** Replaced percentage-offset looping with two explicit identical sequence elements per row. Each track now translates by exactly one sequence width from `-50%` to `0%`.
- **Before:** The duplicated items lived in one flex track with a shared gap, so `50%` did not exactly equal the distance between the two sequence starts and the loop could visibly reset.
- **After:** The second sequence is structurally identical to the first and the reset happens at an identical visual frame, producing a continuous infinite marquee in both rows.
- **Why:** Remove the visible loop break and make the motion genuinely seamless.
- **Fix/Notes:** Row uniqueness, colors, speed, direction, tilt removal, edge fades, and reduced-motion behavior remain intact.

### 2026-08-05
#### [FIX] Keep Microsoft AI marquee unique and evenly spaced
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-ai-marquee-spacing-and-stack`
- **What changed:** Removed non-AI infrastructure and generic data logos such as Kubernetes, SQL Server, TensorFlow, PyTorch, databases, and unrelated frontend tools. Split the marquee into an AI/agent row and a Microsoft stack row, including Foundry, Azure, Copilot, Copilot Studio, Azure AI, Azure Bot Service, Azure DevOps, Power Platform, Microsoft 365, and related services. Added exact per-sequence trailing spacing to the duplicated tracks.
- **Before:** Azure-family marks appeared multiple times, the rows mixed unrelated infrastructure logos, and the loop boundary could change spacing when it restarted.
- **After:** Each row has a focused technology category with no cross-row name overlap. The duplicate sequence includes the same trailing gap as the first, so the `-50%` reset lands on an identical spacing frame.
- **Why:** Keep the marquee relevant to AI agents and the Microsoft ecosystem while eliminating the visible restart jump.
- **Fix/Notes:** Both rows retain colorful marks, same-speed infinite motion, upright icons, faded edges, and reduced-motion behavior.

### 2026-08-05
#### [FIX] Remove repeated Azure marks and focus marquee on AI stacks
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-ai-microsoft-marquee-cleanup`
- **What changed:** Rebuilt the marquee data into two explicit categories: AI/agent tooling and Microsoft ecosystem tooling. Removed Kubernetes, SQL Server, TensorFlow, PyTorch, database, frontend, and unrelated infrastructure marks. Preserved only one named Azure entry and used dedicated local Azure AI, Copilot Studio, and Azure Bot Service assets for those distinct products.
- **Before:** Azure appeared under several repeated generic icon entries, rows mixed unrelated technologies, and hidden duplicate labels made runtime auditing ambiguous.
- **After:** The two rows have no cross-row name overlap, the AI row contains agent/model tooling, and the Microsoft row contains Azure, Foundry, Copilot, Copilot Studio, Azure services, Power Platform, Dynamics, Microsoft 365, and related marks. Each sequence includes its own exact trailing gap for a stable restart.
- **Why:** Make the marquee accurate to the requested AI-agent and Microsoft stack focus and remove repeated Azure confusion.
- **Fix/Notes:** Both rows remain colorful, upright, infinite, same-speed, and responsive. Hidden duplicate sequence labels are no longer rendered for assistive technology.

### 2026-08-05
#### [FEAT] Add marquee technology tooltips and hover slowdown
- **Template/File:** `components/Intro.jsx` and `app/globals.css`
- **Record:** `hero-marquee-tooltips-hover-speed`
- **What changed:** Added a visible technology-name tooltip on icon hover and keyboard focus. Hovering or focusing the marquee slows both tracks from `32s` to `72s` without changing the loop structure.
- **Before:** Icons had no visual name affordance and the marquee kept its default speed during inspection.
- **After:** Each visible icon exposes its name in a compact tag, while hover/focus slows the moving field so the mark can be identified. Touch devices keep the labels hidden to avoid tap-triggered tooltip clutter.
- **Why:** Make the dense technology field understandable and easier to inspect without interrupting the infinite motion.
- **Fix/Notes:** Reduced-motion users still receive a static marquee. Existing row uniqueness, colors, spacing, and overflow protection remain intact.

### 2026-08-17
#### [FEAT] Shader-gradient hero choreography and work-ledger rework
- **Template/File:** `components/Intro.jsx`, `components/hero/HeroGradient.jsx`, `components/Projects.jsx`, `components/work/WorkIndex.jsx`, `app/globals.css`, `.gitignore`, `package.json`
- **Record:** `hero-shadergradient-intro-and-work-ledger`
- **What changed:** Replaced the previous hero (static photo, headline block, and two-row technology marquee) with a ShaderGradient WebGL field and a scripted load sequence: the field holds full-bleed for 1s, "Hello" wipes in from the right at viewport centre, the field then slices down to a slim vertical rule that lands under the cursor (viewport centre if the pointer has not moved), and the name plus role lines rise in the left column. On scroll, the rule recolours to the work orange and scales out from that exact resting position until it fills the viewport, handing off to the Projects section which shares the colour. Rebuilt the work section as a five-project ledger matching the supplied reference: spine at 60.5%, right-aligned titles, numbered chips straddling the spine, category and description copy to the right, and a left meta bracket plus arrow on the active row.
- **Before:** Hero was a photo-backed grid with a headline and an infinite icon marquee; the work section was a black `ProjectListMenu` list of 19 projects with a simple fade-in.
- **After:** Hero is a single choreographed gradient-to-rule sequence; the work section is an orange editorial ledger with hover-driven state.
- **Why:** Requested animation rework — replace the intro, drive a gradient-to-rule-to-fill narrative, and match the reference work layout.
- **Fix/Notes:** Row-separator behaviour is implemented as N+1 independent rules with a lit set of `{active, active+1}`, so the rule shared by two adjacent rows is never re-animated when moving between them; only the outgoing top rule and the incoming bottom rule change. Verified lit sets move `{0,108} -> {108,216} -> {216,324}`. The filled chip and the spine marker slide vertically by exactly one row height via `gsap.quickTo`. Accent is `--work-orange: #cc3a0d`, chosen for 5.03:1 contrast against white so body copy clears WCAG AA. Reduced-motion collapses to the resting state with no shader canvas, no greeting, and no scroll wipe. Mobile (<768px) drops the spine, chip and meta to a single column, keeps descriptions visible, and shows no horizontal overflow. The previous `components/ProjectListMenu.jsx` and `.module.css` are now unreferenced but were left in place rather than deleted. Pre-change copies of the edited files are in the git-ignored `.backup-animations/`.

#### [CONFIG] Add ShaderGradient and pin React 19-compatible three stack
- **Template/File:** `package.json`
- **Record:** `shadergradient-dependency-add`
- **What changed:** Added `@shadergradient/react@2.4.20`, `three@^0.169.0`, and `@react-three/fiber@^9.0.0` (installed with `--legacy-peer-deps`).
- **Before:** No WebGL gradient dependency; `ogl` was the only 3D-adjacent package.
- **After:** The hero shader is dynamically imported so the three/fiber stack stays out of the initial bundle.
- **Why:** Required for the requested ShaderGradient hero background.
- **Fix/Notes:** `@shadergradient/react` externalises `three` and `@react-three/fiber` rather than bundling them, so both must be installed explicitly. `@react-three/fiber@8` was tried first to match the declared `react@18.2.0` but crashed at runtime with `Cannot read properties of undefined (reading 'ReactCurrentOwner')`: Next 16 serves its own vendored React 19.3 canary to the client, so the runtime React is 19 regardless of the declared dependency. fiber 9 is therefore the correct pairing; `--legacy-peer-deps` is needed only because `package.json` still declares React 18. The package's `lazyLoad` default of `true` was disabled — its IntersectionObserver dropped the canvas once the field was clipped to the rule — and the canvas is now unmounted deliberately via an `active` prop when the hero scrolls out.

### 2026-08-17
#### [FEAT] Header pill, cursor-tracked hero rule, and band-clipped work section
- **Template/File:** `components/SiteHeader.jsx`, `components/Intro.jsx`, `components/work/WorkIndex.jsx`, `app/layout.tsx`, `app/page.jsx`, `app/globals.css`
- **Record:** `hero-rule-follow-and-work-band`
- **What changed:** Six related adjustments. (1) The header is suppressed for the duration of the hero load sequence. (2) The header is now a floating capsule in the top-right containing only Blog and Resume; the wordmark and the local clock were removed. (3) While the hero is at rest the rule trails the cursor, stretching in proportion to the distance still to cover and relaxing back to its base width on arrival. (4) The work section is clipped to the expanding orange band, so its content is only visible inside the band as it opens. (5) The number boxes no longer travel; each fills and empties in place. (6) The row separators grow and retract from the spine intersection rather than the page edge.
- **Before:** Full-width black header bar with wordmark and clock, visible throughout the intro; the rule was static once it came to rest; the work section appeared as a whole rectangle behind the wipe; a single white chip slid vertically between number boxes; separators scaled from `transform-origin: left`.
- **After:** The pill appears only once the hero finishes; the rule is a live cursor-tracked element; the work section is revealed through the band; boxes fill in place; separators open outward from the spine.
- **Why:** Requested follow-up refinements to the hero and work animations.
- **Fix/Notes:** Header suppression uses an `intro-running` class set by the existing inline script in the root layout before first paint, so the pill never flashes, and cleared by the hero when its copy reveals. The script carries a 9s failsafe removal so the header cannot be lost if the hero never mounts. `page-top-offset` was removed from the home page because the pill no longer occupies layout space, letting the hero run full-bleed. The rule was converted from a clip-path window on the live shader to a DOM element carrying the same gradient: the shader still performs the one-off slice, then hands off, so cursor tracking and stretching are pure `transform` writes. The scroll sequence is driven from a single `ScrollTrigger.onUpdate` progress value rather than a scrubbed tween, so the rule and the work band are computed from one source and cannot drift; Lenis already smooths the scroll. Band geometry is published as `--band-x` / `--band-h` on the document element and consumed by `.work-section` via `clip-path`, defaulting to `100%` (fully open) so the section is never trapped behind a closed band under reduced motion or if the hero never runs. Verified: rule stretches to ~2.7x mid-flight and returns to 1.0 on arrival; box positions are byte-identical across hover changes; separator `transform-origin` resolves to 801.5px of a 1325px list (60.5%, the spine); lit separator set moves `{0,108} -> {108,216}` with the shared rule untouched. The work counter is hidden below 768px, where it would sit under the fixed pill and reports a hover state touch does not have. Removing the wordmark also removes the header link back to `/`; the footer remains the home path from sub-pages.

### 2026-08-17
#### [FIX] Halo preset, fill timing, greeting persistence, and stronger rule stretch
- **Template/File:** `components/Intro.jsx`, `components/hero/HeroGradient.jsx`, `app/globals.css`
- **Record:** `hero-halo-and-fill-timing`
- **What changed:** (1) The scroll fill now completes exactly as the work section reaches the top of the viewport instead of finishing early. (2) The greeting no longer reappears after the hero settles. (3) The cursor-tracked rule expands far more while travelling. (4) Swapped the bespoke shader configuration for the upstream "Halo" preset, whose gradient the resting rule now mirrors before turning solid orange on scroll.
- **Before:** The fill reached full coverage around 80% of the hero scroll and then sat idle; "Hello" reappeared once the hero finished; the rule stretched to at most ~2.6x in practice; the shader used a three-hue indigo/orange/blue configuration.
- **After:** Coverage lands with the work section at the top; the greeting stays retired; the rule peaks near 9x and eases back; the hero is a simple warm Halo gradient that runs into the work orange.
- **Why:** Requested refinements to pacing, correctness, and art direction.
- **Fix/Notes:** The greeting bug was a genuine ordering fault, not a styling issue: the scroll handler wrote `autoAlpha` to `[copy, hello]` on every update, so at progress 0 it computed `1 - 0` and resurrected the element the intro timeline had just retired. `hello` was removed from that write. The fill previously multiplied its reach by 1.06 as a seam guard, which meant full coverage was crossed before the end of the scroll; that is now a flat 2px epsilon, so coverage and the end of the trigger coincide, and the expansion phase was extended from `0.05-0.8` to `0.05-1.0`. Raising the stretch cap alone did nothing measurable, because the `quickTo` easing on `scaleX` lagged behind a distance that collapses as the rule catches up, so the tween never approached the cap; the stretch is now integrated per frame with an asymmetric coefficient (0.34 attack, 0.07 release) against a slower 0.7s follow, giving fast expansion and a gentle settle. Verified in production: greeting `visibility: hidden` after the hero; stretch peaks at 8.87 and returns to 1.0; the work clip opens at `projTop = -35` (within one 95px scroll step of the top); zero page errors. Halo is applied with `grain: "off"` because at this scale the preset's grain reads as noise. The `.hero-rule` CSS gradient stops were restaged to Halo's palette so the shader-to-DOM hand-off stays invisible; the shader itself now unmounts at ~4s once the rule takes over, with the live canvas confirmed present across the full-bleed and slice phases.

### 2026-08-17
#### [FEAT] Pinned work outro, centred hero copy, thicker rule
- **Template/File:** `components/work/WorkStage.jsx`, `lib/work-stage-context.js`, `components/work/WorkIndex.jsx`, `components/Intro.jsx`, `app/page.jsx`, `app/globals.css`
- **Record:** `work-outro-stage`
- **What changed:** (1) The hero name block moved to the vertical centre of the viewport, unchanged horizontally. (2) The cursor-tracked rule is twice as thick (6px to 12px). (3) Scrolling past the work section no longer moves the page straight away. The section pins, and the scroll first strips the projects out one at a time: each row's title, meta, description and arrow fade upward while its number box fills and latches as a spent marker, and stripped rows can no longer be brought back by hovering. Once the list is reduced to numbers, rules and the spine, the following section wipes down over the top of it, so the next screen arrives from above instead of scrolling up from below.
- **Before:** The hero copy sat at the bottom of the viewport, the rule was 6px, and the work section scrolled away normally into Achievements.
- **After:** Centred hero copy, a 12px rule, and a pinned outro that dismantles the ledger before revealing Achievements from the top edge.
- **Why:** Requested changes to hero composition and the work-to-next-section transition.
- **Fix/Notes:** New `WorkStage` component wraps the work section and whatever follows it in a pinned 100dvh stage with two absolutely-positioned layers. `app/page.jsx` now renders `<WorkStage next={<Achievements />}><Projects /></WorkStage>`. Per-frame work is done with direct DOM writes against a small attribute contract (`[data-work-row]`, `[data-erase]`) so a scroll frame never triggers a React render; only the whole-number erased count is lifted into state, via `lib/work-stage-context.js`, and it changes at most five times across the sequence. Two real bugs were found and fixed during verification. First, the erased count was computed as `Math.floor(clamp(0, 1, p / per))`, which clamped the ratio rather than the count and pegged it at 1, freezing the counter at "02 / 05"; it now clamps the count. Second, the reveal layer was set to `z-index: 2` but stayed invisible, because the layer wrappers have `z-index: auto` and create no stacking context, so the work section's own `z-10` competed directly with it and won; the reveal layer is now `z-index: 30`. The hover-state opacity transitions are disabled while dismantling, since they low-pass the per-frame inline writes and make erased content lag the scroll. The reveal completes at 92% of the pin rather than 100% so the incoming section is held fully visible for a beat instead of unpinning the instant it lands. Below 768px and under reduced motion no pin is created at all: `gsap.matchMedia` leaves both sections in ordinary document flow, verified as `data-staged="false"`, `clip-path: none`, no rows erased, and no horizontal overflow. Verified in production: hero block centre within 3px of the viewport midpoint, rule 12px, `#projects` held at top 0 across the whole sequence, strip `00000 -> 11000 -> 11111`, counter `01 -> 03 -> 05`, reveal `100% -> 0%`, zero page errors, and every section id still reachable to the foot of the page.

### 2026-08-17
#### [FIX] Hero first-paint order, rule jitter on scroll, and settle on return
- **Template/File:** `components/Intro.jsx`, `app/layout.tsx`, `app/globals.css`
- **Record:** `hero-paint-order-and-rule-smoothing`
- **What changed:** (1) On first load the hero copy no longer appears before the sequence runs; the gradient shows first, then the greeting, then the copy. (2) The rule no longer jitters on the way into the work section. (3) Scrolling back up returns the rule at its base width and lets it settle on the pointer before the stretch response is re-armed.
- **Before:** The finished hero painted for a beat on load; the rule fought itself on the transition into the fill; returning to the top snapped the rule straight into a full-strength stretch toward the cursor.
- **After:** Gradient-only until 1s, greeting 1.5-2.9s, copy and header from ~3.8s; the rule tracks the fill continuously; the return glides back at base width and only then re-arms.
- **Why:** Reported load-order, smoothness, and scroll-back issues.
- **Fix/Notes:** The load-order fault was a first-paint flash, not a timeline problem: GSAP hides the copy in a layout effect, which runs only after hydration, so the server HTML painted the finished hero first. A `hero-unpainted` class is now set alongside `intro-running` by the existing inline script before first paint and cleared by the hero the moment its initial states are set. The two flags need separate lifetimes — `intro-running` must persist for the whole sequence to keep the header pill away, whereas the copy guard has to be released immediately or it would also suppress the greeting it exists to sequence. A first attempt gated both on `intro-running` and targeted `.hero-hello` (the inner span) rather than the wrapper GSAP actually animates, which suppressed the greeting entirely for its whole window; the guard now targets `.hero-hello-layer` and the copy lines. The jitter had a concrete cause: `gsap.quickTo` kept a live tween on the rule's `x` while the scroll handler wrote `x` with `gsap.set` on the same frames, so two writers fought every frame. Both were replaced by a single always-on ticker that owns `x` and `scaleX` and smooths them manually, with mode-dependent coefficients (follow: 0.12 position, 0.34 attack / 0.07 release; fill: 0.3 position, 0.24 scale). Because there is now one writer and one continuous state, no mode change can produce a snap. That renderer also reads progress from the ScrollTrigger directly instead of having it pushed in from `onUpdate`: `onUpdate` only fires for scrolls ScrollTrigger hears about, and a programmatic jump that bypasses Lenis left the pushed value stale and stranded the rule mid-fill at scale 173 — reproduced, then fixed. The trigger is held in a pre-declared `let` so the renderer cannot hit a temporal dead zone. Return-to-top sets a `settling` flag that pins the target scale at 1 until the rule is within 2px of the pointer. Verified in production: load order 0/0/0 at 150ms and 700ms, greeting 0.96 at 1.5s and 1.00 at 2.3s, copy and header 1.00 by 4.7s; 122 sampled frames across the fill with 1 scale reversal and 0 position jumps; return peak scale 1.00 with the rule settling at the pointer; stretch re-arms to 8.96 afterwards; reduced motion and mobile both show the copy immediately with no guard class left set and no horizontal overflow; zero page errors.

### 2026-08-19
#### [REFACTOR] Replace the skills gas chamber with a multi-ring solar system
- **Template/File:** `components/Skills.tsx`, `components/skills/OrbitImages.jsx`, `components/skills/OrbitImages.css`, `components/skills/SkillOrbits.jsx`, `data/skillsData.jsx`, `app/globals.css`, `eslint.config.mjs`
- **Record:** `skills-orbit-solar-system`
- **What changed:** The skills section no longer uses the d3-force "gas chamber" simulation. It is now a solar system: four orbital rings, one per skill group, circling a shared centre on a common tilted plane. Rings run inward to outward as Tooling (4), Cloud and data (9), Web and product (10), AI and automation (13), with different radii, periods and directions so the field never settles into a repeating pattern. Faint orbit tracks are drawn so the arrangement reads as a system rather than a scatter.
- **Before:** A 1155-line component running a d3-force simulation with brain-zone clustering, connection edges, drag handling and a separate mobile cluster-wheel layout.
- **After:** A ~100-line section rendering `SkillOrbits` plus a grouped skill list, with the inventory extracted to `data/skillsData.jsx`.
- **Why:** Requested change from the gaseous behaviour to a solar-system layout, based on the React Bits OrbitImages component.
- **Fix/Notes:** OrbitImages was vendored rather than installed, with two deliberate local changes. Its imports were pointed at `framer-motion` instead of `motion/react`: the `motion` package is not installed, framer-motion v11 already ships `motion`, `useMotionValue`, `useTransform` and `animate`, and adding the separate package would have duplicated the animation runtime for no gain. An `items` prop accepting React nodes was added alongside `images`, because the skill glyphs are react-icons components rather than image URLs; the internal OrbitItem already rendered a node, so this only exposes what was there. The upstream `responsive` mode was deliberately not used: it forces a 1:1 container, which around a deliberately flat orbital plane would have produced a very tall, mostly empty section. `SkillOrbits` instead measures once and scales a single shared stage, so all four rings stay concentric and the section keeps a wide, short footprint. Ring radii (190/350/510/660) and the 0.46 vertical flatten were chosen so adjacent rings clear each other's `itemSize` at the vertical extremes. Accessibility: the orbit is `aria-hidden` inside OrbitImages and its glyphs are non-focusable spans, so the same inventory is rendered as a real grouped list underneath — that list is the sole presentation below 768px, where a wide orbital plane cannot be read, and it is available to assistive technology at every width. Reduced motion pauses every ring via the component's own `paused` prop, verified stationary. The previous implementation is preserved at `.backup-animations/Skills.tsx`, and that directory was added to the eslint ignore list so the backup no longer reports warnings. Verified in production: 4 rings, 4 orbit paths, 36 orbiting items, 36 list items, items confirmed in motion, zero page errors, and no horizontal overflow at 390px.

#### [FIX] Skew the skill orbit rings to match the reference proportion
- **Template/File:** `components/skills/SkillOrbits.jsx`, `app/globals.css`
- **Record:** `skills-orbit-skew`
- **What changed:** Flattened the orbital plane so the rings read as skewed ellipses rather than concentric circles. Vertical squash went from 0.46 to 0.26, tilt from -14 to -10 degrees, radii from 190/350/510/660 to 200/370/530/670, and item sizes from 46-56 to 44-50. The design stage height dropped from 760 to 540, and the central star from 190px to 160px.
- **Before:** Rings were too round; at a 0.46 ratio the arrangement read as a stack of concentric circles seen face-on.
- **After:** A flat, tilted orbital plane matching the supplied reference.
- **Why:** Requested skewed rings; the reference composition uses radiusY / radiusX of 80 / 340, roughly 0.235.
- **Fix/Notes:** 0.26 rather than the reference's exact 0.235 because the reference carries a single ring, where item size can exceed the ring's vertical radius without consequence. Across four rings that ratio collapses the vertical spacing, so 0.26 is the point where the rings stay individually legible while the plane still reads as skewed. Radial spacing is set for the left and right extremes, which is where a flat ellipse is actually read; near the top and bottom the rings sit closer and glyphs pass one another, which is correct for an orbital plane at this angle rather than something to design out. Outer radius plus half its item size stays inside BASE_WIDTH / 2, and the rotated vertical extent of the outer ring (about 207px at this tilt) sits inside the 540 stage, so nothing is clipped — confirmed by measuring every orbiting item against the viewport. The flatter plane also shortened the section from 782px to 555px, which brings the grouped skill list into the same viewport as the orbit. Verified in production: 4 rings, 36 orbiting items, 36 list items, no clipping left or right, items in motion, reduced motion stationary, mobile still list-only with no horizontal overflow, zero page errors.

#### [FIX] Remove the visible skill chip grid from the desktop skills section
- **Template/File:** `components/Skills.tsx`
- **Record:** `skills-hide-chip-grid`
- **What changed:** The grouped skill chip grid below the orbit is no longer rendered visually at 768px and above. It remains in the document as screen-reader-only content, and stays fully visible below 768px.
- **Before:** The chip grid was visible beneath the orbit at every width.
- **After:** Desktop shows only the heading and the orbital plane; the section is shorter as a result.
- **Why:** Requested removal of that block.
- **Fix/Notes:** Applied as `md:sr-only` rather than deleting the markup, because that block was doing two jobs beyond its visual one. It is the only skills content below 768px, where the orbit is hidden and a wide orbital plane cannot be read — deleting it outright would have left an empty section with nothing but a heading on mobile. It is also the accessible reading of the orbit, which is `aria-hidden` inside OrbitImages and whose glyphs are non-focusable spans, so removing it would have taken the entire skill inventory off the page for assistive technology and for crawlers indexing the portfolio's technology keywords. Verified in production: at 1440px the container measures 1x1 with `position: absolute`, `overflow: hidden` and `clip: rect(0,0,0,0)` while all 36 list items remain in the DOM, the section is not inside any `aria-hidden` subtree, and the skill text is still reachable via innerText; at 390px the container returns to static flow at full width with no horizontal overflow. Zero page errors.

#### [FIX] Eliminate the SVG hydration mismatch behind the terminal error wall
- **Template/File:** `components/Achievements.jsx`, `components/SiteFooter.jsx`
- **Record:** `svg-hydration-float-precision`
- **What changed:** Computed SVG geometry is now snapped to 3 decimal places before it reaches an attribute or a path string, via a small `snap()` helper in each file.
- **Before:** Raw `Math.sin`/`Math.cos` doubles were rendered directly into SVG attributes and template-literal path data. Node and the browser can serialise the same double to different strings (e.g. `-105.65509926170148` against `-105.6550992617015`), which React reports as a hydration mismatch and prints as a very large element diff on every page load.
- **After:** Both sides emit identical markup. Console is clean in dev and production.
- **Why:** Reported large error in the terminal on opening the project.
- **Fix/Notes:** Two separate things were in that output and only one was ours. The enormous diff also carried `data-darkreader-inline-stroke` and `--darkreader-inline-stroke` attributes; `darkreader` appears nowhere in this repository, so those are injected by the Dark Reader browser extension mutating SVG fill and stroke before React hydrates. React's own message lists that case explicitly and it is not fixable from application code — but it was amplifying a real mismatch underneath, which is what this change fixes. The trailing `THREE.WebGLProgram: Program Info Log: WARNING: Output of vertex shader ... not read by fragment shader` lines come from the vendored ShaderGradient material declaring varyings its fragment shader does not consume. They are warnings, not errors, originate inside `@shadergradient/react` rather than this codebase, and have no runtime effect. Covered call sites: 8 JSX attributes in Achievements and, in SiteFooter, 6 JSX attribute groups plus 8 variable declarations that feed template-literal path data (wave, radial, ladder, blob and spoke glyphs). Verified: 0 console errors and 0 hydration errors across the hero, work, achievements, skills and contact sections in both dev and a production build, with the footer micrographics rendering unchanged.
