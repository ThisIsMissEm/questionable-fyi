import { Form } from '@inertiajs/react'
import { useState } from 'react'

type AskProps = {}

export default function AskForm({}: AskProps) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="ask-form">
      <Form>
        {({ reset }) => (
          <>
            <div className="ask-form-title">
              {!collapsed && (
                <button
                  type="reset"
                  onClick={() => {
                    setCollapsed(true)
                    reset()
                  }}
                >
                  X
                </button>
              )}
              <input
                type="text"
                name="title"
                placeholder="My question is&hellip;"
                onFocus={() => setCollapsed(false)}
              />
            </div>
            {!collapsed && (
              <>
                <textarea name="content"></textarea>
                <button type="submit">Ask question</button>
              </>
            )}
          </>
        )}
      </Form>
    </div>
  )
}
