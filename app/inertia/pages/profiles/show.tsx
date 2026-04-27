import { useMemo } from 'react'
import { AtUri } from '@atproto/syntax'
import { Data } from '@generated/data'
import { Head, usePage } from '@inertiajs/react'
import AskForm from '~/components/ask'
import ProfileHeader from '~/components/profile/header'
import { useAuth } from '~/hooks/use-auth'
import { InertiaProps } from '~/types'
import { $nsid as ProfileNSID } from '#lexicons/fyi/questionable/actor/profile'

type PageProps = InertiaProps<{
  profile: Data.Profile
  links: Data.ProfileLinks
}>

export default function ShowProfile({ profile, links }: PageProps) {
  const { url } = usePage()
  const viewer = useAuth()

  const tab = new URLSearchParams(url.split('?', 2)[1]).get('tab') ?? 'asks'

  const context = useMemo(() => {
    return AtUri.make(profile.did, ProfileNSID, 'self').toString()
  }, [profile])

  return (
    <>
      <Head title={`${profile.displayName ?? profile.handle}`} />
      <ProfileHeader profile={profile} links={links} />
      <div className="mt-6">
        {viewer.isLoggedIn && viewer.user?.did !== profile.did && tab === 'asks' ? (
          <AskForm
            className="mb-6 px-3"
            prompt={`My question for ${profile.displayName ?? profile.handle} is`}
            context={context}
          />
        ) : null}
        <div className="py-12 text-center">
          <p className="text-xl text-muted-foreground">
            {profile.did === viewer?.user?.did
              ? 'You have no activity here yet.'
              : `No activity from ${profile.displayName ?? profile.handle} yet.`}
          </p>
        </div>
      </div>
    </>
  )
}
