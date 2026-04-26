import { router, useForm } from '@inertiajs/react'
import { FormEventHandler, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { client, urlFor } from '~/client'

import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'
import { cn } from '~/lib/lib/utils'
import { toast } from 'sonner'

type AskProps = React.ComponentProps<'div'> & {
  context?: string
  prompt?: string
  postAsk?: () => Promise<void>
}

export default function AskForm(props: AskProps) {
  const [collapsed, setCollapsed] = useState(true)
  const { data, setData, processing, resetAndClearErrors, wasSuccessful } = useForm({
    title: '',
    content: '',
    context: props.context,
  })

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    try {
      const response = await client.api.api.ask.store({
        body: data,
      })

      resetAndClearErrors()
      setCollapsed(true)

      toast.success('Question asked!', {
        action: data.context === undefined && {
          label: 'View Question',
          onClick: () => {
            router.visit(
              urlFor('profile.questions.show', {
                identifier: response.identifier,
                id: response.rkey,
              })
            )
          },
        },
      })

      if (typeof props.postAsk === 'function') {
        await props.postAsk()
      }
    } catch (err) {
      console.error(err)
      toast.error('Error asking question')
    }
  }

  return (
    <div className={cn('ask-form', props.className)}>
      <form onSubmit={handleSubmit} inert={processing}>
        <div className="flex flex-col gap-3 pb-2">
          <div className="ask-form-title relative">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="absolute top-0 bottom-0 right-1 flex items-center overflow-hidden px-1"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                >
                  <Button
                    type="reset"
                    variant={'secondary'}
                    onClick={() => {
                      setCollapsed(true)
                      resetAndClearErrors()
                    }}
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Input
              type="text"
              name="title"
              placeholder={`${props.prompt}...`}
              onFocus={() => setCollapsed(false)}
              className="ps-4 pe-30 h-14"
              autoComplete="off"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
            />
            {props.context && <input type="hidden" name="context" value={data.context} />}
          </div>
          <AnimatePresence presenceAffectsLayout>
            {!collapsed && (
              <motion.div
                layout
                className="overflow-y-clip flex"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 200, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className="py-1 flex flex-1 flex-col">
                  <Textarea
                    name="content"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Write more details about your question here"
                    className="mb-2 flex-1 w-full resize-none"
                  ></Textarea>
                  <Button size="lg" type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Asking...' : wasSuccessful ? 'Asked!' : 'Ask question'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  )
}
