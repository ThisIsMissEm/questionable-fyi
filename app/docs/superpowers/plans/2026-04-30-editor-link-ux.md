# Richtext Editor: Link Click UX Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user clicks or places the caret inside an existing link in the editor, show a floating panel anchored to that link with two affordances — "Visit" (opens the URL in a new tab) and "Edit" (opens an inline form with separate fields for the visible text and the destination URL). Today the editor has `openOnClick: false` on the Link extension, which silently no-ops on link clicks; there's no signal the link exists or way to act on it without going through the toolbar's separate `LinkPopover`.

**Prior context (already shipped on this branch):**
- `link_sanitization.ts` exports `canonicalHttpUri`, `isAcceptableLinkUri`, and `presentLink`. Non-http(s) URIs are rejected at render time, on autolink/paste, and on `setLink`/`toggleLink`.
- The toolbar `LinkPopover` validates with `isAcceptableLinkUri`, surfaces an inline error, and prepends `https://` when the user types a URL without a scheme.
- The Link extension is configured with `openOnClick: false`, `defaultProtocol: 'https'`, `isAllowedUri`, and `shouldAutoLink`. StarterKit's bundled `link` is disabled so our standalone configure is the sole registration.

**Architecture:** A new `LinkBubbleMenu` component observes the editor's selection state, detects when the active mark is a link, resolves the corresponding `<a>` DOM element via `editor.view.domAtPos`, and renders a Radix `Popover` (already in the codebase) anchored to that element. View mode shows two affordances — "Visit" (a real `<a target="_blank" rel="noopener noreferrer">` for accessibility) and "Edit" (toggles to an inline form).

To keep the toolbar popover and the bubble menu honest about applying the *same* validation/prefix/edit semantics:
- `LinkEditForm` — the input + error UI + apply/cancel form, parameterized by whether to show a visible-text input. Takes the `editor` instance and runs the TipTap chain internally on apply (`setLink` when only URL changed, `insertContent` with the link mark when text changed). Both shells consume it.
- `normalizeLinkInput(rawHref, rawText?)` — added to `link_sanitization.ts` as a pure function: handles `https://` prefix and validation, returning `{ ok: true, href, text? }` or `{ ok: false, error }`. Unit-testable next to `isAcceptableLinkUri`.

`LinkPopover` (toolbar) and `LinkBubbleMenu` (caret-anchored) both render `LinkEditForm` with appropriate flags. The shells stay separate because their container behavior differs in real ways (button trigger vs. caret-driven anchor; the bubble's view-mode "Visit" affordance has no analogue in the toolbar).

**Tech Stack:** TipTap 3 (`@tiptap/react`), Radix UI Popover (already a dep), Lucide icons (`lucide-react`), the shared `link_sanitization` module.

**Out of scope:**
- Hover-based link previews — click/caret-triggered popover only.
- Mention bubble menus — only links.
- Bulk link auditing UI.
- React component test infrastructure (`jsdom` + `@testing-library/react`) — currently no editor UI tests exist; `LinkEditForm` is exercised manually, but `normalizeLinkInput` is unit-tested directly.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `inertia/lib/richtext/link_sanitization.ts` | Add `normalizeLinkInput` (pure) next to `isAcceptableLinkUri` |
| Modify | `inertia/lib/richtext/link_sanitization.test.ts` | Extend with `normalizeLinkInput` tests (validation, https-prefix, error shape) |
| Create | `inertia/components/richtext/link_edit_form.tsx` | Reusable edit form: URL textarea, optional text input, error state, apply/cancel; runs the TipTap chain internally on apply |
| Modify | `inertia/components/richtext/link_popover.tsx` | Refactor to embed `LinkEditForm` (drop the duplicated normalization/validation/error logic) |
| Create | `inertia/components/richtext/link_bubble_menu.tsx` | New floating panel anchored to the active link element — Visit + Edit (text & URL) actions |
| Modify | `inertia/components/richtext/editor.tsx` | Mount `<LinkBubbleMenu>` alongside `<EditorContent>` |

---

## Decisions (locked in; recorded for context)

1. **Trigger:** caret-in-link only. Standard TipTap pattern, mirrors Notion / Linear; click already moves the caret so this implicitly covers click. No hover.

2. **Edit form is text + URL, with nested marks dropped on text rewrite.** Bubble menu's edit form has two inputs: visible text and destination URL. When the user changes the visible text, the apply path uses `insertContent` with only the link mark on the new text — surrounding non-link marks within the slice (bold/italic/etc.) are dropped. Walking nodes to reapply nested marks is meaningfully more code; revisit if it surprises real users.

3. **Cleared visible-text on apply: block with error.** Clearing the text field and pressing Apply does *not* silently `unsetLink` — it surfaces a validation error. Accidental data loss is worse than the small extra friction of having to use the toolbar's Unlink button (or a future explicit "Remove link" affordance in the bubble).

4. **Pure validation lives in `link_sanitization.ts`; editor mutation lives inside `LinkEditForm`.** `normalizeLinkInput` (the pure function: trim, https-prefix, validate, return `{ ok, href, text? }` or `{ ok, error }`) sits next to `isAcceptableLinkUri` — same domain, unit-testable without an editor. The TipTap chain (`setLink` vs `insertContent`) runs inside `LinkEditForm`'s apply handler — there are no other callers, so a separate `link_commands.ts` would be ceremony without payoff.

5. **Toolbar `LinkPopover` keeps its URL-only input** (preserves current UX). It consumes the new `LinkEditForm` with `showTextInput={false}`. The bubble menu passes `showTextInput={true}`. Promoting the toolbar to two-input mode is queued in Task 3 follow-ups for later if desired.

6. **Long URLs in the edit form wrap, not scroll horizontally.** The URL field is a `<Textarea>`-style auto-growing input, capped at a max-height (≈8rem) before vertical scrolling kicks in. Enter still applies (newlines are never inserted; `new URL()` would reject them anyway). Pure-display surfaces (none today) would use truncation with a `title` attribute for hover.

---

## Task 1: Extract `LinkEditForm` and add `normalizeLinkInput`

**Files:**
- Modify: `app/inertia/lib/richtext/link_sanitization.ts` (add `normalizeLinkInput`)
- Modify: `app/inertia/lib/richtext/link_sanitization.test.ts` (extend with `normalizeLinkInput` tests)
- Create: `app/inertia/components/richtext/link_edit_form.tsx`
- Modify: `app/inertia/components/richtext/link_popover.tsx`

- [ ] **Step 1: Add `normalizeLinkInput` to `link_sanitization.ts`.**

  ```ts
  export type NormalizedLinkInput =
    | { ok: true; href: string; text?: string }
    | { ok: false; error: string }

  export function normalizeLinkInput(
    rawHref: string,
    rawText?: string
  ): NormalizedLinkInput {
    const trimmedHref = rawHref.trim()
    const trimmedText = rawText?.trim()
    if (!trimmedHref) {
      return { ok: false, error: 'URL is required.' }
    }
    const href = /^https?:\/\//i.test(trimmedHref)
      ? trimmedHref
      : `https://${trimmedHref}`
    if (!isAcceptableLinkUri(href)) {
      return { ok: false, error: 'Only http and https links are allowed.' }
    }
    if (rawText !== undefined && !trimmedText) {
      return { ok: false, error: 'Link text is required.' }
    }
    return { ok: true, href, text: trimmedText }
  }
  ```

- [ ] **Step 2: Add tests for `normalizeLinkInput` to `link_sanitization.test.ts`.**

  Cases:
  - Empty URL → `{ ok: false, error: 'URL is required.' }`
  - `example.com` → `{ ok: true, href: 'https://example.com' }`
  - `http://example.com` → kept as `http://`
  - `HTTPS://example.com` → kept as `HTTPS://`
  - `ftp://...` → `{ ok: false, error: 'Only http and https…' }`
  - `not a url` → after prefix becomes `https://not a url` → still rejected
  - With text param undefined: text-required check is skipped (toolbar popover case)
  - With text param empty string: rejected with text-required error (per Decision 3)
  - With text param non-empty + valid URL → `{ ok: true, href, text }`

- [ ] **Step 3: Create `LinkEditForm` in `link_edit_form.tsx`.**

  ```tsx
  type Props = {
    editor: EditorInstance
    initialHref: string
    initialText?: string
    showTextInput: boolean
    onDone: () => void  // called after a successful apply OR on cancel
  }
  export function LinkEditForm(props: Props): JSX.Element
  ```

  Internally:
  - `useState` for the URL value, the text value (if applicable), and the error.
  - **URL field is a wrapping textarea** (auto-grow up to `max-h-32` ≈ 8rem, then vertical scroll) so long URLs are visible at a glance — see Decision 6. Set `rows={1}`, `resize: none`, `whiteSpace: pre-wrap`. The visible-text field stays a single-line `<Input>`.
  - `Enter` on either field triggers apply (with `preventDefault` so it never inserts a newline); `Escape` triggers cancel; `Shift+Enter` is intentionally *not* honored as "newline" — URLs can't contain them.
  - On apply: call `normalizeLinkInput(...)`. If `!result.ok`, set the error state and stay open. If `result.ok`, run the TipTap chain inline:

    ```ts
    if (result.text === undefined) {
      // URL-only update (preserves nested marks)
      editor.chain().focus().extendMarkRange('link').setLink({ href: result.href }).run()
    } else {
      // Text + URL update — replace the slice's text, keep only the link mark
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .insertContent({
          type: 'text',
          text: result.text,
          marks: [{ type: 'link', attrs: { href: result.href } }],
        })
        .run()
    }
    props.onDone()
    ```

  - On cancel: clear local state, call `props.onDone()`.
  - Error renders below the inputs (`role="alert"`, `aria-describedby` pattern matching the current `LinkPopover`).
  - Reuses existing UI primitives (`Input`, `Textarea`, button styling).

- [ ] **Step 4: Refactor `LinkPopover` to embed `LinkEditForm`.**

  Replace the inline URL input + error + apply logic with:

  ```tsx
  <LinkEditForm
    editor={editor}
    initialHref={currentHref ?? ''}
    showTextInput={false}
    onDone={() => setOpen(false)}
  />
  ```

  Keep the existing "Remove link" button (Unlink icon) outside the form — it's a toolbar-popover-specific affordance that doesn't belong in the shared form. Drop the popover's local `error` / `applyLink` / URL state — those all move into `LinkEditForm`.

- [ ] **Step 5: Verify the toolbar popover still behaves identically.**

  Manual smoke test on the dev server (port 3333; ask user to start if not running):
  - Open the popover with a selection that has no link → URL field is empty; type `example.com`, apply → wraps selection with link to `https://example.com`.
  - Open the popover with a selection that has a link → URL field shows the current href; change it, apply → href updates.
  - Type `ftp://...` → inline error shows, popover stays open.
  - Click the Unlink button → link removed.
  - Paste a very long URL (~200 chars) → URL textarea wraps; bubble grows up to `max-h-32` then scrolls vertically.

- [ ] **Step 6: Run `pnpm typecheck`, `pnpm lint`, `pnpm spell`, vitest — all green.**

---

## Task 2: Build `LinkBubbleMenu` on top of the extracted form/helper

**Files:**
- Create: `app/inertia/components/richtext/link_bubble_menu.tsx`
- Modify: `app/inertia/components/richtext/editor.tsx` (mount the bubble menu)

- [ ] **Step 1: Sketch the component contract.**

  ```tsx
  type Props = { editor: EditorInstance }
  export function LinkBubbleMenu({ editor }: Props): JSX.Element | null
  ```

  Returns `null` when no link is active under the caret; otherwise returns a Radix `Popover` open above/below the link DOM element.

- [ ] **Step 2: Detect active-link state via `useEditorState`.**

  ```ts
  const state = useEditorState<{
    isActive: boolean
    href: string | undefined
    from: number
    to: number
  }>({
    editor,
    selector: ({ editor: e }) => {
      const isActive = e.isActive('link')
      const { from, to } = e.state.selection
      return {
        isActive,
        href: isActive ? e.getAttributes('link').href : undefined,
        from,
        to,
      }
    },
  })
  ```

- [ ] **Step 3: Resolve the link's DOM element to anchor against.**

  TipTap exposes `editor.view.domAtPos(pos)`. Walk up to the nearest `<a>` element and use it as the Radix `Popover`'s anchor (Radix supports `PopoverAnchor` separate from the trigger). Re-resolve on every selection change so the anchor follows the caret across multiple links in the same document.

- [ ] **Step 4: Build the popover content.**

  Local state: `mode: 'view' | 'edit'`, default `'view'`.

  **View mode:**
  - `<a target="_blank" rel="noopener noreferrer" href={state.href}>Visit</a>` (the `<a>` form is more accessible than a button + `window.open`).
  - "Edit" button → `setMode('edit')`.

  **Edit mode:**
  - Render `<LinkEditForm editor={editor} showTextInput={true} initialHref={state.href ?? ''} initialText={editor.state.doc.textBetween(state.from, state.to)} onDone={() => setMode('view')} />`.
  - The form runs the TipTap chain internally; the bubble's only job is to flip back to view mode when the form signals done.

  Per Decision 2, when the visible text changes, the form's apply path uses `insertContent` with only the link mark — nested non-link marks within the slice are dropped.

  Style: small panel ~280px wide; in edit mode the form stacks the two inputs vertically with a row of apply/cancel below. Use existing UI primitives (`Popover`, `Button`/`ToolbarButton`, `Input`).

- [ ] **Step 5: Wire `LinkBubbleMenu` into `editor.tsx`.**

  ```tsx
  <Toolbar editor={editor} />
  <EditorContent editor={editor} />
  <LinkBubbleMenu editor={editor} />
  ```

- [ ] **Step 6: Manual verification on the dev server.**

  - Place the caret inside an existing link → bubble appears anchored above the link in view mode.
  - Move the caret out → bubble disappears.
  - Click "Visit" → opens the link in a new tab; the editor view doesn't navigate away.
  - Click "Edit" → form shows the current visible text in the first input and the current href in the second.
  - Edit the URL only → href changes, visible text stays.
  - Edit the visible text only → text changes in the document, href stays.
  - Edit both → both update.
  - Try entering `ftp://...` in the URL field → rejected with the same error UX as the toolbar popover.
  - Type `example.com` (no scheme) in the URL field → applies as `https://example.com`.
  - Per Decision 3 — clearing the visible text field and clicking Apply is rejected with a validation error.
  - Keyboard nav: Tab between inputs and into apply/cancel; Enter on either input applies; Escape exits edit mode.
  - With reduced motion: no jarring transitions (see DESIGN.md preferences).

- [ ] **Step 7: Edge cases.**

  - Selection spans multiple link marks → either show no bubble or anchor to the first; pick and document.
  - Editor is disabled / read-only mode → bubble suppressed.
  - Link with empty href (shouldn't happen given validation, but defend anyway) → don't show "Visit"; show only "Edit".
  - Very long URLs → URL field horizontally scrolls; the bubble itself doesn't grow beyond ~280px.
  - Link contains nested marks → if the user changes the visible text, the new text inherits only the link mark (per Decision 2); the surrounding bold/italic is dropped within the rewritten slice.

- [ ] **Step 8: Run the full check suite (`pnpm typecheck`, `pnpm lint`, `pnpm spell`, vitest) — all green.**

---

## Task 3: Optional follow-ups (do not implement unless explicitly asked)

- React component test infrastructure (`jsdom` + `@testing-library/react`) so `LinkEditForm`, `LinkBubbleMenu`, and `LinkPopover` can be unit-tested.
- Server-side facet validation on save (reject link facets with non-http(s) URIs at the controller layer). Belt-and-suspenders defense; the render-time stripping already protects readers and the `isAllowedUri` predicate already protects writers.
- A `mailto:` allowlist if the product wants email-link support. Touches `link_sanitization.ts`, the editor config, and (transitively) both popover and bubble menu.
- Promote the toolbar popover to also show a visible-text input (per Decision 5) for consistency with the bubble menu. Small change once `LinkEditForm` is in place: flip `showTextInput` to `true` and pass the current selection's text as the default.

---

## Verification checklist (run before claiming done)

- [ ] `pnpm --filter @questionable-fyi/app typecheck` clean
- [ ] `pnpm --filter @questionable-fyi/app lint` clean
- [ ] `pnpm spell` clean (or only pre-existing findings — confirm)
- [ ] `pnpm --filter @questionable-fyi/app exec vitest run inertia/lib/richtext` clean (includes new `normalizeLinkInput` cases in `link_sanitization.test.ts`)
- [ ] Manual smoke test of the toolbar popover (Task 1 Step 5) — ensures the refactor didn't regress
- [ ] Manual smoke test of the bubble menu (Task 2 Steps 6–7)
- [ ] Add a changeset (patch level) describing the new bubble menu UX and the shared-form refactor

## Questions:

- Can we use BubbleMenu here? https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu
