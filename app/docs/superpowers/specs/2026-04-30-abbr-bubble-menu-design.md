# Abbreviation Bubble Menu Design

**Status:** validated, ready for implementation plan.

**Goal:** Replace the existing `AbbrPopover` with a TipTap bubble menu that handles both creation (toolbar trigger) and editing (caret-in-mark trigger), exposes both visible-text and title fields, preserves nested marks when text is rewritten, and uses HTML5 form validation paired with a one-shot shake animation for invalid input. The bubble-menu shell is generic from day one so that the parked link UX work can adopt it later via composition rather than refactor.

## Background

The richtext editor today uses a single-input `AbbrPopover` mounted in the toolbar. Selection-based creation and inline editing both go through that one trigger; there's no way to edit the visible text without leaving the popover and using the document directly. The parked `2026-04-30-editor-link-ux.md` plan already designs a bubble menu for links with a similar two-field shape; this work picks up the same UX direction for abbr first and lays down the shared shell that link adopts later.

## Locked-in decisions

1. **Single bubble menu component, two trigger paths.** Toolbar abbr button sets a typed `pendingComplexMark` state at the editor layer; caret-in-abbr is detected via `editor.isActive('abbr')`. A `shouldShow` predicate combines the two. No separate popover.

2. **Preserve nested marks on text rewrite via shared utility.** When the user edits the visible text, the new text retains the union of any non-required marks (bold/italic/etc.) that overlapped the original range. Implemented as `replaceTextPreservingMarks(editor, range, newText, requiredMarks)` in `app/inertia/lib/richtext/mark_utils.ts`. The parked link plan's Decision 2 ("drop nested marks") is revised to consume this same utility.

3. **HTML5 form validation drives the gate.** Inputs declare `required`, `minLength`, `maxLength` directly. The shell calls `formRef.current.requestSubmit()`; the browser blocks submit on invalid input and fires the `invalid` event. No bespoke errors object.

4. **Shake once per session, not per failed submit.** First `invalid` event applies the `form-error-shake` class. Subsequent invalid events do nothing (the class persists harmlessly; `:invalid` red styling provides ongoing feedback). Resets on next bubble menu visible session.

5. **Submit-button discrimination via `name=` and `event.submitter`.** Apply and Remove are both `<button type="submit">` inside the form, distinguished by their `name` attribute. Remove uses `formNoValidate` so users can always remove a broken abbr.

6. **`prefers-reduced-motion: reduce` → `animation: none`.** No fallback motion; the red `:invalid` border carries the signal alone.

7. **Esc dismisses the current session; selection change clears the dismissal.** Lets the user escape a popup-trap without permanently disabling the menu.

8. **Click-outside saves (with validation gate).** Outside-click runs the same `requestSubmit()` path as the Apply button. Invalid input blocks the close.

9. **Cleared visible text or empty title block submit with errors.** No silent removal via clearing — Remove button is the only removal path.

10. **`COMPLEX_MARKS` const tuple as a category.** `'abbr' | 'link'` (extensible). Establishes a shared concept across the codebase: marks that need a form to populate attributes, distinct from simple toggles in `MARK_KEYS`.

11. **Visible form labels, not placeholders.** Both inputs are paired with explicit `<label>` elements describing what to enter. Placeholders are not used as label substitutes — they're inaccessible (vanish on focus, low contrast, inconsistent SR support) and example values inside placeholders confuse users about whether a field is already filled.

## Architecture

```
┌──────────────────────────────────────┐
│  Toolbar (modified)                  │
│  - abbr button → onTriggerComplexMark│
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────┐
│  MarkBubbleMenu (new, generic)       │    │  TipTap BubbleMenu primitive │
│  - shouldShow predicate              │◄───┤  (anchored to selection /    │
│  - Outside-click → form.requestSubmit│    │   active mark range)         │
│  - Esc → close + dismiss             │    └──────────────────────────────┘
│  - Listens for invalid event → shake │
│  - Listens for submit event → close  │
│  - Slots a child <form> via ref      │
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────┐
│  AbbrEditForm (new, feature-specific)│    │  replaceTextPreservingMarks  │
│  - <form> with two <input>s          │    │  (new shared utility)        │
│  - HTML5 validation attrs            ├───►│  - Walks range, captures     │
│  - Apply + Remove submit buttons     │    │    marks (excluding required │
│  - submitter.name discriminates      │    │    types), replaces text,    │
│  - onSubmit runs editor mutations    │    │    reapplies union           │
└──────────────────────────────────────┘    └──────────────────────────────┘
```

## File map

### Created

| Path | Responsibility |
|------|---------------|
| `app/inertia/components/richtext/mark_bubble_menu.tsx` | Generic bubble-menu shell. |
| `app/inertia/components/richtext/abbr_edit_form.tsx` | Abbr-specific form. |
| `app/inertia/lib/richtext/mark_utils.ts` | `replaceTextPreservingMarks`. |
| `app/inertia/lib/richtext/mark_utils.test.ts` | Utility unit tests. |

### Modified

| Path | Change |
|------|--------|
| `app/inertia/components/richtext/editor.tsx` | Install `BubbleMenu` extension; add `pendingComplexMark` state; mount `<MarkBubbleMenu>` containing `<AbbrEditForm>`. |
| `app/inertia/components/richtext/toolbar.tsx` | Abbr button calls `onTriggerComplexMark('abbr')`. Remove `<AbbrPopover />`. |
| `app/inertia/css/app.css` | Add `form-error-shake` keyframes + class with `prefers-reduced-motion` guard. |
| `app/docs/superpowers/plans/2026-04-30-editor-link-ux.md` | Revise Decision 2 to "preserve nested marks via shared utility"; reference `MarkBubbleMenu` and `replaceTextPreservingMarks`. **Working tree only — not part of this feature's commits.** |
| `app/package.json`, `pnpm-lock.yaml` | Add `@tiptap/extension-bubble-menu`. |

### Deleted

| Path | Reason |
|------|--------|
| `app/inertia/components/richtext/abbr_popover.tsx` | Replaced by the bubble menu. |

## Component contracts

### `MarkBubbleMenu`

```ts
type MarkBubbleMenuProps = {
  editor: Editor
  shouldShow: (state: { editor: Editor; from: number; to: number }) => boolean
  children: ReactElement<{ ref?: Ref<HTMLFormElement> }>
  onClose?: () => void
}
```

**Internal state:**
- `dismissed: boolean` — set on Esc; cleared on the next selection change.
- `shaken: boolean` — set on first `invalid` event during the current visible session; reset when the menu transitions hidden → visible.
- A ref to the slotted `<form>`, forwarded via `cloneElement`.

**Effective visibility:** `shouldShow(state) && !dismissed`.

**Listeners attached to the form node:**
- `submit` → fire `onClose`. (The form's own onSubmit runs the mutation; the shell only observes success and closes.)
- `invalid` (capture phase, since `invalid` does not bubble) → if `!shaken`, set `shaken=true`.

**Close paths:**
- Apply button click → form submit (handled inside form) → submit listener → onClose.
- Click outside → `formRef.current.requestSubmit()` → either invalid (shake, stay open) or submit (close).
- Esc keydown → set `dismissed=true`, no submit dispatched.
- Successful Remove (a submit with `submitter.name === 'remove'`) → submit listener fires → onClose.

### `AbbrEditForm`

```ts
type AbbrEditFormProps = {
  editor: Editor
}
```

**Mode and initial values** are derived on mount and on selection change inside the form's internal state machine:
- `editor.isActive('abbr')` → `mode='edit'`; text from current abbr range, title from `editor.getAttributes('abbr').title`.
- Else → `mode='create'`; text from selection, title empty.

**Inputs:** Each input is paired with a visible `<label>` element — no placeholder text used as a label substitute. (Project convention: labels are explicit visible elements, not placeholders.)

- `<label>` "Visible text" + `<input name="text" required>` — text content of the marked range.
- `<label>` "Abbreviation title" + `<input name="title" required minLength={5} maxLength={300}>` — the abbr title attribute, typed full form.

**Buttons (both submit, both inside form):**
- `<button type="submit" name="apply">Apply</button>`
- `<button type="submit" name="remove" formNoValidate>Remove abbreviation</button>` — visible only when `mode === 'edit'`.

**onSubmit:**
```tsx
const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
if (submitter?.name === 'remove') {
  editor.chain().focus().unsetMark('abbr').run()
  return
}
if (textChanged) {
  replaceTextPreservingMarks(editor, range, text, [{ type: 'abbr', attrs: { title } }])
} else {
  editor.chain().focus().setMark('abbr', { title }).run()
}
```

The form forwards a ref to its root `<form>` element (no `useImperativeHandle` needed — the shell only needs DOM-level methods like `requestSubmit()`).

### `replaceTextPreservingMarks`

```ts
type MarkSpec = { type: string; attrs?: Record<string, unknown> }

export function replaceTextPreservingMarks(
  editor: Editor,
  range: { from: number; to: number },
  newText: string,
  requiredMarks: MarkSpec[]
): void
```

Walks the `from..to` slice via `editor.state.doc.nodesBetween`, collects the union of marks present (excluding any `type` matching a `requiredMarks` entry), then `editor.chain().focus().insertContentAt({ from, to }, { type: 'text', text: newText, marks: [...preserved, ...required] }).run()`.

**Known limitation:** when the original range had multiple distinct mark distributions (e.g. bold on first half, italic on second), the new text gets the **union** of all those marks across its full span. Documented; revisit if real users complain.

## Animation

```css
@keyframes form-error-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(2px); }
}

.form-error-shake {
  animation: form-error-shake 0.4s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .form-error-shake {
    animation: none;
  }
}
```

Shell renders the form inside a wrapper `<div>` that conditionally has `form-error-shake` based on `shaken`. The class is applied once and stays applied; the animation runs to completion (back to translateX(0)) and then becomes inert. A new visible session resets `shaken=false` so the next failure can shake again.

## Lifecycle reference

```
1. Toolbar abbr click (selection non-empty)
   → setPendingComplexMark('abbr')
   → MarkBubbleMenu shouldShow returns true
   → Bubble menu becomes visible; AbbrEditForm reads selection → mode='create'

2. User edits inputs (controlled state, no doc mutation)

3a. Apply button → browser validates → invalid → shake (once); stays open
3b. Apply button → valid → onSubmit runs apply path → submit event → shell closes
3c. Click outside → same as 3a/3b
3d. Esc → dismissed=true → menu hides; cursor moves → dismissed=false → menu may reappear
3e. Remove button → onSubmit runs unsetMark; submitter.name='remove' so apply path skipped → submit event → shell closes
```

## Testing

### Unit tests (this work)

`mark_utils.test.ts`:
- Range with no marks + required `[abbr]` → newText carries only abbr.
- Range with one preserved mark (bold) + required `[abbr]` → newText carries bold + abbr.
- Range with two distinct marks across the slice (bold-half, italic-half) + required `[abbr]` → union: bold + italic + abbr.
- Range already containing the required mark type (existing abbr being replaced) → not duplicated; old replaced by new.
- Empty range → noop.

Tests construct a real `Editor` via `Editor.create({ extensions, content })`.

### Manual smoke (this work)

Following the editor-link-ux plan's precedent (no React-component test infra in the project):
- Selection + toolbar abbr → bubble menu appears, text pre-filled, title empty.
- Caret in existing abbr → bubble menu, both fields pre-filled.
- Apply with valid input → text replaced, marks preserved, menu closes.
- Apply with empty title → red border + shake (once); subsequent failed submits → no re-shake, red persists.
- Esc → menu hides; caret leaves and re-enters → menu reappears.
- Click outside (valid) → save and close.
- Click outside (invalid) → block close.
- Remove → unsetMark and close.
- `prefers-reduced-motion` → no shake, just red border.

### Out of scope (separate spec)

The following will be automated when `jsdom` + `@testing-library/react` infra lands. That work needs its own brainstorm + spec + implementation plan because:
- vitest config split (`node` for converter tests, `jsdom` for component tests) deserves its own design.
- Test patterns for TipTap + JSDOM have known gotchas (`Range`/`Selection` partial implementations, missing `ResizeObserver` / `IntersectionObserver`) worth documenting once.
- The choice between user-event and fireEvent is a project-wide convention.

What that future suite would cover for *this* feature:
- shouldShow + dismissed lifecycle.
- AbbrEditForm mode detection and pre-fill logic.
- HTML5 validation gate firing the `invalid` event correctly.
- Submit dispatch via `event.submitter.name`.
- Esc / click-outside / Apply / Remove paths.
- `prefers-reduced-motion` reflected in the rendered class.
- End-to-end mark preservation through the form (bold-inside-abbr survives a text edit).

Required infra changes for that future work:
- DevDeps: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@types/jsdom`.
- `vitest.config.ts`: per-file `// @vitest-environment jsdom` comments, or a config-level split.
- `setupTests.ts` importing `@testing-library/jest-dom`.

## Out of scope (this work)

- LinkBubbleMenu / LinkEditForm — the parked link plan picks these up later, slotting into `MarkBubbleMenu`.
- Mention bubble menu — possible future complex mark; not designed here.
- Hover-based previews — caret/click-driven only.
- React-component testing infra — future spec.

## Link plan revision (working tree only)

While implementing this work, edit `app/docs/superpowers/plans/2026-04-30-editor-link-ux.md` to:
- Replace Decision 2's "drop nested marks" with "preserve nested marks via the shared `replaceTextPreservingMarks` utility (introduced in the abbr bubble menu work)".
- Note that `MarkBubbleMenu` (already shipped) is the shell `LinkBubbleMenu` work consumes; the task list reduces to building `LinkEditForm` and slotting it in.

These edits stay in the working tree and are *not* part of this feature's commits — the user will fold them into the parked plan separately.
