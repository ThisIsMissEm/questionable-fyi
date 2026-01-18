import { useEffect, useState } from 'react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import { Form, router, usePage } from '@inertiajs/react'
import { Tab } from '~/components/tabs/tab'
import Modal from '~/components/modal'
import { Button } from '@/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'
import { Field, FieldLabel } from '~/lib/components/ui/field'
import { Tabbar } from '../tabs/tabbar'

export type ProfileHeaderProps = {
  profile: {
    displayName: string | null
    description?: string
    handle: string | null
    did: string
  }
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const handleOrDid = profile.handle ?? profile.did
  const { component, props, url } = usePage<SharedProps & PageProps>()
  const [editing, showEdit] = useState(false)

  useEffect(() => {
    console.log(props)
  }, [props])

  const onProfileEditSuccess = () => {
    showEdit(false)
    router.get(`/p/${handleOrDid}`, {}, { only: ['profile'] })
  }

  return (
    <div className="profile-header">
      <div className="profile-overview">
        <div className="profile-details">
          <h2 className="text-3xl">{profile.displayName ?? profile.handle ?? profile.did}</h2>
          <p>@{handleOrDid}</p>
        </div>
        {props.isAuthenticated && props.user?.did === profile.did && (
          <div className="profile-edit">
            <Button onClick={() => showEdit(true)}>Edit Profile</Button>
          </div>
        )}
        <Modal title="Edit Profile" open={editing} onClose={() => showEdit(false)}>
          <Form method="PUT" onSuccess={onProfileEditSuccess}>
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
      </div>
      <div className="profile-description">{profile.description}</div>

      <Tabbar
        tabs={[
          {
            id: 'asks',
            title: 'Asks',
            href: `/p/${handleOrDid}?tab=asks`,
            isActive:
              (component == 'profiles/show' && !url.includes('tab=')) || url.includes('tab=asks'),
          },
          {
            id: 'questions',
            title: 'Questions',
            href: `/p/${handleOrDid}?tab=questions`,
            isActive: url.includes('tab=questions'),
          },
          {
            id: 'answers',
            title: 'Answers',
            href: `/p/${handleOrDid}?tab=answers`,
            isActive: url.includes('tab=answers'),
          },
        ]}
      />
    </div>
  )
}
