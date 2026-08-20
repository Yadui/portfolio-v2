# Portfolio Taste Standard

**Status:** Always on for agents and models working on the public Portfolio website.

**Upstream:** [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)

**Vendored snapshot:** `vendor/taste-skill/` at commit `e988add20dab0fa97d7a76781c48961c8184288e`.

## 1. How to apply this standard

Apply this standard whenever the task includes portfolio design, frontend UI, landing pages, case studies, visual polish, typography, layout, imagery, responsive behavior, or animation. It is not a request-time opt-in.

Use the full vendored source when a rule needs detail. This document is the Portfolio-specific adapter that makes the source practical for this codebase.

### Instruction precedence

Use this order when rules conflict:

1. The user's explicit brief and accessibility requirements.
2. Existing product contracts and working behavior in this repository.
3. The current Portfolio system in `docs/DESIGN_SYSTEM.md` and the actual rendered components.
4. This adapter.
5. The vendored upstream Taste Skill examples and optional variants.

Do not blindly copy an upstream example that assumes a different framework version, dependency, palette, or product type. Preserve the existing system unless the user asks for a redesign direction change.

### Surface boundary

This standard is mandatory for public portfolio and editorial surfaces. It is guidance, not a reason to redesign authentication, admin, database, or other workflow-heavy product surfaces as marketing pages. For those surfaces, keep the relevant accessibility, state, and system rules while using the appropriate product UI patterns.

## 2. Portfolio design read

Default reading of this repository:

> Reading this as: a developer portfolio for recruiters and technical clients, with a bright editorial and technical language, leaning toward the existing paper-stage system, sharp ink hierarchy, acid-green signal color, and guided motion.

### Default dials

Use these starting values unless the brief or audit clearly changes them:

| Dial | Default | Meaning |
| --- | ---: | --- |
| `DESIGN_VARIANCE` | `7` | Intentional asymmetry and varied composition without sacrificing recruiter readability |
| `MOTION_INTENSITY` | `6` | Guided reveals and purposeful interaction, not motion on every element |
| `VISUAL_DENSITY` | `4` | Balanced information density with generous editorial spacing |

State the values in the design plan. Adjust them when the brief calls for a calmer, more experimental, denser, or more static result.

## 3. Existing Portfolio system

The existing implementation is the starting point, not an invitation to replace the stack.

### Current visual tokens

Use the established tokens from `docs/DESIGN_SYSTEM.md` unless a redesign brief changes them deliberately:

- Paper: `#f5f1e8`
- Elevated paper: `rgba(255, 252, 246, 0.88)`
- Solid paper: `#fffdf8`
- Ink: `#101828`
- Soft ink: `#536074`
- Faint ink: `#8892a4`
- Structural line: `rgba(16, 24, 40, 0.1)`
- Strong line: `rgba(16, 24, 40, 0.16)`
- Primary accent: `#00ff99`
- Soft accent: `rgba(0, 255, 153, 0.14)`
- Sunrise warmth: `#ffbf73`
- Steel: `#cad4e3`

Use one coherent palette per page. Do not introduce a second unrelated accent or switch between warm and cool neutral families without a documented reason.

### Current technical constraints

- Next.js App Router with React 18.
- Tailwind CSS v3. Do not use Tailwind v4 configuration or syntax.
- Existing local font variables and display system in `tailwind.config.js` and `app/globals.css`.
- Existing animation dependencies include Framer Motion, GSAP, and related utilities. Check `package.json` before importing anything else.
- Existing code mixes JavaScript, JSX, TypeScript, and TSX. Match the local file and migrate only when requested.
- Prefer the current icon and motion dependencies for consistency. Do not add or mix a new icon family for a small visual change.

## 4. Mandatory workflow before UI code

### Step 1: Classify the task

Identify whether the work is greenfield, redesign-preserve, or redesign-overhaul. For an existing page, use the audit sequence: scan, diagnose, fix.

### Step 2: Declare the Design Read

Write one line that identifies page kind, audience, vibe, and design family. If the brief genuinely supports two incompatible readings, ask one focused question. Do not ask a questionnaire.

### Step 3: Set the three dials

Set `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`. Explain the reason briefly. Do not silently use a default.

### Step 4: Audit before redesign

Record:

- Existing brand colors, fonts, radii, spacing, and signature interactions.
- Information architecture, routes, anchors, navigation, forms, and conversion paths.
- Content that is doing useful work and content that is filler.
- Accessibility and performance wins that must not regress.
- Generic patterns, broken states, dead links, fake assets, and motion problems to retire.

For preserve mode, keep URL structure, primary nav labels, form field names and order, legal copy, logo or wordmark, analytics hooks, and copy voice unless explicitly changed.

### Step 5: Choose one composition family per section

Use the Taste vocabulary when useful: asymmetric split hero, editorial manifesto, kinetic type, bento grid, masonry, split-screen scroll, sticky stack, horizontal pan, accordion image slider, spotlight border, parallax card, or restrained editorial list. Do not repeat the same section layout mechanically.

### Step 6: Verify the implementation path

Check `package.json`, Tailwind version, existing component conventions, image availability, and client versus server boundaries before writing imports. Never assume an upstream package is installed.

### Step 7: Implement the smallest complete slice

Ship working code, not a skeleton. Do not leave placeholder comments, fake screenshots, dead `#` links, or an incomplete interaction cycle.

### Step 8: Run the pre-flight

Complete the checklist in Section 8 and run lint, build, and browser checks appropriate to the change.

## 5. Anti-slop design rules

These are always on unless the brief explicitly requests the pattern and the result still passes accessibility and usability review.

### Brief and composition

- Do not default to an AI-purple gradient, centered dark mesh hero, three equal feature cards, generic glassmorphism, or a generic SaaS template.
- Do not make every section a centered symmetrical block. At variance above 4, prefer a split, offset, asymmetric, pinned, or editorial composition.
- Do not use the same layout family repeatedly. Across a long page, vary the composition while keeping the system coherent.
- Use CSS Grid for structural layouts. Avoid complex flexbox percentage math.
- Keep a clear container constraint, usually the existing project container or roughly `max-w-7xl` to `max-w-[1400px]`.
- Use `min-h-[100dvh]`, never `h-screen`, for full-height hero behavior.
- Every multi-column section needs an explicit mobile collapse in the same component. Under 768px, prioritize one-column flow, full-width content, touch spacing, and no horizontal overflow.

### Typography

- Use the existing Portfolio font system first. Do not introduce Inter as a new default for premium or creative work.
- Use display scale, tracking, weight, and line-height as a hierarchy system. Do not make a huge heading merely to create impact.
- Keep body copy readable and generally near 65 characters per line.
- Use serif only when the brief and brand genuinely justify an editorial or heritage direction. Never inject a random serif word into a sans headline for decoration.
- If italic display text contains descenders such as `y`, `g`, `j`, `p`, or `q`, provide enough line-height and bottom clearance to prevent clipping.
- Use sentence case by default. Small uppercase labels are scarce, topical, and useful, not automatic decoration.

### Color and surfaces

- One accent per page. Lock the accent across interactive states and sections.
- Never use pure `#000000` as a generic background. Use the existing paper and ink tokens or a deliberate off-black.
- Avoid oversaturated accents, random neon glows, and unrelated gradients.
- Use cards only when elevation communicates hierarchy. Prefer spacing, structural rules, or grouped content when a card adds no meaning.
- Keep one radius language per page. Do not mix arbitrary pills, sharp panels, and unrelated rounded cards.
- If using a glass treatment, label it as a web approximation and provide a solid fallback for reduced transparency. Do not use blur on large scrolling surfaces.

### Hero and page hierarchy

- Plan copy and visual scale together. The desktop hero headline should normally fit in two lines, with concise supporting copy and a visible primary action.
- Keep the hero to an eyebrow or brand cue, headline, support copy, and at most one primary plus one secondary action when the second action has a distinct intent.
- Never put fake stats, feature lists, trust logos, or decorative metadata inside the hero just to fill space.
- A hero needs a real visual direction. Use an available image-generation tool first, an appropriate real image second, or a clearly labeled asset slot as a last resort. Never manufacture a fake screenshot from rectangles.
- Do not use decorative section numbers, version stamps, weather or locale strips, scroll instructions, status dots without semantic meaning, pills over images, or decorative photo credits.
- Do not use em dashes or en dashes as visible copy separators. Rewrite with punctuation, a line break, a column, or a regular hyphen where appropriate.

### Components and content

- Do not use a default three-column equal-card feature row. Use an intentional asymmetric grid, grouped list, split layout, horizontal gallery, or another composition that fits the content.
- Bento grids must have exactly as many cells as content items. Do not leave blank middle or trailing cells. Use dense flow only when the spans are mathematically verified.
- Use real, contextual names and data. Do not use `John Doe`, `Acme`, `Nexus`, `SmartFlow`, fake precision, or round numbers invented for visual effect.
- Avoid copy clichés such as `Elevate`, `Seamless`, `Unleash`, `Next-Gen`, `Game-changer`, and `Revolutionize`. Prefer plain, specific language.
- Use semantic HTML and meaningful alt text. Do not use emojis in code, markup, visible copy, or alt text.
- Use a consistent icon family already present in the project. Never hand-roll icon paths for convenience.
- Use real links and meaningful actions. Do not ship `href="#"` as a fake destination.
- Every interactive path needs hover, active, focus, loading, empty, and error behavior where applicable. Labels sit above form inputs and errors sit below them.
- Do not duplicate CTA intent. Choose one label for contact, work, or other repeated actions and use it consistently.

## 6. Motion and performance rules

Motion must communicate hierarchy, storytelling, feedback, or a state transition. "It looks cool" is not a sufficient reason.

- Animate `transform` and `opacity` instead of `top`, `left`, `width`, or `height`.
- Do not use `window.addEventListener("scroll", ...)`, custom `window.scrollY` state, or `requestAnimationFrame` loops that update React state. Use the existing motion library, GSAP ScrollTrigger, IntersectionObserver, or CSS scroll-driven animation.
- Keep Motion and GSAP effects in isolated client leaf components. Do not make a server component depend on browser-only state.
- Clean up every effect and GSAP context on unmount.
- Use simple Motion or IntersectionObserver reveals for simple enter transitions. Reserve GSAP for real pinning, scrubbing, horizontal pans, or scroll storytelling.
- If using GSAP sticky stacks or horizontal pans, start at `top top`, pin the correct wrapper, calculate the travel distance, scrub the intended element, and verify the result in a real browser.
- Honor `prefers-reduced-motion`. Parallax, scroll hijacks, magnetic physics, perpetual loops, and complex reveals must collapse to a readable static or near-static state.
- Use `will-change` sparingly and only for elements that actually animate.
- Apply grain or noise only to fixed, pointer-events-none layers. Avoid filters on scrolling containers.
- Lazy-load heavy below-the-fold media and keep the hero stable with reserved image dimensions and appropriate priority.
- Do not add infinite animation to every card. Perpetual motion is optional and must be motivated by the brief.

## 7. Variant map from the vendored repository

The complete upstream repository is available under `vendor/taste-skill/`. Use variants deliberately instead of merging contradictory defaults:

| Need | Reference | Policy in this Portfolio |
| --- | --- | --- |
| Default public portfolio or landing page | `skills/taste-skill/SKILL.md` | Always-on baseline, adapted by this document |
| Existing-page redesign | `skills/redesign-skill/SKILL.md` | Audit first, targeted evolution, preserve behavior |
| Strict GPT or Codex art direction | `skills/gpt-tasteskill/SKILL.md` | Use only when a brief explicitly asks for Awwwards-level randomization or stronger GSAP direction |
| Full unabridged implementation | `skills/output-skill/SKILL.md` | Always complete requested deliverables; no omission placeholders |
| Image-first visual workflow | `skills/image-to-code-skill/SKILL.md` | Mandatory when image generation is available and the task is mainly visual |
| Website reference images | `skills/imagegen-frontend-web/SKILL.md` | Use for generated web comps, not code |
| Mobile reference images | `skills/imagegen-frontend-mobile/SKILL.md` | Use for generated mobile screens, not code |
| Brand board | `skills/brandkit/SKILL.md` | Use when the task is identity or brand exploration |
| Calm premium direction | `skills/soft-skill/SKILL.md` | Optional explicit style direction; reconcile with current tokens |
| Editorial minimal direction | `skills/minimalist-skill/SKILL.md` | Optional explicit style direction; do not force onto the full site |
| Industrial direction | `skills/brutalist-skill/SKILL.md` | Optional explicit style direction only |
| Google Stitch export | `skills/stitch-skill/SKILL.md` and `DESIGN.md` | Use only when Stitch is part of the requested workflow |
| Exact old behavior | `skills/taste-skill-v1/SKILL.md` | Use only for explicit v1 compatibility |

The upstream `skills/llms.txt`, research notes, scripts, plugin metadata, license, README, examples, and all assets are preserved in the vendor snapshot for reference. Do not edit the vendor copy to customize this project. Put Portfolio-specific rules here.

## 8. Final pre-flight checklist

Before reporting a portfolio design task complete, verify every applicable item:

- [ ] The page kind, audience, vibe, design read, and three dial values are explicit.
- [ ] Existing versus greenfield mode was identified and existing surfaces were audited first.
- [ ] The current Portfolio tokens, stack, route contracts, and dependencies were checked.
- [ ] One coherent palette, accent, radius language, and page theme are used.
- [ ] The hero fits the initial viewport, has concise copy, visible actions, and no decorative filler.
- [ ] Section compositions are varied and there is no generic three-equal-card row.
- [ ] Any bento grid has exactly one cell per content item and no empty gaps.
- [ ] There are no fake screenshots, generic placeholder names, fake precision, or AI copy clichés.
- [ ] No visible em dash, en dash separator, decorative section numbering, version stamp, scroll cue, or meaningless status dot was added.
- [ ] CTA labels are readable, do not wrap at desktop, and do not duplicate intent.
- [ ] Forms have labels, focus states, helper or error text, and complete states where applicable.
- [ ] Images are real, generated, or clearly marked asset slots. Meaningful images have useful alt text.
- [ ] Motion is motivated, uses performant properties, is isolated and cleaned up, and has a reduced-motion path.
- [ ] Mobile behavior is explicit at narrow widths and has no horizontal overflow.
- [ ] The relevant lint and build checks pass, and browser verification was run when available.
- [ ] No secret, credential, or environment file was added.

If an item cannot be honestly checked, fix it or report the limitation. Do not claim completion based on visual assumptions alone.
