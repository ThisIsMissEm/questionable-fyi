import { Data } from '@generated/data'
import { Head } from '@inertiajs/react'
import Question from '~/components/question'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  profile: Data.Profile
  question: Data.Question
}>

export default function ShowProfile({ profile, question }: PageProps) {
  return (
    <>
      <Head title={`${profile.displayName ?? profile.handle} asked “${question.summary}”`} />
      <Question question={question} />
    </>
  )
}
