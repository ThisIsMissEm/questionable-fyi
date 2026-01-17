import ProfilesController from '#controllers/profiles_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Head, usePage } from '@inertiajs/react'
import Layout from '~/app/layout'
import AskForm from '~/components/ask'
import ProfileHeader from '~/components/profile/header'

export default function ShowProfile({
  profile,
  user,
  isAuthenticated,
}: InferPageProps<ProfilesController, 'show'>) {
  const { url } = usePage()
  const tab = new URLSearchParams(url.split('?', 2)[1]).get('tab') ?? 'asks'
  return (
    <Layout>
      <Head title={`${profile.displayName ?? profile.handle}`} />
      <ProfileHeader profile={profile} />
      <div className="profile-content">
        {isAuthenticated && user?.did !== profile.did && tab === 'asks' ? <AskForm /> : null}
        <p>There'll be a feed here of some sort.</p>
      </div>
    </Layout>
  )
}
