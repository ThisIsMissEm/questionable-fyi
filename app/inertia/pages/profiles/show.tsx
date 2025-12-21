import ProfilesController from '#controllers/profiles_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'

export default function ShowProfile({ profile }: InferPageProps<ProfilesController, 'show'>) {
  return (
    <>
      <h1>
        <Link href="/">Questionable</Link>
      </h1>
      <h2>{profile.displayName ?? profile.handle ?? profile.did}</h2>
      <p>@{profile.handle ?? profile.did}</p>
    </>
  )
}
