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
      <div className="mt-6">
        {questions.data.length > 0 ? (
          <>
            <div className="mb-4 px-4 text-sm font-sans font-medium text-muted-foreground">
              {questions.metadata.total} {questions.metadata.total == 1 ? 'Question' : 'Questions'}
            </div>
            {questions.data.map((question) => (
              <Question
                key={question.rkey}
                question={question}
                hideByline={true}
                className="pt-3 pb-6 px-4 border-t border-border"
              />
            ))}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl text-muted-foreground">
              No questions from {profile.displayName ?? profile.handle} yet.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
