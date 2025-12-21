import ProfilesController from '#controllers/profiles_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import Layout from '~/app/layout'
import ProfileHeader from '~/components/profile/header'

export default function ShowProfile({ profile }: InferPageProps<ProfilesController, 'show'>) {
  return (
    <Layout>
      <Head title={`${profile.displayName ?? profile.handle}`} />
      <ProfileHeader profile={profile} />
      <div className="profile-content">
        <p>There'll be a feed here of some sort.</p>
      </div>
    </Layout>
  )
}
