import type { ComponentProps } from 'react'
import { useEditorState } from '@tiptap/react'
import { Type, Heading1, Heading2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/lib/components/ui/select'
import { cn } from '~/lib/lib/utils'
import type { EditorInstance } from './types'

type StyleSelectProps = { editor: EditorInstance } & Omit<
  ComponentProps<typeof SelectTrigger>,
  'children'
>

export function StyleSelect({ editor, className, ...triggerProps }: StyleSelectProps) {
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
        {...triggerProps}
        className={cn('border-none shadow-none h-8 gap-1 px-2 w-[16ch]', className)}
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
