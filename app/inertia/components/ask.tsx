import { Form } from '@inertiajs/react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'
import { cn } from '~/lib/lib/utils'

type AskProps = React.ComponentProps<'div'> & {
  prompt?: string
}

export default function AskForm(props: AskProps) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className={cn('ask-form', props.className)}>
      <Form>
        {({ reset }) => (
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
                        reset()
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
              />
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
                      placeholder="Write more details about your question here"
                      className="mb-2 flex-1 w-full resize-none"
                    ></Textarea>
                    {/* <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 48 }}
                      exit={{ opacity: 1, height: 0 }}
                    > */}
                    <Button size="lg" type="submit" className="w-full">
                      Ask question
                    </Button>
                    {/* </motion.div> */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Form>
    </div>
  )
}
