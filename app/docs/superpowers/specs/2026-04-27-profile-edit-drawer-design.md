# Profile Edit Drawer

Replace the custom Modal-based profile edit dialog with a right-side Sheet (drawer) using the existing shadcn Sheet component.

## Context

The current profile edit UI uses a custom `Modal` component built on the native `<dialog>` element. It works but lacks the polish of the Radix-based Sheet component already in the project — better focus trapping, scroll locking, and slide-in animations. The modal is also the only consumer of the custom `Modal` component, so replacing it lets us remove dead code.

## Design

### Layout: Header + Form + Sticky Footer

- **Sheet Header** (`SheetHeader`): Contains `SheetTitle` ("Edit Profile") and `SheetDescription` ("Update your display name and profile description"). The close button (X icon) is built into `SheetContent` automatically.
- **Form Body**: Static area between header and footer (no scrolling needed — the form is small). Contains:
  - Display Name — `Input` field with `Field`/`FieldLabel` wrapper
  - Description — `Textarea` field with `Field`/`FieldLabel` wrapper
- **Sheet Footer** (`SheetFooter`): Sticky at the bottom (`mt-auto` built in). Contains the submit button with loading state ("Updating profile..." / "Save profile").

### Slide Direction & Width

- Slides in from the **right** (Sheet default)
- Width: `w-3/4` on mobile, capped at `sm:max-w-sm` (384px) on larger screens (Sheet default)

### Behavior

- **Open**: Controlled via `open`/`onOpenChange` props on `Sheet`, triggered by "Edit Profile" button click
- **Close**: Escape key, overlay click, or X button (all Radix defaults)
- **On save success**: Close drawer immediately → show Sonner toast ("Profile updated") → reload profile data via `router.reload({ only: ['profile'] })`
- **On close without saving**: No dirty-state warning — form resets to current values on next open
- **Loading state**: Submit button shows "Updating profile..." and is disabled while `processing` is true

### Toast Notification

Use the existing Sonner integration (`sonner.tsx`) to show a success toast. Import `toast` from `sonner` and call `toast.success('Profile updated')` on form success, before closing the drawer.

## Files Changed

### Modified

1. **`inertia/components/profile/header.tsx`**
   - Replace `Modal` import with Sheet component imports (`Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`)
   - Replace `useState` open/close with Sheet's `open`/`onOpenChange` controlled pattern
   - Restructure form JSX into Sheet layout (header → body → footer)
   - Add `toast.success()` call on save success
   - Remove `Modal` import

### Deleted

2. **`inertia/components/modal.tsx`** — no longer used anywhere in the codebase
3. **`inertia/css/app.css`** — remove `.modal`, `.dialog-header`, `.dialog-body`, and related `::backdrop` CSS rules (~lines 119-152)

### Unchanged

- Backend route (`profile.update`) and controller logic
- Form fields (`displayName`, `description`) and validation (`updateProfileValidator` in `app/validators/profile.ts`)
- `@adonisjs/inertia/react` `Form` component usage
- Sheet component itself (`inertia/lib/components/ui/sheet.tsx`) — used as-is

## Dependencies

- `Sheet` component — already exists at `inertia/lib/components/ui/sheet.tsx`
- `sonner` — already installed, `Toaster` component at `inertia/lib/components/ui/sonner.tsx`
- Sonner `Toaster` is mounted in the default layout (`inertia/layouts/default.tsx:20`) — already wired up
