# Portfolio agent instructions

These instructions apply to every agent and model working in this repository.

## Always-on portfolio design standard

When a task involves the public portfolio website, UI, frontend, landing pages, case studies, visual polish, typography, layout, responsive behavior, imagery, or animation:

1. Read `docs/PORTFOLIO_TASTE_STANDARD.md` before planning or editing code.
2. Treat `vendor/taste-skill/skills/taste-skill/SKILL.md` as the vendored upstream reference for the default `design-taste-frontend` v2 rules.
3. For an existing surface, also follow `vendor/taste-skill/skills/redesign-skill/SKILL.md`: scan first, diagnose second, then make targeted fixes. Do not rebuild the site from scratch.
4. Before writing UI code, record a one-line Design Read, explicit `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY` values, the chosen composition, and the motion and asset plan.
5. Run the pre-flight checklist in `docs/PORTFOLIO_TASTE_STANDARD.md` before calling the work complete.

Do not wait for the user to mention Taste Skill. This is the default for portfolio design work. Apply it to public marketing and editorial surfaces. Do not force marketing-page rules onto database, authentication, admin, or other product workflows where they do not fit.

## Project constraints

- Preserve the existing Next.js App Router architecture and current functionality.
- Read `docs/DESIGN_SYSTEM.md` and inspect the relevant components before changing visual tokens. The implemented portfolio system and its current tokens take precedence over generic defaults.
- This project uses Tailwind CSS v3, not Tailwind v4. Check `package.json` before using a dependency or import. Do not assume an upstream example's package is installed.
- Prefer the existing font, motion, and component stack. Do not migrate libraries as part of a visual task unless explicitly requested.
- Preserve URL structure, primary navigation labels, form field names, legal copy, analytics hooks, and established brand assets unless the user explicitly asks for a change.
- Keep motion isolated in client leaf components, animate `transform` and `opacity`, clean up effects, and honor `prefers-reduced-motion`.
- Use semantic HTML, visible keyboard focus, meaningful alt text, explicit mobile fallbacks, and complete loading, empty, and error states.
- Never hardcode credentials or secrets. Never commit `.env` files.
- Do not delete existing files or user work without a backup or explicit confirmation.

## Verification

For UI changes, run the relevant lint and build checks, then verify the affected page at mobile and desktop widths when browser tooling is available. Check both the normal motion path and reduced-motion behavior. Report any limitation instead of claiming an unchecked result.
