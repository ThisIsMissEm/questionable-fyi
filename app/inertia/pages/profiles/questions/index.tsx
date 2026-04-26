import { Data } from '@generated/data'
import { Head } from '@inertiajs/react'
import ProfileHeader from '~/components/profile/header'
import Question from '~/components/question'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  profile: Data.Profile
  links: Data.ProfileLinks
  questions: {
    metadata: {
      total: number
    }
    data: Data.Question[]
  }
}>

export default function ShowProfileQuestions({ profile, links, questions }: PageProps) {
  return (
    <>
      <Head title={`${profile.displayName ?? profile.handle}`} />
      <ProfileHeader profile={profile} links={links} />
      <div className="profile-content">
        <div className="mb-4">
          {questions.metadata.total} {questions.metadata.total == 1 ? 'Question' : 'Questions'}
        </div>
        {questions.data.map((question) => (
          <Question
            question={question}
            hideByline={true}
            className="pt-2 pb-4 border-b border-b-gray-300"
          />
        ))}
      </div>
    </>
  )
}
