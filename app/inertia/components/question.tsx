import * as richtext from '#lexicons/fyi/questionable/richtext'
import { Data } from '@generated/data'
import { Link, usePage } from '@inertiajs/react'
import { useMemo } from 'react'
import { urlFor } from '~/client'

type QuestionProps = React.ComponentProps<'div'> & {
  question: Data.Question
  hideByline?: boolean
}

export default function Question({ question, hideByline, ...restProps }: QuestionProps) {
  const page = usePage()
  const createdAt = Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(
    Date.parse(question.createdAt ?? '')
  )

  const questionUrl = useMemo(() => {
    return urlFor('profile.questions.show', {
      identifier: question.profile.handle ?? question.profile.did,
      id: question.rkey,
    })
  }, [question])

  const content =
    question.content?.items.map((item, index) => {
      if (richtext.text.$matches(item)) {
        return <p key={index}>{item.plaintext}</p>
      }
    }) ?? []

  return (
    <div {...restProps}>
      <span className="text-secondary text-sm font-sans">
        {hideByline ? (
          <>
            Asked on{' '}
            {page.url == questionUrl ? createdAt : <Link href={questionUrl}>{createdAt}</Link>}
          </>
        ) : (
          <>
            <Link href={`/p/${question.profile.handle ?? question.profile.did}`}>
              <strong>{question.profile.displayName ?? `@${question.profile.handle}`}</strong>
            </Link>{' '}
            asked on{' '}
            {page.url == questionUrl ? createdAt : <Link href={questionUrl}>{createdAt}</Link>}
          </>
        )}
      </span>
      <h2 className="text-3xl mb-3">
        {page.url == questionUrl ? (
          question.summary
        ) : (
          <Link href={questionUrl}>{question.summary}</Link>
        )}
      </h2>
      <div className="my-3">{content}</div>
    </div>
  )
}
