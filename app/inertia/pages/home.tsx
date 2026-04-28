import { router, usePage } from '@inertiajs/react'
import AskForm from '~/components/ask'
import Question from '~/components/question'
import { Tabbar } from '~/components/tabs/tabbar'

import { urlFor } from '~/client'
import { InertiaProps } from '~/types'
import { useAuth } from '~/hooks/auth'
import { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/react'
import { useMemo } from 'react'
import { Button } from '~/lib/components/ui/button'

type PageProps = InertiaProps<{
  questions: {
    metadata: {
      total: number
    }
    data: Data.Question[]
  }
}>

export default function Home({ questions }: PageProps) {
  const { url } = usePage()
  const viewer = useAuth()

  const tab = useMemo(() => {
    const filter = new URLSearchParams(url.split('?', 2)[1]).get('filter')
    if (!filter || filter === 'new') {
      return 'new'
    } else if (filter === 'unanswered') {
      return 'unanswered'
    } else if (filter === 'answered') {
      return 'answered'
    }
  }, [url])

  const postAskCallback = async () => {
    router.reload({ only: ['questions'] })
  }

  return (
    <>
      {viewer.isLoggedIn ? (
        <AskForm prompt={'My question is'} postAsk={postAskCallback} />
      ) : (
        <section className="py-6 px-6 mx-1 rounded-xl border border-border">
          <h1 className="text-4xl font-semibold text-primary mb-3">
            We all have questions, let's get some answers
          </h1>
          <p className="text-lg text-muted-foreground mb-5 max-w-lg">
            Ask questions about anything, or direct them to specific people. See what others are
            curious about.
          </p>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </section>
      )}
      <section className="mt-8" aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="text-2xl font-semibold mb-1">
          Questions
        </h2>
        <Tabbar
          aria-label="Questions"
          tabs={[
            {
              id: 'new',
              title: 'New',
              link: {
                href: urlFor('home.index'),
                only: ['questions'],
              },
              isActive: tab === 'new',
            },
            {
              id: 'unanswered',
              title: 'Unanswered',
              link: {
                href: urlFor('home.index', {}, { qs: { filter: 'unanswered' } }),
                only: ['questions'],
              },
              isActive: tab === 'unanswered',
            },
            {
              id: 'answered',
              title: 'Answered',
              link: {
                href: urlFor('home.index', {}, { qs: { filter: 'answered' } }),
                only: ['questions'],
              },
              isActive: tab === 'answered',
            },
          ]}
        />
        <div className="mt-6 mb-8">
          {questions.data.length > 0 ? (
            questions.data.map((question) => (
              <Question
                key={question.rkey}
                question={question}
                className="pt-3 pb-6 px-4 border-b border-border"
              />
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-xl text-muted-foreground mb-3">
                No questions yet. Curious minds are welcome.
              </p>
              <p className="text-muted-foreground">
                {viewer.isLoggedIn
                  ? 'Be the first to ask something.'
                  : 'Sign up to start asking questions.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
