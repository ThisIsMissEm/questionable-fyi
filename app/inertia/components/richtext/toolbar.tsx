import { useEditorState } from '@tiptap/react'
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
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
} from 'lucide-react'
import {
  Toolbar as ToolbarRoot,
  ToolbarButton,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarSeparator,
} from '~/lib/components/ui/toolbar'
import type { EditorInstance } from './types'
import { LinkPopover } from './link_popover'
import { AbbrPopover } from './abbr_popover'
import { StyleSelect } from './style_select'

const MARK_KEYS = ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'] as const
type MarkKey = (typeof MARK_KEYS)[number]

const BLOCK_KEYS = ['bulletList', 'orderedList', 'blockquote', 'codeBlock'] as const
type BlockKey = (typeof BLOCK_KEYS)[number]

export function Toolbar({ editor }: { editor: EditorInstance }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isUnderline: e.isActive('underline'),
      isStrike: e.isActive('strike'),
      isSubscript: e.isActive('subscript'),
      isSuperscript: e.isActive('superscript'),
      isCode: e.isActive('code'),
      isBulletList: e.isActive('bulletList'),
      isOrderedList: e.isActive('orderedList'),
      isBlockquote: e.isActive('blockquote'),
      isCodeBlock: e.isActive('codeBlock'),
    }),
  })

  const markCommands: Record<MarkKey, () => boolean> = {
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    underline: () => editor.chain().focus().toggleUnderline().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    subscript: () => editor.chain().focus().toggleSubscript().run(),
    superscript: () => editor.chain().focus().toggleSuperscript().run(),
  }

  const blockCommands: Record<BlockKey, () => boolean> = {
    bulletList: () => editor.chain().focus().toggleBulletList().run(),
    orderedList: () => editor.chain().focus().toggleOrderedList().run(),
    blockquote: () => editor.chain().focus().toggleBlockquote().run(),
    codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
  }

  const activeMarks = (
    [
      state.isBold && 'bold',
      state.isItalic && 'italic',
      state.isUnderline && 'underline',
      state.isStrike && 'strike',
      state.isSubscript && 'subscript',
      state.isSuperscript && 'superscript',
    ] as Array<MarkKey | false>
  ).filter((v): v is MarkKey => Boolean(v))

  const activeBlocks = (
    [
      state.isBulletList && 'bulletList',
      state.isOrderedList && 'orderedList',
      state.isBlockquote && 'blockquote',
      state.isCodeBlock && 'codeBlock',
    ] as Array<BlockKey | false>
  ).filter((v): v is BlockKey => Boolean(v))

  return (
    <ToolbarRoot aria-label="Formatting" className="border-b border-input px-1 py-1">
      <ToolbarToggleGroup
        type="multiple"
        value={activeMarks}
        onValueChange={(next) => {
          for (const mark of MARK_KEYS) {
            if (activeMarks.includes(mark) !== next.includes(mark)) markCommands[mark]()
          }
        }}
      >
        <ToolbarToggleItem value="bold" title="Bold">
          <Bold />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" title="Italic">
          <Italic />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" title="Underline">
          <UnderlineIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="strike" title="Strikethrough">
          <Strikethrough />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="subscript" title="Subscript">
          <SubscriptIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="superscript" title="Superscript">
          <SuperscriptIcon />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>

      <LinkPopover editor={editor} />
      <AbbrPopover editor={editor} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        aria-pressed={state.isCode}
        title="Inline code"
      >
        <Code />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton asChild className={'border-none shadow-none h-8 gap-1 px-2 w-[16ch]'}>
        <StyleSelect editor={editor} />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarToggleGroup
        type="multiple"
        value={activeBlocks}
        onValueChange={(next) => {
          for (const block of BLOCK_KEYS) {
            if (activeBlocks.includes(block) !== next.includes(block)) blockCommands[block]()
          }
        }}
      >
        <ToolbarToggleItem value="bulletList" title="Bullet list">
          <List />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="orderedList" title="Numbered list">
          <ListOrdered />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="blockquote" title="Blockquote">
          <Quote />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="codeBlock" title="Code block">
          <SquareCode />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus />
      </ToolbarButton>
    </ToolbarRoot>
  )
}
