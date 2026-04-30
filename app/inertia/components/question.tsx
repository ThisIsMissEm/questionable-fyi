import { Data } from '@generated/data'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useMemo } from 'react'
import { urlFor } from '~/client'
import { RichtextContent } from '~/components/richtext/content'

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
      {question.content && question.content.items.length > 0 && (
        <div
          className={
            isDetailPage
              ? 'richtext-prose richtext-content mt-6'
              : 'richtext-prose mt-2 line-clamp-3 text-muted-foreground'
          }
        >
          <RichtextContent content={question.content} />
        </div>
      )}
    </article>
  )
}
