import { Data } from '@generated/data'
import { Head, usePage } from '@inertiajs/react'
import AskForm from '~/components/ask'
import ProfileHeader from '~/components/profile/header'
import { useAuth } from '~/lib/hooks/use-auth'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  profile: Data.Profile
}>

export default function ShowProfile({ profile }: PageProps) {
  const { url } = usePage()
  const viewer = useAuth()

  const tab = new URLSearchParams(url.split('?', 2)[1]).get('tab') ?? 'asks'

  return (
    <>
      <Head title={`${profile.displayName ?? profile.handle}`} />
      <ProfileHeader profile={profile} />
      <div className="profile-content">
        {viewer.isLoggedIn && viewer.user?.did !== profile.did && tab === 'asks' ? (
          <AskForm
            className="mb-6"
            prompt={`My question for ${profile.displayName ?? profile.handle} is`}
          />
        ) : null}
        <div>
          <p>There'll be a feed here of some sort.</p>
        </div>
      </div>
    </>
  )
}
