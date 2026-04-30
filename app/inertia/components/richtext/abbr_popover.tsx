import { useState, useRef } from 'react'
import { useEditorState } from '@tiptap/react'
import { SquareDashedText } from 'lucide-react'
import { cn } from '~/lib/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '~/lib/components/ui/popover'
import { Input } from '~/lib/components/ui/input'
import { ToolbarButton } from '~/lib/components/ui/toolbar'
import type { EditorInstance } from './types'

/**
 * Validate an abbreviation title before applying it as a mark.
 *
 * The lexicon (`fyi.questionable.richtext.facet#abbr`) requires `title` to be
 * a string of 5-300 chars (also bounded by 300 graphemes). Empty input is a
 * sentinel for "remove the mark" and is handled by the popover before this
 * runs — by the time validate() is called, `title` is non-empty.
 *
 * Returns `null` when the title is valid, or a user-facing error string when
 * it isn't. Mirrors the contract used by `isAcceptableLinkUri` in LinkPopover.
 *
 * TODO(user): Fill in the validation rules. Considerations:
 *   - Range: 5-300 chars matches the lexicon's hard gate.
 *   - Whitespace: trim before measuring? Allow leading/trailing spaces?
 *   - Grapheme vs char count: lexicon enforces both `maxLength` and
 *     `maxGraphemes`. Length check covers most cases; pathological emoji
 *     combinations would slip through but be rejected at save time.
 *   - Error message: short and actionable, surfaced via role="alert".
 */
function validateAbbrTitle(title: string): string | null {
  // TODO(user): replace this placeholder with real validation
  if (title.length < 5) return 'Abbreviation title must be at least 5 characters.'
  if (title.length > 300) return 'Abbreviation title must be at most 300 characters.'
  return null
}

export function AbbrPopover({ editor }: { editor: EditorInstance }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { isActive, currentTitle, selectionEmpty } = useEditorState<{
    isActive: boolean
    currentTitle: string | undefined
    selectionEmpty: boolean
  }>({
    editor,
    selector: ({ editor: e }) => ({
      isActive: e.isActive('abbr'),
      currentTitle: e.getAttributes('abbr').title,
      selectionEmpty: e.state.selection.empty,
    }),
  })

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(currentTitle ?? '')
      setError(null)
    }
    setOpen(nextOpen)
  }

  const applyAbbr = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      if (isActive) editor.chain().focus().unsetAbbr().run()
      setOpen(false)
      return
    }
    const errorMessage = validateAbbrTitle(trimmed)
    if (errorMessage !== null) {
      setError(errorMessage)
      return
    }
    editor.chain().focus().setAbbr({ title: trimmed }).run()
    setOpen(false)
  }

  const handleTitleChange = (next: string) => {
    setTitle(next)
    if (error) setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyAbbr()
    }
  }

  // Disable the trigger when the editor selection is empty AND no abbr is
  // already active — there's nothing to mark and nothing to edit. Keeping it
  // enabled when an abbr IS active means a single click inside an existing
  // abbr opens the popover for editing.
  const triggerDisabled = selectionEmpty && !isActive

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <ToolbarButton title="Abbreviation" aria-pressed={isActive} disabled={triggerDisabled}>
          <SquareDashedText />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-2"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <div className={cn('flex gap-1.5 font-sans')}>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Document Object Model"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
            aria-invalid={error !== null}
            aria-describedby={error ? 'abbr-popover-error' : undefined}
          />
        </div>
        {error && (
          <p
            id="abbr-popover-error"
            role="alert"
            className="mt-1.5 text-xs text-destructive font-sans"
          >
            {error}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
