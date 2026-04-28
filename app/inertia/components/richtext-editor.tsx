import { useEditor, useEditorState, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useImperativeHandle, forwardRef, useState, useRef } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  SquareCode,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Unlink,
  Type,
  Heading1,
  Heading2,
} from 'lucide-react'
import { cn } from '~/lib/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/lib/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '~/lib/components/ui/popover'
import { Input } from '~/lib/components/ui/input'
import { lexiconToTiptap } from '~/lib/richtext/lexicon_to_tiptap'

export type RichtextEditorRef = {
  clearContent: () => void
}

export type RichtextEditorProps = {
  placeholder?: string
  onChange?: (json: JSONContent) => void
  onEscape?: () => void
  className?: string
}

const RichtextEditor = forwardRef<RichtextEditorRef, RichtextEditorProps>(function RichtextEditor(
  { placeholder, onChange, onEscape, className },
  ref
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'underline text-primary' },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write more details...',
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'richtext-prose richtext-editor-content outline-none min-h-[120px] px-3 py-2 font-serif',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
  })

  useImperativeHandle(ref, () => ({
    clearContent: () => editor?.commands.clearContent(),
  }))

  const containerRef = useRef<HTMLDivElement>(null)

  if (!editor) return null

  return (
    <div
      ref={containerRef}
      className={cn(
        'border-input dark:bg-input/30 rounded-md border bg-transparent shadow-xs',
        className
      )}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onEscape) {
          e.preventDefault()
          onEscape()
        }
        if (
          e.key === 'Tab' &&
          e.shiftKey &&
          e.target === containerRef.current?.querySelector('.tiptap')
        ) {
          e.preventDefault()
          const firstButton = containerRef.current?.querySelector<HTMLElement>(
            '[data-slot="toolbar"] button'
          )
          firstButton?.focus()
        }
      }}
    >
      <div
        role="toolbar"
        aria-label="Formatting"
        data-slot="toolbar"
        className="flex flex-wrap gap-0.5 border-b border-input px-1 py-1"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
          const toolbar = e.currentTarget
          const buttons = Array.from(
            toolbar.querySelectorAll<HTMLElement>('button, [data-slot="select-trigger"]')
          )
          const index = buttons.indexOf(e.target as HTMLElement)
          if (index === -1) return
          e.preventDefault()
          const next =
            e.key === 'ArrowRight'
              ? buttons[(index + 1) % buttons.length]
              : buttons[(index - 1 + buttons.length) % buttons.length]
          next?.focus()
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough />
        </ToolbarButton>
        <LinkPopover editor={editor} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          <Code />
        </ToolbarButton>

        <ToolbarSeparator />

        <BlockTypeSelect editor={editor} />

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          <SquareCode />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Horizontal rule"
        >
          <Minus />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {import.meta.env.DEV && <DevTools editor={editor} />}
    </div>
  )
})

function DevTools({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showInput, setShowInput] = useState<'lexicon' | 'tiptap' | null>(null)
  const [json, setJson] = useState('')

  if (!editor) return null

  const loadLexiconJson = () => {
    try {
      const parsed = JSON.parse(json)
      const tiptapDoc = lexiconToTiptap(parsed)
      editor.commands.setContent(tiptapDoc)
      setJson('')
      setShowInput(null)
    } catch {
      alert('Invalid JSON')
    }
  }

  const loadTiptapJson = () => {
    try {
      const parsed = JSON.parse(json)
      editor.commands.setContent(parsed)
      setJson('')
      setShowInput(null)
    } catch {
      alert('Invalid JSON')
    }
  }

  const dumpJson = () => {
    const content = editor.getJSON()
    navigator.clipboard.writeText(JSON.stringify(content, null, 2))
  }

  return (
    <div className="border-t border-input px-2 py-1 font-sans text-xs text-muted-foreground">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowInput(showInput === 'lexicon' ? null : 'lexicon')}
          className="hover:text-foreground"
        >
          Load Lexicon JSON
        </button>
        <button
          type="button"
          onClick={() => setShowInput(showInput === 'tiptap' ? null : 'tiptap')}
          className="hover:text-foreground"
        >
          Load TipTap JSON
        </button>
        <button type="button" onClick={dumpJson} className="hover:text-foreground">
          Copy TipTap JSON
        </button>
      </div>
      {showInput && (
        <div className="mt-1 flex gap-1">
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={
              showInput === 'lexicon'
                ? 'Paste lexicon richtext JSON here...'
                : 'Paste TipTap JSON here...'
            }
            className="flex-1 rounded border border-input bg-transparent p-1 font-mono text-xs min-h-[60px]"
          />
          <button
            type="button"
            onClick={showInput === 'lexicon' ? loadLexiconJson : loadTiptapJson}
            className="self-end rounded bg-primary px-2 py-1 text-primary-foreground"
          >
            Load
          </button>
        </div>
      )}
    </div>
  )
}

function LinkPopover({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
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

function BlockTypeSelect({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const blockType = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (e?.isActive('heading', { level: 2 })) return '2'
      if (e?.isActive('heading', { level: 3 })) return '3'
      return 'p'
    },
  })

  return (
    <Select
      value={blockType}
      onValueChange={(val) => {
        if (val === 'p') {
          editor.chain().focus().setNode('paragraph').run()
        } else {
          editor
            .chain()
            .focus()
            .setHeading({ level: Number(val) as 2 | 3 })
            .run()
        }
      }}
    >
      <SelectTrigger
        size="sm"
        tabIndex={-1}
        className="border-none shadow-none h-8 gap-1 px-2 w-[16ch]"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="p">
          <Type className="size-4" /> Normal
        </SelectItem>
        <SelectItem value="2">
          <Heading1 className="size-4" /> Heading 1
        </SelectItem>
        <SelectItem value="3">
          <Heading2 className="size-4" /> Heading 2
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      title={title}
      className={cn(
        'inline-flex items-center justify-center rounded size-8 transition-colors [&_svg]:size-4',
        'hover:bg-accent hover:text-accent-foreground',
        active && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}

function ToolbarSeparator() {
  return <div className="mx-0.5 w-px self-stretch bg-border" />
}

export { RichtextEditor }
