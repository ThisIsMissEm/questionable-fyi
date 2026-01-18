import { Form } from '@inertiajs/react'
import { FocusEventHandler, useState } from 'react'
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
          <div className="flex flex-col gap-3">
            <div className="ask-form-title relative">
              {!collapsed && (
                <div className="absolute top-2 right-2">
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
                </div>
              )}
              <Input
                type="text"
                name="title"
                placeholder={`${props.prompt}...`}
                onFocus={() => setCollapsed(false)}
                className="ps-4 pe-24 h-14"
              />
            </div>
            {!collapsed && (
              <>
                <Textarea name="content"></Textarea>
                <Button size="lg" type="submit">
                  Ask question
                </Button>
              </>
            )}
          </div>
        )}
      </Form>
    </div>
  )
}
