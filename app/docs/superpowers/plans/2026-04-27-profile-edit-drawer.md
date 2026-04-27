# Profile Edit Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom Modal-based profile edit dialog with a right-side Sheet drawer, adding a toast notification on save.

**Architecture:** Swap the custom `Modal` component in `ProfileHeader` for the existing shadcn `Sheet` component (right side). On save success, close the drawer, show a Sonner toast, and reload profile data via `router.reload()`. Then delete the now-unused Modal component and its CSS.

**Tech Stack:** React 19, shadcn/ui Sheet (Radix Dialog), Sonner toasts, Inertia.js forms, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-04-27-profile-edit-drawer-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `inertia/components/profile/header.tsx` | Replace Modal with Sheet, add toast |
| Delete | `inertia/components/modal.tsx` | Custom Modal — no longer used |
| Modify | `inertia/css/app.css` | Remove `dialog` CSS rules (lines 119-152) |

---

### Task 1: Replace Modal with Sheet in ProfileHeader

**Files:**
- Modify: `inertia/components/profile/header.tsx`

- [ ] **Step 1: Update imports**

Replace the Modal import and add Sheet + toast imports. In `inertia/components/profile/header.tsx`, change the imports from:

```tsx
import Modal from '~/components/modal'
```

To:

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/lib/components/ui/sheet'
import { toast } from 'sonner'
```

- [ ] **Step 2: Update the success handler**

Replace the `onProfileEditSuccess` function. Change from:

```tsx
const onProfileEditSuccess = () => {
  showEdit(false)
  router.get(urlFor('profile.show', [handleOrDid]), {}, { only: ['profile'] })
}
```

To:

```tsx
const onProfileEditSuccess = () => {
  showEdit(false)
  toast.success('Profile updated')
  router.reload({ only: ['profile'] })
}
```

- [ ] **Step 3: Replace Modal JSX with Sheet**

Replace the `<Modal>` block (lines 87-115) with the Sheet structure. Change from:

```tsx
<Modal title="Edit Profile" open={editing} onClose={() => showEdit(false)}>
  <Form
    route="profile.update"
    routeParams={{ identifier: handleOrDid }}
    onSuccess={onProfileEditSuccess}
  >
    {({ processing }) => (
      <div className="flex flex-col gap-2">
        <Field>
          <FieldLabel htmlFor="displayName">Display Name:</FieldLabel>
          <Input type="text" name="displayName" defaultValue={profile.displayName ?? ''} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description:</FieldLabel>
          <Textarea
            name="description"
            rows={3}
            defaultValue={profile.description?.trim()}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={processing}>
            {processing ? 'Updating profile...' : 'Save profile'}
          </Button>
        </Field>
      </div>
    )}
  </Form>
</Modal>
```

To:

```tsx
<Sheet open={editing} onOpenChange={showEdit}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit Profile</SheetTitle>
      <SheetDescription>Update your display name and profile description.</SheetDescription>
    </SheetHeader>
    <Form
      route="profile.update"
      routeParams={{ identifier: handleOrDid }}
      onSuccess={onProfileEditSuccess}
    >
      {({ processing }) => (
        <>
          <div className="flex flex-col gap-4 px-4">
            <Field>
              <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
              <Input type="text" name="displayName" defaultValue={profile.displayName ?? ''} />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                name="description"
                rows={3}
                defaultValue={profile.description?.trim()}
              />
            </Field>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating profile...' : 'Save profile'}
            </Button>
          </SheetFooter>
        </>
      )}
    </Form>
  </SheetContent>
</Sheet>
```

Note: `SheetContent` defaults to `side="right"`. `SheetFooter` has `mt-auto` built in, so the button sticks to the bottom. Form fields get `px-4` to match the Sheet's internal padding.

- [ ] **Step 4: Verify the build compiles**

Run: `pnpm build`
Expected: Clean build with no errors.

- [ ] **Step 5: Manually test in browser**

1. Navigate to your own profile page
2. Click "Edit Profile" — drawer should slide in from the right
3. Verify Display Name and Description fields are pre-filled
4. Edit a field and click "Save profile" — drawer should close, toast should appear, profile should update
5. Open drawer and close via: X button, Escape key, clicking the overlay — all should work
6. Verify the drawer looks correct on mobile width (resize browser to ~375px)

- [ ] **Step 6: Commit**

```bash
git add inertia/components/profile/header.tsx
git commit -m "feat: replace profile edit modal with sheet drawer

Use the existing shadcn Sheet component for a right-side drawer instead
of the custom Modal. Add Sonner toast on successful save."
```

---

### Task 2: Remove unused Modal component and CSS

**Files:**
- Delete: `inertia/components/modal.tsx`
- Modify: `inertia/css/app.css` (lines 119-152)

- [ ] **Step 1: Delete the Modal component**

```bash
rm inertia/components/modal.tsx
```

- [ ] **Step 2: Remove dialog CSS from app.css**

In `inertia/css/app.css`, delete lines 119-152 — the `dialog`, `dialog::backdrop`, `dialog .dialog-header`, and `dialog .dialog-body` rules:

```css
dialog {
  margin: auto;
  max-width: calc(100% - 2em);
  max-height: calc(100% - 2em);
  min-width: min(600px, calc(100vw - 2em));
  min-height: 450px;
  top: 50%;
  margin-top: calc(-450px / 2);

  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow:
    0 10px 15px -3px oklch(0 0 0 / 0.1),
    0 4px 6px -4px oklch(0 0 0 / 0.1);
}

dialog::backdrop {
  background-color: oklch(0 0 0 / 0.6);
}

dialog .dialog-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

dialog .dialog-body {
  padding: 16px;
  overflow-y: auto;
}
```

- [ ] **Step 3: Verify the build still compiles**

Run: `pnpm build`
Expected: Clean build with no errors. No remaining references to `modal.tsx`.

- [ ] **Step 4: Commit**

```bash
git add -u inertia/components/modal.tsx inertia/css/app.css
git commit -m "chore: remove unused Modal component and dialog CSS"
```
