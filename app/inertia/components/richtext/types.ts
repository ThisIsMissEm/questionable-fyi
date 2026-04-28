import type { useEditor, JSONContent } from '@tiptap/react'

export type EditorInstance = NonNullable<ReturnType<typeof useEditor>>

export type RichtextEditorRef = {
  clearContent: () => void
}

export type RichtextEditorProps = {
  placeholder?: string
  onChange?: (json: JSONContent) => void
  onEscape?: () => void
  className?: string
}
