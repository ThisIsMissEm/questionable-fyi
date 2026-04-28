import { useState } from 'react'
import type { useEditor } from '@tiptap/react'
import { lexiconToTiptap } from '~/lib/richtext/lexicon_to_tiptap'

export function DevTools({ editor }: { editor: ReturnType<typeof useEditor> }) {
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
            className="flex-1 rounded border border-input bg-transparent p-1 font-mono text-xs min-h-15"
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
