import { Data } from '@generated/data'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import Question from '~/components/question'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  profile: Data.Profile
  question: Data.Question
}>

export default function ShowQuestion({ profile, question }: PageProps) {
  const handleOrDid = profile.handle ?? profile.did

  return (
    <>
      <Head
        title={`${profile.displayName ?? profile.handle} asked \u201C${question.summary}\u201D`}
      />
      <nav aria-label="Breadcrumb" className="text-sm font-sans text-muted-foreground">
        <Link
          route="profile.show"
          routeParams={{ identifier: handleOrDid }}
          className="hover:text-primary transition-colors"
        >
          {profile.displayName ?? profile.handle}
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          /
        </span>
        <Link
          route="profile.questions.index"
          routeParams={{ identifier: handleOrDid }}
          className="hover:text-primary transition-colors"
        >
          Questions
        </Link>
      </nav>
      <Question question={question} hideByline className="mt-6" />
    </>
  )
}
