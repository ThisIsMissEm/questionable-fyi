import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/lib/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'
import { Field, FieldLabel } from '~/lib/components/ui/field'
import { Form } from '@adonisjs/inertia/react'
import { Data } from '@generated/data'

export type EditProfileSheetProps = {
  profile: Data.Profile
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditProfileSheet({
  profile,
  open,
  onOpenChange,
  onSuccess,
}: EditProfileSheetProps) {
  const handleOrDid = profile.handle ?? profile.did

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95%] sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>Update your display name and profile description.</SheetDescription>
        </SheetHeader>
        <Form
          route="profile.update"
          routeParams={{ identifier: handleOrDid }}
          onSuccess={onSuccess}
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
  )
}
