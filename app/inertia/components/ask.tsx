import type { JSONContent } from '@tiptap/react'
import { router, useForm } from '@inertiajs/react'
import { FormEventHandler, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { client, urlFor } from '~/client'
import { tiptapToLexicon } from '~/lib/richtext/tiptap_to_lexicon'
import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { RichtextEditor, type RichtextEditorRef } from '~/components/richtext/editor'
import { DiscardDialog } from '~/components/richtext/discard_dialog'
import { cn } from '~/lib/lib/utils'
import { toast } from 'sonner'

type AskProps = React.ComponentProps<'div'> & {
  context?: string
  prompt?: string
  postAsk?: () => Promise<void>
}

export default function AskForm(props: AskProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [hasEditorContent, setHasEditorContent] = useState(false)
  const editorRef = useRef<RichtextEditorRef>(null)
  const editorContentRef = useRef<JSONContent | null>(null)
  const { data, setData, processing, resetAndClearErrors, wasSuccessful } = useForm({
    title: '',
    context: props.context,
  })

  const hasContent = () => {
    if (data.title.trim()) return true
    const doc = editorContentRef.current
    if (!doc?.content?.length) return false
    return doc.content.some((node: any) => node.content?.length > 0)
  }

  const tryDiscard = () => {
    if (hasContent()) {
      setShowDiscardDialog(true)
    } else {
      discard()
    }
  }

  const discard = () => {
    setCollapsed(true)
    resetAndClearErrors()
    editorRef.current?.clearContent()
    editorContentRef.current = null
    setHasEditorContent(false)
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!editorContentRef.current) return

    const hasEditorContent = editorContentRef.current.content?.some(
      (node: any) => node.content?.length > 0
    )
    if (!hasEditorContent) {
      toast.error('Please add some details to your question.')
      return
    }

    try {
      const content = tiptapToLexicon(editorContentRef.current)

      const response = await client.api.api.ask.store({
        body: { ...data, content } as any,
      })

      if ('errors' in response) {
        toast.error('Validation failed. Please check your input.')
        return
      }

      resetAndClearErrors()
      editorRef.current?.clearContent()
      editorContentRef.current = null
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
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className={cn('ask-form', props.className)}>
      <form
        onSubmit={handleSubmit}
        inert={processing}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return
          // Don't collapse while a popup-trigger inside the form is open —
          // Radix portals its content outside the form's DOM, so focus moving
          // into a Select listbox or Popover would otherwise read as "left the form".
          if (e.currentTarget.querySelector('[aria-expanded="true"]')) return
          if (!hasContent()) discard()
        }}
      >
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
                  <Button type="button" tabIndex={-1} variant={'secondary'} onClick={tryDiscard}>
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
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.currentTarget.blur()
                  tryDiscard()
                } else if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault()
                  editorRef.current?.focus()
                }
              }}
              className="ps-4 pe-30 h-14"
              required
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
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className="py-1 flex flex-1 flex-col">
                  <RichtextEditor
                    ref={editorRef}
                    placeholder="Write more details about your question here"
                    onChange={(json) => {
                      editorContentRef.current = json
                      setHasEditorContent(
                        json.content?.some((node: any) => node.content?.length > 0) ?? false
                      )
                    }}
                    onEscape={tryDiscard}
                    className="mb-2 flex-1 w-full"
                  />
                  <Button
                    size="lg"
                    type="submit"
                    className="w-full"
                    disabled={processing || !data.title.trim() || !hasEditorContent}
                  >
                    {processing ? 'Asking...' : wasSuccessful ? 'Asked!' : 'Ask question'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      <DiscardDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onDiscard={discard}
      />
    </div>
  )
}
