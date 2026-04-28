import { useState, useRef } from 'react'
import { Link as LinkIcon, Unlink } from 'lucide-react'
import { cn } from '~/lib/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '~/lib/components/ui/popover'
import { Input } from '~/lib/components/ui/input'
import type { EditorInstance } from './types'

export function LinkPopover({ editor }: { editor: EditorInstance }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isActive = editor.isActive('link')

  const currentHref = editor.getAttributes('link').href as string | undefined

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setUrl(currentHref ?? '')
    }
    setOpen(nextOpen)
  }

  const applyLink = () => {
    const trimmed = url.trim()
    if (trimmed) {
      editor.chain().focus().setLink({ href: trimmed }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setOpen(false)
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyLink()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          title="Link"
          className={cn(
            'inline-flex items-center justify-center rounded size-8 transition-colors [&_svg]:size-4',
            'hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          <LinkIcon />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-2"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <div className="flex gap-1.5 font-sans">
          <Input
            ref={inputRef}
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
          {isActive && (
            <button
              type="button"
              onClick={removeLink}
              title="Remove link"
              className={cn(
                'inline-flex items-center justify-center rounded size-8 shrink-0 transition-colors [&_svg]:size-4',
                'hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
              )}
            >
              <Unlink />
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
