import { useEffect, useState } from 'react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import { Form } from '@adonisjs/inertia/react'
import { router, usePage } from '@inertiajs/react'
import Modal from '~/components/modal'
import { Button } from '@/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'
import { Field, FieldLabel } from '~/lib/components/ui/field'
import { Tabbar } from '../tabs/tabbar'
import { Data } from '@generated/data'
import { useAuth } from '~/lib/hooks/use-auth'
import { urlFor } from '~/client'

export type ProfileHeaderProps = {
  profile: Data.Profile
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const handleOrDid = profile.handle ?? profile.did
  const viewer = useAuth()
  const { component, props, url } = usePage<SharedProps & PageProps>()
  const [editing, showEdit] = useState(false)

  useEffect(() => {
    console.log(props)
  }, [props])

  const onProfileEditSuccess = () => {
    showEdit(false)
    router.get(urlFor('profiles.show', [handleOrDid]), {}, { only: ['profile'] })
  }

  return (
    <div className="profile-header">
      <div className="profile-overview">
        <div className="profile-details">
          <h2 className="text-3xl">{profile.displayName ?? profile.handle ?? profile.did}</h2>
          <p>@{handleOrDid}</p>
        </div>
        {viewer.isLoggedIn && viewer.user?.did === profile.did && (
          <div className="profile-edit">
            <Button onClick={() => showEdit(true)}>Edit Profile</Button>
          </div>
        )}
        <Modal title="Edit Profile" open={editing} onClose={() => showEdit(false)}>
          <Form
            route="profiles.update"
            routeParams={{ handleOrDid }}
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
      </div>
      <div className="profile-description">{profile.description}</div>

      <Tabbar
        tabs={[
          {
            id: 'asks',
            title: 'Asks',
            href: urlFor('profiles.show', [handleOrDid]),
            isActive:
              (component == 'profiles/show' && !url.includes('tab=')) || url.includes('tab=asks'),
          },
          {
            id: 'questions',
            title: 'Questions',
            href: urlFor('profiles.show', [handleOrDid], { qs: { tab: 'questions' } }),
            isActive: url.includes('tab=questions'),
          },
          {
            id: 'answers',
            title: 'Answers',
            href: urlFor('profiles.show', [handleOrDid], { qs: { tab: 'answers' } }),
            isActive: url.includes('tab=answers'),
          },
        ]}
      />
    </div>
  )
}
