# Richtext Library Unit Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce vitest as the inertia test runner with coverage reporting, and add unit + roundtrip tests for the two pure converters in `inertia/lib/richtext/`. Relocate the React renderer out of `lib/` first so the library boundary is clean.

**Architecture:** vitest reads `vite.config.ts` natively (no separate config file), reusing the existing `~/`, `@/`, `@generated/`, `@lexicons/` aliases. The two converter test suites run in vitest's default node environment — no jsdom needed. `@vitest/coverage-v8` produces text + html reports against `inertia/lib/**`. A new `test:unit` script keeps Japa's existing `test` script for backend usage.

**Tech Stack:** Vitest 4.x, @vitest/coverage-v8, Vite 7, TypeScript 5.9, AT Protocol lexicon (`@atproto/lex` for `utf8Len`), TipTap 3 JSONContent type only.

**Out of scope:** React component tests for the relocated `content.tsx` (follow-up plan — needs jsdom + `@testing-library/react`). CI integration. Editor/toolbar component tests.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Move | `inertia/lib/richtext/render_richtext.tsx` → `inertia/components/richtext/content.tsx` | Relocate React renderer out of pure-logic library |
| Modify | `inertia/components/question.tsx` | Update import path for `RichtextContent` |
| Modify | `vite.config.ts` | Add `test` block (environment, include glob, coverage config) |
| Modify | `package.json` | Add vitest + @vitest/coverage-v8 devDeps; add a `test:unit` script (coverage on by default) |
| Create | `inertia/lib/richtext/__fixtures__/basic.ts` | Paired tiptap + lexicon fixture: two paragraphs of lorem ipsum + two headings + simple marks |
| Create | `inertia/lib/richtext/__fixtures__/kitchen_sink.ts` | Paired tiptap + lexicon fixture exercising every code path and pushing UTF-8 to the edges |
| Create | `inertia/lib/richtext/tiptap_to_lexicon.test.ts` | Unit tests for TipTap → lexicon conversion |
| Create | `inertia/lib/richtext/lexicon_to_tiptap.test.ts` | Unit tests for lexicon → TipTap conversion |
| Create | `inertia/lib/richtext/roundtrip_conversion.test.ts` | Bidirectional fixture-based parity tests |

---

### Task 1: Relocate the renderer

**Files:**
- Move: `inertia/lib/richtext/render_richtext.tsx` → `inertia/components/richtext/content.tsx`
- Modify: `inertia/components/question.tsx`

- [ ] **Step 1: Move the file**

  ```bash
  git mv inertia/lib/richtext/render_richtext.tsx inertia/components/richtext/content.tsx
  ```

  No code changes inside the file are needed — it's self-contained (190 lines, single export `RichtextContent`).

- [ ] **Step 2: Update the only import site**

  In `inertia/components/question.tsx` line 6, change:

  ```tsx
  import { RichtextContent } from '~/lib/richtext/render_richtext'
  ```

  To:

  ```tsx
  import { RichtextContent } from '~/components/richtext/content'
  ```

- [ ] **Step 3: Verify no other importers**

  Run `grep -r render_richtext inertia/` from `app/` — should return no matches.

- [ ] **Step 4: Verify**
  - `pnpm typecheck` passes.
  - port 3333 — dev server is running: load a question detail page; rendered richtext still appears.

---

### Task 2: Install vitest tooling

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add devDependencies**

  Run from `app/`:

  ```bash
  pnpm add -D vitest @vitest/coverage-v8
  ```

  These should land alongside the existing Vite 7 pin at `package.json:72`.

- [ ] **Step 2: Add scripts**

  Append to the `scripts` block in `app/package.json` (the existing `"test": "node ace test"` at line 17 stays — it runs Japa for backend code):

  ```json
  "test:unit": "vitest --coverage",
  ```

  vitest auto-detects TTY: it runs once-and-exits in CI/non-interactive contexts and stays in watch mode when run interactively. `--coverage` keeps coverage reporting on by default; pass `--no-coverage` ad hoc when running large suites locally if it slows the loop.

- [ ] **Step 3: Verify**
  - `pnpm install` succeeds; lockfile updates.
  - `pnpm test:unit` runs and reports "no test files found" (expected at this stage).

---

### Task 3: Configure vitest in vite.config.ts

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add the `test` block**

  In `app/vite.config.ts`, add a `test` field to the `defineConfig({...})` object (vitest augments Vite's config type; no separate import required as long as vitest is installed). Place it after `resolve` and before `server`:

  ```ts
  test: {
    environment: 'node',
    include: ['inertia/**/*.test.ts', 'inertia/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['inertia/lib/**/*.{ts,tsx}'],
    },
  },
  ```

  The existing `resolve.alias` block (lines 19-26) is automatically reused by vitest, so test files can use `~/`, `@/`, `@generated/`, `@lexicons/` without extra config.

- [ ] **Step 2: Verify**
  - `pnpm typecheck` still passes.
  - `pnpm test:unit` still finds no tests (until Task 4).

---

### Task 4: Generate paired test fixtures

**Files:**
- Create: `inertia/lib/richtext/__fixtures__/basic.ts`
- Create: `inertia/lib/richtext/__fixtures__/kitchen_sink.ts`

Each fixture file exports a paired `tiptap` + `lexicon` constant representing the same document in both forms. Downstream test tasks consume these as inputs and expected outputs, so test logic stays focused on the assertion rather than data-shape construction. The `__fixtures__/` folder convention also makes it easy to exclude from coverage scope later if needed.

Use `utf8Len` from `@atproto/lex` (already a dependency) when computing facet `byteStart`/`byteEnd` values — never hand-count bytes. Type fixtures with `JSONContent` from `@tiptap/react` and the lexicon shapes inferred from `tiptap_to_lexicon.ts`'s internal types (consider exporting those from the converter module if useful for fixture typing).

- [ ] **Step 1: Basic fixture (formatting only, ASCII-only)**

  Create `inertia/lib/richtext/__fixtures__/basic.ts` exporting `basicTiptap` and `basicLexicon`. Keep the content deliberately simple to isolate formatting concerns from UTF-8 concerns:
  - An h2 heading and an h3 heading.
  - Two paragraphs of lorem ipsum (~30 words each).
  - One bold span, one italic span, one link — distributed across the paragraphs.
  - All text is ASCII so byte length equals character length.

  This fixture is the "happy path" baseline: if it fails, something fundamental is broken.

- [ ] **Step 2: Kitchen sink fixture (every code path, edge UTF-8)**

  Create `inertia/lib/richtext/__fixtures__/kitchen_sink.ts` exporting `kitchenSinkTiptap` and `kitchenSinkLexicon`. The document should exercise every branch in both converters:
  - Headings at level 2 and level 3, with the level-2 heading carrying bold + italic marks across multi-byte characters.
  - A paragraph with overlapping/adjacent runs covering every supported mark: bold, italic, underline, strikethrough, inline code, highlight, and link — including a run that has multiple marks at once (single facet, multiple features).
  - A paragraph containing a `hardBreak` node (forces the `\n` + byte-offset advance at `tiptap_to_lexicon.ts:90`).
  - A `blockquote` containing both a paragraph and a heading (forces the `flatMap` flattening at line 143).
  - A `codeBlock` with `language: "ts"` and a separate `codeBlock` with no language attribute (covers the conditional at line 160).
  - A `bulletList` whose second item contains a nested `orderedList` (covers the lines 174-177 nested-list branch in forward conversion and the lines 107-109 unwrapped-nested branch in reverse).
  - A standalone `orderedList` with three items.
  - A `horizontalRule`.
  - **UTF-8 stress paragraph:** a single paragraph mixing ASCII + 2-byte accented chars (e.g. `"café"`) + 4-byte emoji (e.g. `"👋"`) + 3-byte CJK (e.g. `"日"`), with a bold span and a link span that each cross multi-byte boundaries. Byte offsets must be computed via `utf8Len`, never hand-counted.

  Add a brief comment header in the file mapping each section of the document to the converter code paths it covers, so future contributors know what they'd break by removing parts.

- [ ] **Step 3: Verify the fixture lexicons against the schema**

  Add a small `__fixtures__/fixtures.test.ts` that imports the AT Protocol lexicon validator and asserts both fixture lexicons pass schema validation:

  ```ts
  import { describe, it, expect } from 'vitest'
  import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
  import { basicLexicon } from './basic'
  import { kitchenSinkLexicon } from './kitchen_sink'

  describe('fixture lexicons', () => {
    it.each([
      ['basic', basicLexicon],
      ['kitchen sink', kitchenSinkLexicon],
    ])('%s validates against fyi.questionable.richtext.content', (_name, lexicon) => {
      const result = $safeValidate(lexicon)
      expect(result.success).toBe(true)
    })
  })
  ```

  This guards against drift in either direction: if the lexicon schema tightens, fixtures break here; if a fixture is malformed by hand-editing, it can't poison the conversion tests below.

- [ ] **Step 4: Verify**
  - `pnpm typecheck` passes — fixtures should be fully typed against `JSONContent` and the lexicon shape.
  - `pnpm test:unit` passes — fixture validation succeeds.

---

### Task 5: Write tests for `tiptap_to_lexicon.ts`

**Files:**
- Create: `inertia/lib/richtext/tiptap_to_lexicon.test.ts`

- [ ] **Step 1: Set up the test file skeleton**

  ```ts
  import { describe, it, expect } from 'vitest'
  import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
  import { tiptapToLexicon } from './tiptap_to_lexicon'
  import { basicTiptap, basicLexicon } from './__fixtures__/basic'
  import { kitchenSinkTiptap, kitchenSinkLexicon } from './__fixtures__/kitchen_sink'
  ```

  Use explicit imports (no `globals: true`) so ESLint and TypeScript see the symbols without extra config. The lexicon validator (`$safeValidate`) is used in step 7 to assert every produced lexicon is schema-valid, not just structurally equal to a fixture.

- [ ] **Step 2: Cover each block type**

  Reference: `tiptap_to_lexicon.ts:119` (`convertNode`). One `describe` per node type.
  - `paragraph` → `text` block; with and without facets.
  - `heading` with `attrs.level = 2` and `level = 3`; verify default-to-2 path (line 135).
  - `blockquote` with mixed children (paragraph + heading) → confirms `flatMap` flattening at line 143.
  - `codeBlock` with and without `attrs.language` (line 160 conditional).
  - `bulletList` and `orderedList`, both empty and with items.
  - **Nested list** (bulletList containing bulletList directly, no listItem wrapper) — TipTap's actual structure per lines 174-177.
  - `horizontalRule`.
  - `hardBreak` inside paragraph → adds `\n` and advances byte offset by 1 (line 90).

- [ ] **Step 3: Cover each mark type**

  Reference: `markToFeature` at lines 29-48. Cover bold, italic, underline, strike, code, highlight, link (with `uri` attr).
  - Multiple marks on the same text node → single facet with multiple features.
  - Unknown mark type → silently dropped (returns `null`, line 46).

- [ ] **Step 4: UTF-8 byte offset tests (critical)**

  Use `utf8Len` from `@atproto/lex` (already a dependency) inside the test to compute expected byte offsets, so tests fail closed if production drifts.
  - Text with accented char (2-byte): `"héllo"` — confirm `byteEnd: 6`, not `5`.
  - Text with emoji (4-byte): `"hi 👋"` — confirm `byteEnd: 7`.
  - Bold span across multi-byte chars — `byteStart`/`byteEnd` align with character boundaries.

- [ ] **Step 5: Empty-input edge cases**
  - Empty paragraph → filtered by `isEmptyBlock` (line 198).
  - Document with no `content` field.
  - Text node with empty string `text: ""` (line 67 length-0 guard).

- [ ] **Step 6: Fixture-level integration assertions**

  Add two tests that operate on the whole fixtures rather than individual nodes:
  - `expect(tiptapToLexicon(basicTiptap)).toEqual(basicLexicon)`
  - `expect(tiptapToLexicon(kitchenSinkTiptap)).toEqual(kitchenSinkLexicon)`

  These catch any regression that the granular tests miss — e.g. interaction effects between adjacent nodes, ordering bugs, or accidental empty-block injection.

- [ ] **Step 7: Lexicon schema validation**

  For each `it()` case in this file, run `$safeValidate(produced)` on the conversion output and assert `result.success === true`. The cleanest pattern is a small helper inside the test file:

  ```ts
  function expectValidLexicon(value: unknown) {
    const result = $safeValidate(value)
    expect(result.success, JSON.stringify(result, null, 2)).toBe(true)
  }
  ```

  Then call `expectValidLexicon(tiptapToLexicon(input))` after the structural assertion in every test. This catches malformed outputs that happen to deep-equal a flawed expected fixture (defense in depth) and surfaces lexicon schema changes immediately.

- [ ] **Step 8: Verify**
  - `pnpm test:unit` shows all `tiptap_to_lexicon.test.ts` cases passing.
  - Use literal `expect(...).toEqual(...)` matchers — no snapshots.

---

### Task 6: Write tests for `lexicon_to_tiptap.ts`

**Files:**
- Create: `inertia/lib/richtext/lexicon_to_tiptap.test.ts`

- [ ] **Step 0: Set up the test file skeleton**

  ```ts
  import { describe, it, expect } from 'vitest'
  import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
  import { lexiconToTiptap } from './lexicon_to_tiptap'
  import { basicTiptap, basicLexicon } from './__fixtures__/basic'
  import { kitchenSinkTiptap, kitchenSinkLexicon } from './__fixtures__/kitchen_sink'
  ```

  Validate every test's *input* lexicon with `$safeValidate` before passing it to `lexiconToTiptap` — this prevents tests from accidentally documenting behavior on inputs the lexicon schema would reject in production.

- [ ] **Step 1: Cover each lexicon block type**

  Reference: `lexicon_to_tiptap.ts:76` (`convertBlock`).
  - `text` → `paragraph` (with and without facets).
  - `header` → `heading` with correct `level`.
  - `blockquote` with empty `items` → empty content.
  - `code` with and without `language` (line 101 conditional).
  - `list` (ordered + unordered).
  - `list` with a nested `list` as direct item (no wrapper) → recurses via lines 107-109.
  - `horizontalRule`.

- [ ] **Step 2: Cover facet handling**
  - Each feature `$type` → correct mark (mirror of Task 5 step 3).
  - Plaintext with no facets → single text node (lines 30-32).
  - Plaintext with leading/middle/trailing gaps between facets → gap text nodes created (lines 43-45, 56-58).
  - **Sorting:** facets supplied in non-byte-order → output is byte-ordered (line 35).
  - Unknown facet `$type` → filtered out (line 72 + line 50 filter).

- [ ] **Step 3: UTF-8 byte slice tests (critical)**

  Build fixtures where facet `byteStart`/`byteEnd` land on multi-byte boundaries; verify `TextDecoder` produces correct strings, not malformed mojibake. Useful boundary cases: facet starts after an emoji, facet ends mid-emoji range (should land on a char boundary in valid lexicon data).

- [ ] **Step 4: Edge cases**
  - Empty `items` array.
  - Unknown block `$type` → filtered out (line 124 + line 134).
  - Facet with empty `features` array → text node with no marks.

- [ ] **Step 5: Fixture-level integration assertions**

  - `expect(lexiconToTiptap(basicLexicon)).toEqual(basicTiptap)`
  - `expect(lexiconToTiptap(kitchenSinkLexicon)).toEqual(kitchenSinkTiptap)`

- [ ] **Step 6: Verify**
  - `pnpm test:unit` shows all `lexicon_to_tiptap.test.ts` cases passing.

---

### Task 7: Roundtrip parity tests

**Files:**
- Create: `inertia/lib/richtext/roundtrip_conversion.test.ts`

Use the paired fixtures from Task 4 as inputs — they're already designed to exercise the full conversion surface, so the roundtrip tests don't need to define their own fixtures. Both directions should also schema-validate the lexicon at the appropriate stage.

- [ ] **Step 1: Forward roundtrip (Lexicon → TipTap → Lexicon)**

  ```ts
  it.each([
    ['basic', basicLexicon],
    ['kitchen sink', kitchenSinkLexicon],
  ])('%s survives lexicon → tiptap → lexicon', (_name, fixture) => {
    const result = tiptapToLexicon(lexiconToTiptap(fixture))
    expect(result).toEqual(fixture)
    expect($safeValidate(result).success).toBe(true)
  })
  ```

- [ ] **Step 2: Reverse roundtrip (TipTap → Lexicon → TipTap)**

  Same coverage in reverse using `basicTiptap` and `kitchenSinkTiptap`. Validate the intermediate lexicon (`tiptapToLexicon(input)`) before converting it back. Document any known asymmetries as comments — for example, blockquote's derived `plaintext` field may not match exactly when reconstructed; if so, narrow the assertion or normalize before comparing.

- [ ] **Step 3: Verify**
  - `pnpm test:unit` passes; the coverage report shows ≥85% line coverage on `inertia/lib/richtext/tiptap_to_lexicon.ts` and `lexicon_to_tiptap.ts`.

---

### Task 8: Final verification

- [ ] `pnpm test:unit` — all suites green; coverage report generated, spot-check converters.
- [ ] `pnpm typecheck` — no regressions.
- [ ] `pnpm lint` — clean (vitest globals not used, so no config changes expected).
- [ ] `pnpm format:check` — clean.
- [ ] Smoke test in browser at `pnpm dev` (port 3333 — ask before starting): submit a question via the ask form (exercises `tiptapToLexicon`); load a question detail page (exercises the relocated `content.tsx`).

---

## Reused utilities

- `utf8Len` from `@atproto/lex` (already imported at `tiptap_to_lexicon.ts:1`) — also used inside fixtures and tests for computing expected byte offsets.
- `$safeValidate` (and `$validate`) from `@lexicons/fyi/questionable/richtext/content` — generated AT Protocol lexicon validator. Used in fixtures and converter tests to assert produced lexicons conform to `fyi.questionable.richtext.content`. Importing from `@lexicons/...` works in tests because vitest inherits the `@lexicons` alias from `vite.config.ts:24`.
- `vite.config.ts` resolve aliases at lines 19-26 — vitest reuses them, no duplication.
- TipTap's `JSONContent` type from `@tiptap/react` — type-only import in tests and fixtures for shape typing.
