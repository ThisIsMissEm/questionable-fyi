import * as richtext from '#lexicons/fyi/questionable/richtext'
import { Data } from '@generated/data'
import { Link, usePage } from '@inertiajs/react'
import { useMemo } from 'react'
import { urlFor } from '~/client'

type QuestionProps = React.ComponentProps<'article'> & {
  question: Data.Question
  hideByline?: boolean
}

export default function Question({ question, hideByline, ...restProps }: QuestionProps) {
  const page = usePage()
  const parsedDate = new Date(question.createdAt ?? '')
  const createdAt = Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(parsedDate)
  const isoDate = parsedDate.toISOString()

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

  const isDetailPage = page.url == questionUrl

  const dateElement = (
    <time dateTime={isoDate}>
      {isDetailPage ? createdAt : <Link href={questionUrl}>{createdAt}</Link>}
    </time>
  )

  const byline = (
    <span className="text-secondary text-sm font-sans">
      {hideByline ? (
        <>Asked on {dateElement}</>
      ) : (
        <>
          <Link href={`/p/${question.profile.handle ?? question.profile.did}`}>
            <strong>{question.profile.displayName ?? `@${question.profile.handle}`}</strong>
          </Link>{' '}
          asked on {dateElement}
        </>
      )}
    </span>
  )

  const heading = (
    <h2 className={isDetailPage ? 'text-3xl font-semibold' : 'text-2xl font-semibold'}>
      {isDetailPage ? question.summary : <Link href={questionUrl}>{question.summary}</Link>}
    </h2>
  )

  return (
    <article {...restProps}>
      {isDetailPage ? (
        <header>
          {heading}
          <div className="mt-1">{byline}</div>
        </header>
      ) : (
        <header>
          {byline}
          {heading}
        </header>
      )}
      {content.length > 0 && (
        <div
          className={
            isDetailPage
              ? 'mt-6 max-w-prose space-y-4'
              : 'mt-2 max-w-prose line-clamp-3 text-muted-foreground'
          }
        >
          {content}
        </div>
      )}
    </article>
  )
}
