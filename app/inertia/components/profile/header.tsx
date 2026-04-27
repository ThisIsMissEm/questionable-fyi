import { useMemo, useState } from 'react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import Modal from '~/components/modal'
import { Button } from '@/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'
import { Field, FieldLabel } from '~/lib/components/ui/field'
import { Tabbar } from '../tabs/tabbar'
import { Data } from '@generated/data'
import { useAuth } from '~/hooks/use-auth'
import { urlFor } from '~/client'
import { router, usePage } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { AccountHandle } from '~/components/account-handle'

export type ProfileHeaderProps = {
  profile: Data.Profile
  links: Data.ProfileLinks
}

export default function ProfileHeader({ profile, links }: ProfileHeaderProps) {
  const handleOrDid = profile.handle ?? profile.did
  const viewer = useAuth()
  const { component, url } = usePage<SharedProps & PageProps>()
  const [editing, showEdit] = useState(false)

  const onProfileEditSuccess = () => {
    showEdit(false)
    router.get(urlFor('profile.show', [handleOrDid]), {}, { only: ['profile'] })
  }

  const tabs = useMemo(() => {
    const result = []

    if (links.asks) {
      result.push({
        id: 'asks',
        title: 'Asks',
        link: {
          href: urlFor('profile.show', { identifier: handleOrDid }),
        },
        isActive: component == 'profiles/show' && !url.includes('tab'),
      })
    }

    if (links.questions) {
      result.push({
        id: 'questions',
        title: 'Questions',
        link: {
          href: urlFor('profile.questions.index', { identifier: handleOrDid }),
        },
        isActive: component == 'profiles/questions/index',
      })
    }

    if (links.answers) {
      result.push({
        id: 'answers',
        title: 'Answers',
        link: {
          href: urlFor('profile.show', { identifier: handleOrDid }, { qs: { tab: 'answers' } }),
        },
        isActive: url.includes('tab=answers'),
      })
    }

    return result
  }, [links])

  return (
    <div>
      <div className="flex flex-row px-3 mb-4">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold">
            {profile.displayName ?? profile.handle ?? profile.did}
          </h2>
          <AccountHandle account={profile} className="text-xl text-muted-foreground" />
        </div>
        {viewer.isLoggedIn && viewer.user?.did === profile.did && (
          <div>
            <Button onClick={() => showEdit(true)} className="font-sans">
              Edit Profile
            </Button>
          </div>
        )}
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
      </div>
      <div className="px-3 mb-6 text-lg font-sans whitespace-pre-wrap wrap-break-word overflow-clip">
        {profile.description}
      </div>

      <Tabbar tabs={tabs} aria-label="Profile" />
    </div>
  )
}
