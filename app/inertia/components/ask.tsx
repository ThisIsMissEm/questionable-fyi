import { Form } from '@inertiajs/react'
import { useState } from 'react'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Textarea } from '~/lib/components/ui/textarea'

type AskProps = {}

export default function AskForm({}: AskProps) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="ask-form">
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
                placeholder="My question is&hellip;"
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
