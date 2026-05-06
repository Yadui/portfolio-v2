# Technical Architecture

## Overview

This portfolio is a Next.js App Router application that mixes content-heavy frontend pages with lightweight product features such as auth, blog management, contact handling, and uploads.

## Stack Summary

- Next.js 16 application routing
- React 18 UI layer
- Tailwind CSS with project-specific breakpoints and tokens
- Motion stack including Framer Motion, Motion, GSAP, d3-force, and Matter.js
- Drizzle ORM with libSQL client for persisted data
- SimpleWebAuthn and custom auth utilities

## Route Map

### App Pages

- `/` home page
- `/blog` blog index
- `/blog/[slug]` blog detail
- `/blog/create` blog creation view
- `/blog/edit/[id]` blog edit view
- `/contact` contact page
- `/login` login page
- `/resume` resume page
- `/services` services page
- `/test-page` experimental page
- `/work` work overview
- `/work/[company]` work detail page

### API Routes

- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/setup`
- `/api/blog`
- `/api/blog/delete`
- `/api/blog/edit`
- `/api/blog/get`
- `/api/contact`
- `/api/debug/users`
- `/api/upload`

## Code Organization

### App Layer

The `app/` directory owns pages, route handlers, metadata entry points, and global styles.

### Component Layer

The `components/` directory contains:

- Page sections such as header, projects, achievements, timeline, skills, and contact
- Specialized interaction components such as modal, transitions, sliders, and animated footer elements
- Reusable UI primitives under `components/ui`
- Third-party style integrations under `components/fancy` and `components/ai-elements`

### Data Layer

- `data/workDetails.js` holds structured work content for experience views
- `lib/` contains auth, database, schema, and utility helpers
- `drizzle/` stores migration artifacts

### Asset Layer

- `public/assets` stores backgrounds, resume assets, skill visuals, and work imagery
- `public/uploads` holds uploaded content
- `public/fonts` provides local display fonts referenced by global CSS

## Current Conventions

- App routing lives in `app/`, not `pages/`
- Styling is utility-first with Tailwind plus a small number of custom global utilities
- Imports use the `@/` alias for cleaner paths
- The codebase currently mixes `.js`, `.jsx`, `.ts`, and `.tsx`; treat TypeScript migration as gradual rather than mandatory

## Architectural Strengths

- Clear separation between route handlers, sections, and reusable UI primitives
- Strong capability for interactive showcases through the animation stack
- Good foundation for blog and admin-style tooling without introducing a heavyweight CMS

## Architectural Risks

- Mixed language usage can make shared typing and consistency harder over time
- Motion-heavy sections need ongoing performance checks on mobile
- Route and API growth will benefit from clearer content and data contracts

## Recommended Maintenance Priorities

1. Standardize data shapes for blog entries, work entries, and contact responses.
2. Add lightweight architecture notes whenever a new system is introduced.
3. Keep UI primitives generic and section components domain-specific.
4. Audit performance whenever animation or media weight increases.