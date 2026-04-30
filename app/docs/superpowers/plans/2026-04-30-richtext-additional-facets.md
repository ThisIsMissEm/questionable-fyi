# Richtext: Additional Facet Support Plan (subscript, superscript, abbr)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire three new facet features that the lexicon now supports — `subscript`, `superscript`, and `abbr` — through the editor (TipTap extensions + toolbar UI), both richtext converters (`lexicon_to_tiptap`, `tiptap_to_lexicon`), and the read-side React renderer (`content.tsx`). After this lands, a user can format text as sub/super/abbr in the editor, the document round-trips through the lexicon, and the read view renders correctly with the right semantic HTML (`<sub>`, `<sup>`, `<abbr title="…">`).

**Prior context:**
- The lexicon at `lexicons/src/fyi/questionable/richtext/facet.json` already exports `#subscript`, `#superscript`, and `#abbr`. `#abbr` carries a required `title` string (5–300 chars). Other facets (`#bold`, `#italic`, `#underline`, `#strikethrough`, `#code`, `#highlight`, `#link`, `#mention`) are already wired end-to-end.
- The editor uses `StarterKit` (with `link: false` since we shipped link hardening) plus `Underline`, `Highlight`, `Link`, and `Placeholder`. No `Subscript`, `Superscript`, or `Abbr` extension is registered.
- The toolbar exposes bold, italic, underline, strikethrough, inline code, link, style select, lists/blockquote/code-block, and horizontal rule. No sub/super/abbr buttons.
- `lexicon_to_tiptap.ts:113-119` (`featureToMark`) and `tiptap_to_lexicon.ts:30-46` (`markToFeature`) both have plain `switch` statements that only know about the existing facet/mark names.
- `content.tsx`'s `wrapWithFeature` (lines 105-129) similarly only handles the existing facets.
- The `__fixtures__/basic.ts` and `__fixtures__/kitchen_sink.ts` paired fixtures don't exercise the new facets yet.

**Architecture:**
- **subscript / superscript** are official TipTap extensions (`@tiptap/extension-subscript`, `@tiptap/extension-superscript`). Standard mark types — no custom code beyond install + register.
- **abbr** has no official TipTap extension. Build a small custom mark via `Mark.create({ name: 'abbr', addAttributes: { title }, parseHTML, renderHTML })` in `inertia/components/richtext/extensions/abbr.ts`. The mark renders as `<abbr title="…">` and stores the title as a mark attribute. Includes a serializer command (`setAbbr`/`unsetAbbr`/`toggleAbbr`).
- **Converters** gain three new switch cases each. For sub/super the mapping is trivial (no attrs). For abbr, the title travels: `tiptap_to_lexicon` reads `mark.attrs?.title` and writes it to the facet feature; `lexicon_to_tiptap` reads `feature.title` and writes it to the mark attrs.
- **content.tsx** gains three new cases in `wrapWithFeature` rendering `<sub>`, `<sup>`, and `<abbr title={feature.title}>` respectively.
- **Toolbar** gets two simple toggle buttons (sub, super — added to the existing mark toggle group or a new sub-group) and a small `AbbrPopover` patterned after `LinkPopover` (input for the title; applies via the editor command; validates 5–300 char range to match the lexicon).

**Tech Stack:** TipTap 3 (`@tiptap/react`, plus the two new extensions), Lucide icons (`Subscript`, `Superscript`, `WholeWord` or similar for abbr), Radix UI Popover (already in use), the existing converter and renderer modules.

**Out of scope:**
- Blockquote richtext refactor. The lexicon was changed to allow nested richtext blocks inside blockquotes (was plaintext-only); that's a structural change that touches both converters and the renderer in different ways from facets, and warrants its own plan.
- The `bskyPost` → `blueskyPost` rename. That's an embed/content-type change, not a facet — separate concern.
- Wiring the existing `#mention` facet through the editor and converters. It's already in `content.tsx` for read-side rendering but neither converter knows about it; that's a pre-existing gap unrelated to *these* new facets and deserves its own pass.
- Localization of toolbar titles / aria-labels.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `app/package.json` | Add `@tiptap/extension-subscript` and `@tiptap/extension-superscript` |
| Create | `inertia/components/richtext/extensions/abbr.ts` | Custom TipTap `Mark` with a `title` attribute |
| Modify | `inertia/components/richtext/editor.tsx` | Register Subscript, Superscript, Abbr extensions |
| Modify | `inertia/components/richtext/toolbar.tsx` | Add sub/super toggles; mount `<AbbrPopover>` |
| Create | `inertia/components/richtext/abbr_popover.tsx` | Popover with a title input, applies abbr mark to the current selection (mirrors `LinkPopover`'s structure) |
| Modify | `inertia/lib/richtext/lexicon_to_tiptap.ts` | Three new cases in `featureToMark`; thread `title` for abbr |
| Modify | `inertia/lib/richtext/tiptap_to_lexicon.ts` | Three new cases in `markToFeature`; read `title` from abbr mark attrs |
| Modify | `inertia/components/richtext/content.tsx` | Three new cases in `wrapWithFeature` |
| Modify | `inertia/lib/richtext/lexicon_to_tiptap.test.ts` | Add tests for sub/super/abbr conversion |
| Modify | `inertia/lib/richtext/tiptap_to_lexicon.test.ts` | Same, in the inverse direction |
| Modify | `inertia/lib/richtext/__fixtures__/kitchen_sink.ts` | Extend the kitchen-sink fixture to include all three new facets so the roundtrip test exercises them |

---

## Decisions (locked in; recorded for context)

1. **Use official `@tiptap/extension-subscript` and `@tiptap/extension-superscript`.** Custom mark extensions for these would just reimplement what the official packages already do (including default keyboard shortcuts `Mod+,` for sub and `Mod+.` for super). Stay official unless there's a real need.

2. **Build `Abbr` as a small custom mark in this repo** rather than pulling in a community extension. The mark is ~30 lines (`Mark.create` with one attribute) and security-relevant via the `title` attribute — keeping it in-repo lets us own the parseHTML/renderHTML and any future input-sanitization.

3. **`AbbrPopover` mirrors `LinkPopover`'s pattern** — toolbar button trigger, Radix `Popover`, single input for the title, error UI for validation. Title is required and must be 5–300 chars per the lexicon. Empty input on apply with an existing abbr → `unsetAbbr` (matches `LinkPopover`'s "empty URL → unsetLink" behavior). Empty input on apply with no existing abbr → no-op + close.

4. **Abbr requires a non-empty selection.** When the toolbar button is clicked with an empty selection, the popover still opens but applying with no selection is a no-op — TipTap's `setMark` won't apply to a zero-width range. The toolbar button is dimmed (via `disabled`) when the selection is empty, mirroring how some editors disable Bold for an empty caret.

5. **Abbr title length validation lives in the popover.** `normalizeAbbrInput(rawTitle)` (or inline state validation in the popover) enforces 5–300 chars; the lexicon enforces the same, but UX-side validation gives users immediate feedback instead of a save-time failure. Mirrors how the existing link toolbar surfaces inline errors.

6. **Subscript and superscript are mutually exclusive in our toolbar UX** — toggling one when the other is active replaces it. TipTap's official extensions handle this internally via `excludes`, so no extra wiring needed; just rely on it and verify in manual testing.

7. **Keyboard shortcuts:** keep TipTap's defaults (`Mod+,` sub, `Mod+.` super). For Abbr, no shortcut — it requires a title input, so a keyboard-only flow doesn't make sense.

---

## Task 1: Install and wire `Subscript` + `Superscript`

**Files:**
- Modify: `app/package.json` (deps)
- Modify: `app/inertia/components/richtext/editor.tsx`
- Modify: `app/inertia/components/richtext/toolbar.tsx`
- Modify: `app/inertia/lib/richtext/lexicon_to_tiptap.ts`
- Modify: `app/inertia/lib/richtext/tiptap_to_lexicon.ts`
- Modify: `app/inertia/components/richtext/content.tsx`
- Modify: tests + fixtures

- [ ] **Step 1: Install the official extensions.**

  ```bash
  pnpm --filter @questionable-fyi/app add @tiptap/extension-subscript @tiptap/extension-superscript
  ```

- [ ] **Step 2: Register in `editor.tsx`.**

  ```ts
  import Subscript from '@tiptap/extension-subscript'
  import Superscript from '@tiptap/extension-superscript'
  // …in extensions array, alongside Underline / Highlight:
  Subscript,
  Superscript,
  ```

- [ ] **Step 3: Add the cases to `featureToMark` in `lexicon_to_tiptap.ts`.**

  ```ts
  case 'fyi.questionable.richtext.facet#subscript': return { type: 'subscript' }
  case 'fyi.questionable.richtext.facet#superscript': return { type: 'superscript' }
  ```

- [ ] **Step 4: Add the cases to `markToFeature` in `tiptap_to_lexicon.ts`.**

  ```ts
  case 'subscript':
    return { $type: 'fyi.questionable.richtext.facet#subscript' }
  case 'superscript':
    return { $type: 'fyi.questionable.richtext.facet#superscript' }
  ```

- [ ] **Step 5: Render `<sub>` / `<sup>` in `content.tsx`'s `wrapWithFeature`.**

  ```tsx
  case 'fyi.questionable.richtext.facet#subscript':
    return <sub key={`sub-${key}`}>{node}</sub>
  case 'fyi.questionable.richtext.facet#superscript':
    return <sup key={`sup-${key}`}>{node}</sup>
  ```

- [ ] **Step 6: Add toolbar toggles.**

  Extend `MARK_KEYS` in `toolbar.tsx` to include `'subscript'` and `'superscript'` (or add a small second toggle group if visual grouping makes more sense). Wire `markCommands.subscript = () => editor.chain().focus().toggleSubscript().run()` and similarly for super. Pull `Subscript` and `Superscript` from `lucide-react`. Confirm Decision 6 (mutual exclusion) holds visually.

- [ ] **Step 7: Add converter unit tests.**

  In `lexicon_to_tiptap.test.ts`, add cases:
  - subscript-only facet → text node with `marks: [{ type: 'subscript' }]`
  - superscript-only facet → text node with `marks: [{ type: 'superscript' }]`
  - subscript + bold combined → both marks present

  Mirror the inverse cases in `tiptap_to_lexicon.test.ts`.

- [ ] **Step 8: Extend `__fixtures__/kitchen_sink.ts` to include sub and super in both directions** (paired tiptap + lexicon shapes), so the roundtrip test covers them.

- [ ] **Step 9: Run typecheck, lint, spell, vitest. All green.**

- [ ] **Step 10: Manual smoke test on the dev server (port 3333; ask user to start if not running).**
  - Select text, click the subscript button → text drops to subscript visually.
  - Click superscript with sub active → super replaces sub (Decision 6).
  - Save the question, reload — formatting persists.

---

## Task 2: Build the `Abbr` mark + toolbar popover

**Files:**
- Create: `app/inertia/components/richtext/extensions/abbr.ts`
- Create: `app/inertia/components/richtext/abbr_popover.tsx`
- Modify: `app/inertia/components/richtext/editor.tsx`
- Modify: `app/inertia/components/richtext/toolbar.tsx`
- Modify: `app/inertia/lib/richtext/lexicon_to_tiptap.ts`
- Modify: `app/inertia/lib/richtext/tiptap_to_lexicon.ts`
- Modify: `app/inertia/components/richtext/content.tsx`
- Modify: tests + fixtures

- [ ] **Step 1: Build `Abbr` mark in `extensions/abbr.ts`.**

  ```ts
  import { Mark, mergeAttributes } from '@tiptap/core'

  declare module '@tiptap/core' {
    interface Commands<ReturnType> {
      abbr: {
        setAbbr: (attrs: { title: string }) => ReturnType
        toggleAbbr: (attrs: { title: string }) => ReturnType
        unsetAbbr: () => ReturnType
      }
    }
  }

  export const Abbr = Mark.create({
    name: 'abbr',
    addAttributes() {
      return {
        title: {
          default: null,
          parseHTML: (el) => el.getAttribute('title'),
          renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
        },
      }
    },
    parseHTML() {
      return [{ tag: 'abbr[title]' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['abbr', mergeAttributes(HTMLAttributes), 0]
    },
    addCommands() {
      return {
        setAbbr: (attrs) => ({ commands }) => commands.setMark(this.name, attrs),
        toggleAbbr: (attrs) => ({ commands }) => commands.toggleMark(this.name, attrs),
        unsetAbbr: () => ({ commands }) => commands.unsetMark(this.name),
      }
    },
  })
  ```

  Notes: titles are rendered into the DOM via `mergeAttributes`, which already escapes — no manual sanitization needed. The 5–300 char range is enforced at the *popover* boundary (Decision 5), not in the mark itself, so the lexicon validator and the editor agree on the rule.

- [ ] **Step 2: Register `Abbr` in `editor.tsx` alongside Subscript/Superscript.**

- [ ] **Step 3: Build `AbbrPopover` in `abbr_popover.tsx`.**

  Pattern after `LinkPopover`:
  - `useEditorState` to read `isActive('abbr')` and the current title attr.
  - Single `<Input>` for the title; min 5, max 300; show inline error via `role="alert"` if out of range.
  - On apply: `editor.chain().focus().setAbbr({ title }).run()` (or `unsetAbbr` if input is empty and an abbr is currently active).
  - Disable the trigger button when the editor selection is empty (Decision 4).
  - Lucide icon: `WholeWord` or `Type` — pick whichever reads as "abbreviation" most clearly during manual testing.

- [ ] **Step 4: Mount `<AbbrPopover editor={editor} />` in `toolbar.tsx`** next to `<LinkPopover>`. Update `useEditorState` to also include `isActive('abbr')` for active-state styling.

- [ ] **Step 5: Add the converter cases.**

  `lexicon_to_tiptap.ts` `featureToMark`:

  ```ts
  case 'fyi.questionable.richtext.facet#abbr':
    return typeof feature.title === 'string'
      ? { type: 'abbr', attrs: { title: feature.title } }
      : null
  ```

  Update the `Facet` feature type in this file (and in `tiptap_to_lexicon.ts`) to include `title?: string`.

  `tiptap_to_lexicon.ts` `markToFeature`:

  ```ts
  case 'abbr': {
    const title = mark.attrs?.title
    if (typeof title !== 'string') return null
    return { $type: 'fyi.questionable.richtext.facet#abbr', title }
  }
  ```

- [ ] **Step 6: Render `<abbr title={…}>` in `content.tsx`'s `wrapWithFeature`.**

  ```tsx
  case 'fyi.questionable.richtext.facet#abbr': {
    const title = typeof feature.title === 'string' ? feature.title : undefined
    return title
      ? <abbr key={`abbr-${key}`} title={title}>{node}</abbr>
      : node  // defensive: bare-text fallback if title is missing
  }
  ```

  Update the local `Facet` feature shape to include `title?: string`.

- [ ] **Step 7: Add converter unit tests.**

  In `lexicon_to_tiptap.test.ts`:
  - abbr facet with valid title → text node with `marks: [{ type: 'abbr', attrs: { title: '…' } }]`
  - abbr facet without title → mark dropped (defensive)
  - abbr + bold combined → both marks present

  Inverse in `tiptap_to_lexicon.test.ts` — note that abbr marks without a title shouldn't produce a facet feature, since the lexicon requires it.

- [ ] **Step 8: Extend `__fixtures__/kitchen_sink.ts` to include abbr** in both shapes for roundtrip coverage.

- [ ] **Step 9: Run typecheck, lint, spell, vitest. All green.**

- [ ] **Step 10: Manual smoke test.**
  - Select text "DOM", click the abbr button → popover opens, type "Document Object Model", apply → text becomes `<abbr title="Document Object Model">DOM</abbr>` (hover shows the title).
  - Selection empty → button is disabled.
  - Title shorter than 5 chars → inline error, popover stays open.
  - Existing abbr selected → popover opens with current title pre-filled; clearing and applying removes the abbr.
  - Save & reload → formatting persists.

---

## Task 3: Optional follow-ups (do not implement unless explicitly asked)

- Wire the existing `#mention` facet through both converters. It currently renders in `content.tsx` but neither `lexicon_to_tiptap` nor `tiptap_to_lexicon` knows about it, so a mention round-trip via the editor would silently drop the facet on save.
- Blockquote richtext refactor — the lexicon now allows nested richtext blocks in blockquotes (was plaintext-only). Touches both converters and the renderer in structural ways; needs its own plan.
- Keyboard shortcut for abbr (e.g., `Mod+Shift+A`) once we know users want one.

---

## Verification checklist (run before claiming done)

- [ ] `pnpm --filter @questionable-fyi/app typecheck` clean
- [ ] `pnpm --filter @questionable-fyi/app lint` clean
- [ ] `pnpm spell` clean (or only pre-existing findings — confirm)
- [ ] `pnpm --filter @questionable-fyi/app exec vitest run inertia/lib/richtext` clean — includes the new sub/super/abbr cases plus the extended kitchen-sink roundtrip
- [ ] Manual smoke tests for sub, super, and abbr (Task 1 Step 10, Task 2 Step 10) — including round-trip-through-save
- [ ] Add a changeset (minor — three new user-visible features) describing the new formatting options
