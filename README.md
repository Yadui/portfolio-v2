# Portfolio Project

This repository contains a motion-first portfolio built with Next.js App Router, Tailwind CSS, and a mixed static plus database-backed content model. The product combines recruiter-facing case studies, service positioning, a blog surface, and lightweight admin/auth utilities.

## Core Goals

- Present work, skills, and experience in a memorable visual system.
- Support editorial publishing through the blog routes and admin APIs.
- Keep the UI fast, responsive, and polished across desktop and mobile.
- Make it easy to evolve the portfolio without losing design consistency.

## Stack

- Framework: Next.js 16 with the App Router
- UI: React 18, Tailwind CSS, shadcn-style UI primitives
- Motion: Framer Motion, Motion, GSAP, d3-force, Matter.js
- Data: Drizzle ORM with libSQL client
- Auth: SimpleWebAuthn, custom auth routes
- Content: Static page sections plus blog CRUD APIs

## Current Product Surface

- Home page with hero, projects, achievements, timeline, skills, and contact sections
- Work, services, resume, contact, login, and blog pages
- Blog create and edit flows
- API endpoints for auth, blog, contact, uploads, and debug utilities

## Local Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Documentation Index

- [Design System](docs/DESIGN_SYSTEM.md)
- [Always-on Portfolio Taste Standard](docs/PORTFOLIO_TASTE_STANDARD.md)
- [Taste Skill integration](docs/TASTE_SKILL_INTEGRATION.md)
- [Design Roadmap](docs/DESIGN_ROADMAP.md)
- [Content Strategy](docs/CONTENT_STRATEGY.md)
- [Technical Architecture](docs/TECH_ARCHITECTURE.md)

## Historical Implementation Notes

The root-level `SKILLS_*` and `TIMELINE_REFACTOR.md` files document prior implementation passes. They are useful as change logs, while the `docs/` folder should be treated as the source of truth for forward-looking product and design decisions.
