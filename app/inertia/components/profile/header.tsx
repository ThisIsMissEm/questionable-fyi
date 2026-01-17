import { useEffect, useState } from 'react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import { Form, router, usePage } from '@inertiajs/react'
import { Tab } from '~/components/tabs/tab'
import Modal from '~/components/modal'

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
          <h2>{profile.displayName ?? profile.handle ?? profile.did}</h2>
          <p>@{handleOrDid}</p>
        </div>
        {props.isAuthenticated && props.user?.did === profile.did && (
          <div className="profile-edit">
            <button onClick={() => showEdit(true)}>Edit Profile</button>
          </div>
        )}
        <Modal title="Edit Profile" open={editing} onClose={() => showEdit(false)}>
          <Form method="PUT" onSuccess={onProfileEditSuccess}>
            {({ processing }) => (
              <>
                <label htmlFor="displayName">Display Name:</label>
                <input type="text" name="displayName" defaultValue={profile.displayName ?? ''} />
                <label htmlFor="description">Description:</label>
                <textarea name="description" rows={3} defaultValue={profile.description?.trim()} />
                <button type="submit" disabled={processing}>
                  {processing ? 'Updating profile...' : 'Save profile'}
                </button>
              </>
            )}
          </Form>
        </Modal>
      </div>
      <div className="profile-description">{profile.description}</div>

      <nav>
        <ul>
          <li>
            <Tab
              href={`/p/${handleOrDid}?tab=asks`}
              className={
                (component == 'profiles/show' && !url.includes('tab=')) || url.includes('tab=asks')
                  ? 'active'
                  : ''
              }
            >
              Asks
            </Tab>
          </li>
          <li>
            <Tab
              href={`/p/${handleOrDid}?tab=questions`}
              className={url.includes('tab=questions') ? 'active' : ''}
            >
              Questions
            </Tab>
          </li>
          <li>
            <Tab
              href={`/p/${handleOrDid}?tab=answers`}
              className={url.includes('tab=answers') ? 'active' : ''}
            >
              Answers
            </Tab>
          </li>
        </ul>
      </nav>
    </div>
  )
}
