import { useMemo, useState } from 'react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabbar } from '../tabs/tabbar'
import { Data } from '@generated/data'
import { useAuth } from '~/hooks/auth'
import { urlFor } from '~/client'
import { router, usePage } from '@inertiajs/react'
import { AccountHandle } from '~/components/account-handle'
import { EditProfileSheet } from '~/components/profile/edit-profile-sheet'

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
    toast.success('Profile updated')
    router.reload({ only: ['profile'] })
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
      <div className="flex flex-col gap-3 px-3 mb-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <h2 className="text-4xl font-semibold break-words">
            {profile.displayName ?? profile.handle ?? profile.did}
          </h2>
          <AccountHandle account={profile} className="text-xl text-muted-foreground" />
          {profile.description && (
            <div className="mt-3 text-lg font-sans whitespace-pre-wrap wrap-break-word overflow-clip">
              {profile.description}
            </div>
          )}
        </div>
        {viewer.isLoggedIn && viewer.user?.did === profile.did && (
          <>
            <Button onClick={() => showEdit(true)} className="font-sans shrink-0 self-start">
              Edit Profile
            </Button>
            <EditProfileSheet
              profile={profile}
              open={editing}
              onOpenChange={showEdit}
              onSuccess={onProfileEditSuccess}
            />
          </>
        )}
      </div>

      <Tabbar tabs={tabs} aria-label="Profile" />
    </div>
  )
}
