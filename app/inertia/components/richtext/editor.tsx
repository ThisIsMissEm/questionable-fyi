import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useImperativeHandle, forwardRef, useRef } from 'react'
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
} from 'lucide-react'
import { cn } from '~/lib/lib/utils'
import type { RichtextEditorRef, RichtextEditorProps } from './types'
import { LinkPopover } from './link_popover'
import { StyleSelect } from './style_select'
import { DevTools } from './dev_tools'

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

        <StyleSelect editor={editor} />

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
export type { RichtextEditorRef, RichtextEditorProps } from './types'
