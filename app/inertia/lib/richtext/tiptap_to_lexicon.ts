import { utf8Len } from '@atproto/lex'
import type { JSONContent } from '@tiptap/react'

type Facet = {
  index: {
    $type: 'fyi.questionable.richtext.facet#byteSlice'
    byteStart: number
    byteEnd: number
  }
  features: { $type: string; uri?: string; did?: string }[]
}

type LexiconBlock =
  | { $type: 'fyi.questionable.richtext.text'; plaintext: string; facets?: Facet[] }
  | { $type: 'fyi.questionable.richtext.header'; level: number; plaintext: string; facets?: Facet[] }
  | { $type: 'fyi.questionable.richtext.blockquote'; plaintext: string; items: LexiconBlock[] }
  | { $type: 'fyi.questionable.richtext.code'; plaintext: string; language?: string }
  | { $type: 'fyi.questionable.richtext.list'; ordered: boolean; items: LexiconBlock[] }
  | { $type: 'fyi.questionable.richtext.horizontalRule' }

type LexiconContent = {
  $type: 'fyi.questionable.richtext.content'
  items: LexiconBlock[]
}

/**
 * Converts a TipTap mark to a lexicon facet feature.
 */
function markToFeature(mark: { type: string; attrs?: Record<string, unknown> }) {
  switch (mark.type) {
    case 'bold':
      return { $type: 'fyi.questionable.richtext.facet#bold' }
    case 'italic':
      return { $type: 'fyi.questionable.richtext.facet#italic' }
    case 'underline':
      return { $type: 'fyi.questionable.richtext.facet#underline' }
    case 'strike':
      return { $type: 'fyi.questionable.richtext.facet#strikethrough' }
    case 'code':
      return { $type: 'fyi.questionable.richtext.facet#code' }
    case 'highlight':
      return { $type: 'fyi.questionable.richtext.facet#highlight' }
    case 'link':
      return { $type: 'fyi.questionable.richtext.facet#link', uri: mark.attrs?.href as string }
    default:
      return null
  }
}

/**
 * Extracts plaintext and facets from a TipTap node's inline content.
 * Handles the conversion from tree-based marks to byte-range facets.
 */
function extractTextAndFacets(content: JSONContent[] | undefined): {
  plaintext: string
  facets: Facet[]
} {
  if (!content || content.length === 0) {
    return { plaintext: '', facets: [] }
  }

  let plaintext = ''
  let byteOffset = 0
  const facets: Facet[] = []

  for (const node of content) {
    if (node.type === 'text' && typeof node.text === 'string' && node.text.length > 0) {
      const text = node.text
      const textByteLen = utf8Len(text)

      if (node.marks && node.marks.length > 0) {
        const features = node.marks
          .map(markToFeature)
          .filter((f): f is NonNullable<typeof f> => f !== null)

        if (features.length > 0) {
          facets.push({
            index: {
              $type: 'fyi.questionable.richtext.facet#byteSlice',
              byteStart: byteOffset,
              byteEnd: byteOffset + textByteLen,
            },
            features,
          })
        }
      }

      plaintext += text
      byteOffset += textByteLen
    } else if (node.type === 'hardBreak') {
      plaintext += '\n'
      byteOffset += 1
    }
  }

  return { plaintext, facets }
}

/**
 * Extracts a plaintext string from an array of lexicon blocks,
 * joining block texts with newlines.
 */
function plaintextFromBlocks(blocks: LexiconBlock[]): string {
  return blocks
    .map((block) => {
      if ('plaintext' in block) return block.plaintext
      if ('items' in block && Array.isArray(block.items)) return plaintextFromBlocks(block.items)
      return ''
    })
    .filter((t) => t.length > 0)
    .join('\n')
}

/**
 * Converts a single TipTap block node to one or more lexicon blocks.
 * Returns an array because some nodes (e.g., blockquotes with mixed content)
 * need to be flattened into multiple lexicon blocks.
 */
function convertNode(node: JSONContent): LexiconBlock[] {
  switch (node.type) {
    case 'paragraph': {
      const { plaintext, facets } = extractTextAndFacets(node.content)
      const block: LexiconBlock = {
        $type: 'fyi.questionable.richtext.text',
        plaintext,
      }
      if (facets.length > 0) block.facets = facets
      return [block]
    }

    case 'heading': {
      const { plaintext, facets } = extractTextAndFacets(node.content)
      const block: LexiconBlock = {
        $type: 'fyi.questionable.richtext.header',
        level: node.attrs?.level ?? 2,
        plaintext,
      }
      if (facets.length > 0) block.facets = facets
      return [block]
    }

    case 'blockquote': {
      const items = (node.content ?? []).flatMap((child) => convertNode(child))
      return [{
        $type: 'fyi.questionable.richtext.blockquote',
        plaintext: plaintextFromBlocks(items),
        items,
      }]
    }

    case 'codeBlock': {
      const plaintext = (node.content ?? [])
        .filter((child) => child.type === 'text')
        .map((child) => child.text ?? '')
        .join('')

      return [{
        $type: 'fyi.questionable.richtext.code',
        plaintext,
        ...(node.attrs?.language ? { language: node.attrs.language } : {}),
      }]
    }

    case 'bulletList':
    case 'orderedList': {
      const items: LexiconBlock[] = []

      for (const child of node.content ?? []) {
        if (child.type === 'listItem') {
          // List item content (paragraphs, etc.) → convert each to a lexicon block
          for (const inner of child.content ?? []) {
            items.push(...convertNode(inner))
          }
        } else if (child.type === 'bulletList' || child.type === 'orderedList') {
          // TipTap puts nested lists as direct children, not inside listItem
          items.push(...convertNode(child))
        }
      }

      return [{
        $type: 'fyi.questionable.richtext.list',
        ordered: node.type === 'orderedList',
        items,
      }]
    }

    case 'horizontalRule':
      return [{ $type: 'fyi.questionable.richtext.horizontalRule' }]

    default:
      return []
  }
}

/**
 * Converts a TipTap document JSON to the lexicon richtext content format.
 */
function isEmptyBlock(block: LexiconBlock): boolean {
  if ('plaintext' in block && block.plaintext === '') return true
  return false
}

/**
 * Converts a TipTap document JSON to the lexicon richtext content format.
 */
export function tiptapToLexicon(doc: JSONContent): LexiconContent {
  const items = (doc.content ?? [])
    .flatMap((node) => convertNode(node))
    .filter((block) => !isEmptyBlock(block))

  return {
    $type: 'fyi.questionable.richtext.content',
    items,
  }
}
