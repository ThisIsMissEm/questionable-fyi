# Signup: PDS Chooser Redesign Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current signup form (a "Sign up with Bluesky" button + a free-text PDS URL input) with a card-based PDS chooser styled after the reference screenshot the user provided. The new screen presents a curated list of PDS options (each with logo, name, short description), an "Another PDS" card that reveals a custom-URL input, a "Learn more about self-hosting" link, and an informational box explaining that each PDS has its own policies/ToS — with the selected PDS's name and links rendered dynamically.

**Visual reference:** the user-supplied screenshot shows a vertical list of selectable cards on a dark card surface, with a checkmark on the active card and a violet outline for both selection and the info box. Our app uses a light-leaning Charter-serif aesthetic per `DESIGN.md`, so the *layout* and *interaction* translate over but the dark visual style does not — we keep our existing typography, the inquisitive-violet accent for selected state, and serif body type. The user explicitly asked for logos on each card.

**Prior context:**
- `inertia/pages/chromeless/signup.tsx` renders `<SignupForm />` inside a `FormLayout`.
- `inertia/components/signupForm.tsx` has two render paths: the normal form (bluesky button + free-text input) and a warning-form (when account creation is blocked by a PDS).
- The submit endpoint is `POST /oauth/signup` (see `app/controllers/oauth_controller.ts:27`); the controller takes an `input` field (the PDS service URL) and falls back to `https://bsky.social` if empty. So the backend already does the right thing — only the frontend changes.
- `auth_controller.ts:8` (the GET handler) currently passes `{}` as Inertia props; it'll need to pass the PDS list.
- AT Protocol PDSes expose a `com.atproto.server.describeServer` endpoint that returns `availableUserDomains`, contact info, and (sometimes) policy URLs. OAuth client metadata documents also expose `tos_uri` and `policy_uri`. These could feed the dynamic ToS/PP links — though for the *featured* PDSes, hardcoding them in the curated list is faster and avoids a server-side fetch on every signup-page render.

**Architecture:**
- The curated PDS list is hardcoded as a `const FEATURED_PDS` directly inside `app/controllers/auth_controller.ts` — four entries (Bluesky, Blacksky, Eurosky, selfhosted.social), each `{ id, host, name, description, termsUrl, policyUrl }`. We considered `@adonisjs/content` but a four-item static list with no need for hot-reload or Markdown content doesn't justify a package.
- `auth_controller.signup` passes the list as an Inertia prop (`featuredPds`) to `chromeless/signup`.
- The frontend `SignupForm` component replaces its form internals with a `PdsChooser`: a Radix `RadioGroup` of `PdsCard` items, an "Another PDS" card that reveals a controlled URL input when selected, the "Learn more" link, and an `InfoBox` that interpolates the selected PDS's name and links.
- Logos are bundled SVGs in `inertia/assets/pds/<id>.svg`, mapped to PDS `id`s by a small lookup helper on the frontend. The "Another PDS" card uses a generic globe icon from `lucide-react`. The lookup falls back to a placeholder icon if a curated PDS's art hasn't shipped yet, so the controller's list and the asset folder don't have to land in lockstep.
- Submission: each card maps to a service URL; on submit, that URL is sent in the existing `input` field of the form, hitting `POST /oauth/signup` unchanged. The "Sign up with Bluesky" path becomes "select Bluesky's card and submit" — no separate button.
- The warning-form path (`SignupWarningForm`) is preserved as a fallback for when a PDS rejects account creation; kept visually similar to today (inline alert + retry-anyway + go-back link) since it's a different flow.

**Tech Stack:** AdonisJS v7 (controller + Inertia render), Inertia + React 19, Radix UI `RadioGroup`/`Popover`, Lucide icons (`Check`, `Info`, `Globe`, `ExternalLink`), Tailwind v4 with our existing tokens. SVG logos shipped via Vite asset imports.

**Out of scope:**
- Discovering PDSes dynamically (e.g., querying a directory). The featured list stays hand-curated for now.
- Migration UX for existing Bluesky users moving between PDSes.
- A "tell us about your PDS" submission form for community PDSes that want to be featured.
- Login screen redesign — the user asked specifically about signup.
- Backend changes to the OAuth signup handler (already does the right thing).

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `app/controllers/auth_controller.ts` | Define the inline `FEATURED_PDS` const (4 entries) and pass it as the `featuredPds` Inertia prop |
| Create | `inertia/lib/featured_pds.ts` | Frontend-side `FeaturedPds` type mirror + a `pdsLogoSrc(id)` helper that resolves the SVG asset (or returns a placeholder) |
| Create | `inertia/assets/pds/bluesky.svg`, `blacksky.svg`, `eurosky.svg`, `selfhosted.svg` | Bundled logo SVGs, one per featured PDS |
| Create | `inertia/assets/pds/_placeholder.svg` | Generic fallback when an `id` doesn't have art yet |
| Modify | `inertia/pages/chromeless/signup.tsx` | Receive the prop, pass it into `<SignupForm>` |
| Modify | `inertia/components/signupForm.tsx` | Replace `SignupFormInner` with the new card chooser; preserve `SignupWarningForm` for the blocked-creation path |
| Create | `inertia/components/signup/pds_chooser.tsx` | Radix `RadioGroup` over `PdsCard`s + "Another PDS" affordance + custom-URL input |
| Create | `inertia/components/signup/pds_card.tsx` | Single card: logo, name, description, selected-state visuals (violet border + Check) |
| Create | `inertia/components/signup/info_box.tsx` | Violet-bordered notice with Info icon, dynamic copy interpolating selected PDS name + links |
| Modify | `inertia/components/terms.tsx` (review only) | Confirm whether the bottom `<Terms>` block should remain or be folded into the new info box |

---

## Decisions (locked in; recorded for context)

1. **The PDS list is hardcoded inline in `auth_controller.ts`.** Four entries — Bluesky, Blacksky, Eurosky, selfhosted.social. Considered `@adonisjs/content` and a separate config module; both are overkill for a small static list. The controller passes the array as an Inertia prop. If the list grows past ~10 entries or starts needing per-locale curation, revisit.

2. **Logos are bundled SVGs in `inertia/assets/pds/`, one per `id`.** Three of the four are available in the community-maintained [atmologos](https://tangled.org/cozylittle.house/atmologos/tree/main/color%20logomarks) repo: `logo - bluesky.svg`, `logo - blacksky.svg`, `logo - eurosky.svg`. The maintainer announced the repo in [a Bluesky post](https://bsky.app/profile/cozylittle.house/post/3mkius44kyc2h) explicitly framed for "atmosphere landing page and/or refactoring your sign up" — so use is clearly intended — but the repo lacks a LICENSE file, which means the legal terms are still informal. **selfhosted.social has no logo** — its own info page (`https://selfhosted.social/info`) is text-only branded — so it ships with the `_placeholder.svg`. The placeholder also serves as the fallback for any future PDS added to the controller list before its art lands. **Blocker: get explicit permission from `cozylittle.house` before vendoring** — even with the encouraging post, absent a LICENSE file the safe path is a quick DM/reply confirming we can vendor and attribute the SVGs.

3. **ToS / Privacy Policy URLs are hardcoded alongside each PDS entry** (same controller const). Same reasoning as Decision 1 — a curated short list makes runtime fetching of metadata more complex than valuable.

4. **"Another PDS" UX:** selecting the card reveals a URL input *inside* the card (matches the screenshot's pattern). The input gets focus when the card is selected; collapsing the card hides it again.

5. **Default selection: Bluesky pre-selected.** Today's UX makes Bluesky the prominent action; this redesign isn't an opportunity to silently change defaults.

6. **Position of Bluesky in the curated list: first.** Pairs naturally with Decision 5; most users see it, click Continue, move on.

7. **Info box copy is dynamic per selected PDS.** Drop today's bottom `<Terms>` from the signup page entirely; the info box replaces it. Copy template: a generic policy paragraph plus a second sentence like `Read {name}'s [Terms of Service] and [Privacy Policy] before continuing.` When "Another PDS" is selected with no URL typed, render only the generic paragraph.

8. **Warning-form behavior on rejection: unchanged.** Today's two-screen flow (warning → click "different service" → chooser reloads) stays. Revisit if real users find it clunky.

---

## Task 1: Backend — define inline PDS list and pass via Inertia props

**Files:**
- Modify: `app/controllers/auth_controller.ts`

- [ ] **Step 1: Add the type and constant to `auth_controller.ts`.**

  Top-of-file (above the controller class):

  ```ts
  type FeaturedPds = {
    id: string          // stable slug; matches the asset filename
    host: string        // URL POSTed to `/oauth/signup` as `input`
    name: string        // display name
    description: string // one-line, ~50 chars
    termsUrl: string
    policyUrl: string
  }

  const FEATURED_PDS: FeaturedPds[] = [
    {
      id: 'bluesky',
      host: 'https://bsky.social',
      name: 'Bluesky',
      description: 'The main Bluesky PDS instance',
      termsUrl: 'https://bsky.social/about/support/tos',
      policyUrl: 'https://bsky.social/about/support/privacy-policy',
    },
    {
      id: 'blacksky',
      host: '<TBD>',
      name: 'Blacksky',
      description: '<one-line description, confirm with team>',
      termsUrl: '<TBD>',
      policyUrl: '<TBD>',
    },
    {
      id: 'eurosky',
      host: '<TBD>',
      name: 'Eurosky',
      description: '<one-line description, confirm with team>',
      termsUrl: '<TBD>',
      policyUrl: '<TBD>',
    },
    {
      id: 'selfhosted',
      host: 'https://selfhosted.social',
      name: 'selfhosted.social',
      description: 'A popular community-run PDS',
      termsUrl: '<TBD>',
      policyUrl: '<TBD>',
    },
  ]
  ```

  The four `<TBD>` placeholders block the implementer until the team confirms the canonical host URLs and policy URLs for Blacksky, Eurosky, and selfhosted.social. Don't ship with placeholders.

- [ ] **Step 2: Pass the list as an Inertia prop.**

  ```ts
  async signup({ inertia }: HttpContext) {
    return inertia.render('chromeless/signup', { featuredPds: FEATURED_PDS })
  }
  ```

- [ ] **Step 3: Smoke test the prop arrives in the page** — open `/signup` in dev, inspect `usePage().props.featuredPds` via React DevTools.

---

## Task 2: Frontend — `PdsCard`, `PdsChooser`, `InfoBox`

**Files:**
- Create: `app/inertia/lib/featured_pds.ts` (frontend type mirror only — backend stays canonical)
- Create: `app/inertia/assets/pds/_placeholder.svg`
- Create: `app/inertia/assets/pds/bluesky.svg` (one per curated PDS)
- Create: `app/inertia/components/signup/pds_card.tsx`
- Create: `app/inertia/components/signup/pds_chooser.tsx`
- Create: `app/inertia/components/signup/info_box.tsx`
- Modify: `app/inertia/components/signupForm.tsx`
- Modify: `app/inertia/pages/chromeless/signup.tsx`

- [ ] **Step 1: Mirror the type frontend-side and add the logo lookup helper.**

  In `inertia/lib/featured_pds.ts`:

  ```ts
  export type FeaturedPds = {
    id: string
    host: string
    name: string
    description: string
    termsUrl: string
    policyUrl: string
  }

  // Eagerly imported so unknown ids fall back to the placeholder cleanly.
  const logos = import.meta.glob('../assets/pds/*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>

  export function pdsLogoSrc(id: string): string {
    return (
      logos[`../assets/pds/${id}.svg`] ??
      logos['../assets/pds/_placeholder.svg']
    )
  }
  ```

  Type duplication with `auth_controller.ts` is intentional — the frontend should never import from backend `app/...` files (per the auto-memory note about lexicon/backend imports). The shape is small and stable; keep both copies in sync by hand.

- [ ] **Step 2: Source and add logo assets.**

  Confirm licensing before vendoring (per Decision 2). Three of the four PDSes have logos in the community [atmologos](https://tangled.org/cozylittle.house/atmologos/tree/main/color%20logomarks) repo:
  - `logo - bluesky.svg` → `inertia/assets/pds/bluesky.svg`
  - `logo - blacksky.svg` → `inertia/assets/pds/blacksky.svg`
  - `logo - eurosky.svg` → `inertia/assets/pds/eurosky.svg`

  **selfhosted.social has no logo** (confirmed text-only on `https://selfhosted.social/info`) — it intentionally ships with the placeholder; no asset to add for that `id`.

  Always add `_placeholder.svg`: a generic, neutral icon used both for selfhosted.social and as a defensive fallback for any future PDS whose art hasn't landed yet. The `pdsLogoSrc` helper from Step 1 resolves IDs to URLs via `import.meta.glob`, so adding (or *not* adding) a per-PDS file is purely a drop-in — no per-file import edits.

- [ ] **Step 3: Build `PdsCard`.**

  ```tsx
  type Props = {
    pds: FeaturedPds
    selected: boolean
    children?: React.ReactNode  // for embedded "Another PDS" input
  }
  ```

  Layout: horizontal flex — logo (~40px square), name (`font-semibold` serif), description (`font-sans text-muted-foreground text-sm`), `Check` icon on the right when `selected`. Border `border-border` default; `border-primary ring-1 ring-primary` when selected (matches our existing Radix patterns). Hover/focus states match `Card` + `ToolbarButton` conventions.

  This is a presentational component — selection state is owned by `PdsChooser`. The card itself is a Radix `RadioGroupItem` rendered as the whole card, not a small radio circle.

- [ ] **Step 4: Build `PdsChooser`.**

  ```tsx
  type Props = {
    items: FeaturedPds[]
    defaultSelectedId?: string  // per Decision 5, defaults to 'bluesky'
    onSubmit: (host: string) => void
  }
  ```

  Internals:
  - Radix `RadioGroup` whose `value` is the selected `id` (string union that includes `'__custom__'` for the "Another PDS" card).
  - Renders a `PdsCard` for each item plus one extra "Another PDS" card with `id='__custom__'`.
  - When `__custom__` is selected, render a controlled `<Input type="url" placeholder="https://your.pds/" />` *inside* the card (per Decision 4); `useEffect` to focus the input on selection.
  - Submit: call `onSubmit(selectedHost)` where `selectedHost` is the chosen item's `host` or the typed URL for `__custom__`. Validate the custom URL on submit (`isAcceptableLinkUri` style — http(s) only, parsable URL).

- [ ] **Step 5: Build `InfoBox`.**

  ```tsx
  type Props = {
    selectedPds: FeaturedPds | null  // null when "Another PDS" is selected with no URL typed yet
  }
  ```

  Renders the violet-bordered notice with the `Info` icon and copy that mirrors the screenshot. When `selectedPds` is non-null, the second paragraph reads `Read {name}'s [Terms of Service] and [Privacy Policy] before continuing.` with anchor tags. When it's null, render only the generic policy paragraph and skip the second one.

  Style: matches the screenshot's pattern — `border border-primary/40 rounded-lg p-4`, info icon left, body text right. Tailwind utility classes only; no custom CSS.

- [ ] **Step 6: Refactor `SignupForm` to use the new chooser.**

  ```tsx
  export function SignupForm({ featuredPds }: { featuredPds: FeaturedPds[] }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>New to the Atmosphere?</CardTitle>
          <CardDescription>
            You'll need to select a Personal Data Server (PDS) to access apps
            on the Atmosphere, such as Bluesky and Questionable.fyi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form route="oauth.signup">
            {({ errors, isProcessing }) => (
              errors?.input?.includes('account creation')
                ? <SignupWarningForm
                    warningMessage={errors.input}
                    previousInput={errors.old_input}
                  />
                : <SignupChooserBody featuredPds={featuredPds} />
            )}
          </Form>
        </CardContent>
      </Card>
    )
  }
  ```

  `SignupChooserBody` wires `PdsChooser` + `InfoBox` together, manages the local "selected PDS" state, and outputs a hidden `<input name="input" value={selectedHost} />` so the existing form post unchanged. A "Learn more about self-hosting" link sits between the chooser and the info box (per the screenshot). Submit button label: "Continue" (cleaner than "Sign up" when the next screen is the PDS's OAuth consent page).

  Per Decision 7, drop `<Terms />` from this page — the info box replaces it.

- [ ] **Step 7: Pass props through `chromeless/signup.tsx`.**

  ```tsx
  export default function SignupPage({ featuredPds }: { featuredPds: FeaturedPds[] }) {
    return (
      <FormLayout>
        <SignupForm featuredPds={featuredPds} />
      </FormLayout>
    )
  }
  ```

- [ ] **Step 8: Manual smoke test on the dev server.**
  - `/signup` renders the new chooser with Bluesky pre-selected (Decision 5).
  - Selecting another card moves the violet border + check; the info box swaps the name and links.
  - Selecting "Another PDS" reveals the URL input; typing a valid URL enables Continue.
  - Typing `ftp://...` or garbage in the custom field surfaces an inline error (reuse the `LinkPopover` pattern? — small helper `isAcceptableLinkUri` from the existing module). Submit is blocked.
  - Submit with Bluesky selected → redirects to Bluesky OAuth (existing flow).
  - Submit with a community PDS → redirects to that PDS's OAuth consent.
  - The warning-form path still works when a PDS rejects creation (Decision 8).
  - Mobile width: cards stack cleanly; the info box doesn't overflow.

- [ ] **Step 9: Run `pnpm typecheck`, `pnpm lint`, `pnpm spell`. All green.**

---

## Task 3: Optional follow-ups (do not implement unless explicitly asked)

- Keyboard nav polish on `RadioGroup` (Arrow keys move selection; Enter submits) — Radix gives most of this, just verify.
- Light skeleton state if backend props ever arrive late (currently they arrive at render, so no need).
- A11y review: ensure each card has a clear label, the info box has `role="note"` or appropriate landmark, and dynamic info-box copy is announced via `aria-live="polite"` if the team wants screen-reader feedback when selection changes.
- Login screen parity — once this lands, the login screen will look stylistically different. Plan a similar (smaller) refresh.
- Long-tail PDS support — instead of a hardcoded `FEATURED_PDS`, fetch a community-curated directory. Out of scope here; this is the obvious next iteration once the chooser is mature.

---

## Verification checklist (run before claiming done)

- [ ] `pnpm --filter @questionable-fyi/app typecheck` clean
- [ ] `pnpm --filter @questionable-fyi/app lint` clean
- [ ] `pnpm spell` clean (or only pre-existing findings — confirm)
- [ ] Manual smoke (Task 2 Step 8) — including Bluesky default, custom URL validation, and warning-form fallback
- [ ] Visual cross-check against the user's reference screenshot (layout/structure parity, our visual language)
- [ ] Confirm the bottom `<Terms>` component is removed from `/signup` only — *not* from anywhere else it might be reused (`grep` first)
- [ ] Add a changeset (minor — user-visible signup redesign) describing the new PDS chooser
