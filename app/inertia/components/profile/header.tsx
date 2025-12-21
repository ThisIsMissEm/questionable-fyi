import { usePage } from '@inertiajs/react'
import { Tab } from '~/components/tabs/tab'

export type ProfileHeaderProps = {
  profile: {
    displayName: string | null
    handle: string | null
    did: string
  }
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const handleOrDid = profile.handle ?? profile.did
  const { component } = usePage()

  return (
    <div className="profile-header">
      <div className="profile-details">
        <h2>{profile.displayName ?? profile.handle ?? profile.did}</h2>
        <p>@{handleOrDid}</p>
      </div>

      <nav>
        <ul>
          <li>
            <Tab
              href={`/p/${handleOrDid}`}
              className={component == 'profiles/show' ? 'active' : ''}
            >
              Asks
            </Tab>
          </li>
          <li>
            <Tab href="#">Questions</Tab>
          </li>
          <li>
            <Tab href="#">Answers</Tab>
          </li>
        </ul>
      </nav>
    </div>
  )
}
