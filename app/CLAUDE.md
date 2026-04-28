# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Questionable.fyi is a Q&A platform built on AT Protocol for people on the Atmosphere. People using the app can ask ask questions, and hopefully get answers. Questions can either be asked openly or directed to a specific profile or interview via context. The tagline is "We all have questions, let's get some answers."

This is the `app` workspace of a pnpm monorepo (sibling: `lexicons` for AT Protocol lexicon definitions). Licensed AGPL-3.0-only.

## Commands

```bash
pnpm dev                  # Dev server with HMR (port 3333)
pnpm build                # Production build — claude never needs to run this
pnpm lint                 # ESLint
pnpm format               # Prettier format
pnpm format:check         # Prettier check
pnpm typecheck            # TypeScript check (backend + frontend)
pnpm db:migrate           # Run database migrations
pnpm lex:build            # Rebuild AT Protocol lexicon types from ../lexicons
```

## Tech Stack

- **Backend:** AdonisJS v7 (Node 24+, TypeScript, ESM)
- **Frontend:** React 19 + Inertia.js v2 (server-driven SPA)
- **Styling:** Tailwind CSS v4 with custom design tokens (see DESIGN.md)
- **UI primitives:** Radix UI (accessibility-first)
- **Database:** PostgreSQL via Lucid ORM
- **Auth:** ATProto OAuth (session-based, custom provider)
- **Bundler:** Vite 7
- **API client:** Tuyau (type-safe, auto-generated from routes)
- **Validation:** VineJS
- **Testing:** TBD

## Architecture

### Backend (AdonisJS)

- `app/controllers/` — HTTP handlers, resource-style (show, index, store, update)
- `app/models/` — Lucid ORM models (Account, Profile, Question, OAuthSession, OAuthState)
- `app/middleware/` — Auth guards (guest, protected, silent_auth), Inertia, session, shield
- `app/validators/` — VineJS request validation schemas
- `app/transformers/` — Serialize models for Inertia page props & API responses
- `app/services/` — Business logic (e.g., slingshot service)
- `start/routes.ts` — All route definitions (imports `start/routes/oauth.ts`)
- `start/kernel.ts` — Middleware stack registration
- `config/` — Framework configuration (auth, database, inertia, vite, etc.)
- `database/migrations/` — PostgreSQL migrations (auto-run on start via `start/automigrate` if `DATABASE_AUTOMIGRATE` is `true`)
- `database/schema.ts` is automatically generated via `node ace schema:generate`, if the automatically generated types are not correct, we can adjust them using `database/schema_rules.ts`

### Frontend (Inertia + React)

- `inertia/pages/` — Page components (resolved by Inertia from filesystem)
- `inertia/components/` — Reusable components (`app/`, `profile/`, `ui/`, `context/`)
- `inertia/layouts/` — Layout wrappers
- `inertia/hooks/` — Custom React hooks
- `inertia/lib/` — Frontend UI library from shadcn-ui
- `inertia/client.ts` — Tuyau API client instance, types are automatically generated in `.adonisjs/client/*.ts`
- `inertia/css/` — Tailwind stylesheets

### Data Flow

1. Route → Controller action
2. Controller loads models, validates input, transforms data
3. Controller renders Inertia page with props
4. React page component receives typed props from server
5. Client-side API calls use Tuyau client (`inertia/client.ts`)

### Path Aliases

Backend (tsconfig.json): `#controllers/*`, `#models/*`, `#middleware/*`, `#validators/*`, `#transformers/*`, `#services/*`, `#utils/*`, `#start/*`, `#config/*`, `#database/*`, `#generated/*`

Frontend (vite/tsconfig.inertia.json): `~/*` → `inertia/*`, `@/*` → `inertia/lib/*`, `@generated/*` → `.adonisjs/client/*`

### Code Generation

Tuyau generates a type-safe API client and route registry in `.adonisjs/`. Inertia auto-discovers page components. Controller registry is generated at `.adonisjs/server/controllers.ts`. These are regenerated on build/dev start.

## Design System

For design adjustments and UI refinement, use the impeccable.style MCP server tools.

See `DESIGN.md` and `DESIGN.json` for the full specification. Key points:

- Primary color: inquisitive-violet (`oklch(43.2% 0.232 292.759)`)
- Typography: Charter serif font family for body/display text; `font-sans` is intentionally used on metadata/byline text and buttons — don't remove it
- Rounded corners: 0.625rem base
- Brand tone: curious, playful, earnest — editorial warmth over corporate polish
- Accessibility: WCAG AA, Radix UI primitives, reduced motion support

## Product Context

See `PRODUCT.md` for full product vision. The platform supports open questions, directed questions to specific users, and interview-style Q&A. The design should feel like a well-set, but slightly whimsical, publication, not a software tool.

## AdonisJS Documentation

The docs site (docs.adonisjs.com) can be fetched as markdown, but only from specific pages, e.g., `https://docs.adonisjs.com/guides/basics/url-builder.md` for the documentation found at `https://docs.adonisjs.com/guides/basics/url-builder`. To look up AdonisJS documentation, use context7 to find the page, then add `.md` to retrieve the markdown version, if that fails use context7's query-docs as follows:

1. Resolve the library ID with `resolve-library-id` using `libraryName: "AdonisJS"` — use `/adonisjs/v7-docs` for the current version
2. Query docs with `query-docs` using that library ID and a specific question

For Tuyau (API client / URL generation) docs, use library ID `/julien-r44/tuyau`.
For AdonisJS Inertia adapter docs, use library ID `/adonisjs/inertia`.

## AT Protocol Lexicons

Lexicon schemas live in `../lexicons/`. To understand or work with AT Protocol lexicons, use the lexicon.garden MCP server:

- `describe_lexicon` — explain what a lexicon does
- `validate_lexicon` — check a lexicon schema for errors
- `lexicon_schema_creation_guide` prompt — reference for creating new lexicons

Using all other tools and prompts exposed by the lexicon.garden MCP server are prohibited.

## Agent Skills

Project-level agent skills (impeccable, shadcn) are managed via the `skills` CLI. The source of truth is `skills-lock.json` at the project root. The `.agents/` directory is gitignored and must be regenerated after a fresh clone.

To reinstall skills:

```bash
pnpm dlx skills add pbakaus/impeccable -y
pnpm dlx skills add shadcn/ui -y
```

Note: `pnpm dlx skills experimental_install` restores files from the lock file but does not create the Claude Code symlinks, so use `add` instead.

## Preferences

- **Package runner:** Use `pnpm dlx` instead of `npx` for running one-off packages.
- **Dev server:** Never auto-start `pnpm dev`. Ask the user to run it, or check if port 3333 is already in use first.
- **JSON inspection:** Use `jq` for reading/parsing JSON files in shell — not python, node, or awk.

## Workflow

Always run the following commands prior to making commits, and fix any issues found:
- `pnpm typecheck`: this will ensure there are no typescript errors in your work
- `pnpm lint`: this will ensure there are no linting errors in your work
- `pnpm format`: this will automatically reformat files, you just need to commit the changes if they're part of your current work.

## Environment

Copy `.env.example` to `.env`. Key variables: `DATABASE_URL` (PostgreSQL), `APP_KEY`, `TAP_URL`, `TAP_ADMIN_PASSWORD`. Database defaults to `questionable_<NODE_ENV>` if no DB name in connection string.
