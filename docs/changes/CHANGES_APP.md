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
