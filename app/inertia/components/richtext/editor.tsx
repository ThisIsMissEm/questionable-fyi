import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useImperativeHandle, forwardRef } from 'react'
import { cn } from '~/lib/lib/utils'
import type { RichtextEditorRef, RichtextEditorProps } from './types'
import { Toolbar } from './toolbar'
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
    focus: () => editor?.commands.focus(),
  }))

  if (!editor) return null

  return (
    <div
      className={cn(
        'border-input dark:bg-input/30 rounded-md border bg-transparent shadow-xs',
        className
      )}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onEscape) {
          e.preventDefault()
          onEscape()
        }
      }}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {import.meta.env.DEV && <DevTools editor={editor} />}
    </div>
  )
})

export { RichtextEditor }
export type { RichtextEditorRef, RichtextEditorProps } from './types'
