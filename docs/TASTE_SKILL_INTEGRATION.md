# Taste Skill integration

## Provenance

The complete tracked contents of [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) were vendored at:

```text
vendor/taste-skill/
```

Snapshot commit:

```text
e988add20dab0fa97d7a76781c48961c8184288e
```

The upstream Git metadata was intentionally not copied. The vendor snapshot contains the repository files, skills, research, scripts, plugin metadata, license, README, examples, and assets without a nested repository.

## Always-on adapters

The repository-local adapters point agents to the same canonical Portfolio policy:

- `AGENTS.md` for general coding agents and Codex-style workflows.
- `CLAUDE.md` for Claude Code, importing `AGENTS.md`.
- `GEMINI.md` for Gemini-oriented workflows.
- `.github/copilot-instructions.md` for GitHub Copilot.
- `.cursor/rules/portfolio-taste.mdc` for Cursor with `alwaysApply: true`.
- `.windsurfrules` for Windsurf.
- `docs/PORTFOLIO_TASTE_STANDARD.md` for the project-specific, always-on rules and pre-flight checklist.

## Upstream skill inventory

The vendor snapshot includes these implementation and reference skills:

- `skills/taste-skill/SKILL.md`
- `skills/taste-skill-v1/SKILL.md`
- `skills/gpt-tasteskill/SKILL.md`
- `skills/redesign-skill/SKILL.md`
- `skills/output-skill/SKILL.md`
- `skills/image-to-code-skill/SKILL.md`
- `skills/imagegen-frontend-web/SKILL.md`
- `skills/imagegen-frontend-mobile/SKILL.md`
- `skills/brandkit/SKILL.md`
- `skills/soft-skill/SKILL.md`
- `skills/minimalist-skill/SKILL.md`
- `skills/brutalist-skill/SKILL.md`
- `skills/stitch-skill/SKILL.md`
- `skills/stitch-skill/DESIGN.md`
- `skills/llms.txt`

Research, examples, assets, scripts, plugin metadata, the MIT license, README, and changelog are preserved alongside the skills. The default Portfolio policy uses the upstream v2 skill as its baseline and maps optional variants explicitly rather than combining contradictory rules.

## Updating the snapshot

When updating Taste Skill, clone or fetch the upstream repository outside this project, review the new commit and changelog, replace only `vendor/taste-skill/`, update the commit hash above, and review `docs/PORTFOLIO_TASTE_STANDARD.md` for conflicts with the current Portfolio stack. Never copy `.git` metadata or secrets into the project.
