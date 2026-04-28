import type { JSONContent } from '@tiptap/react'

type Facet = {
  index: { byteStart: number; byteEnd: number }
  features: { $type?: string; uri?: string; did?: string }[]
}

type Block = {
  $type?: string
  plaintext?: string
  facets?: Facet[]
  level?: number
  language?: string
  ordered?: boolean
  items?: Block[]
}

type LexiconContent = {
  $type?: string
  items?: Block[]
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Converts faceted plaintext into TipTap text nodes with marks.
 */
function textNodesFromFacets(plaintext: string, facets?: Facet[]): JSONContent[] {
  if (!facets || facets.length === 0) {
    return plaintext ? [{ type: 'text', text: plaintext }] : []
  }

  const bytes = encoder.encode(plaintext)
  const sorted = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)

  const nodes: JSONContent[] = []
  let cursor = 0

  for (const facet of sorted) {
    const { byteStart, byteEnd } = facet.index

    if (byteStart > cursor) {
      nodes.push({ type: 'text', text: decoder.decode(bytes.slice(cursor, byteStart)) })
    }

    const text = decoder.decode(bytes.slice(byteStart, byteEnd))
    const marks = facet.features
      .map(featureToMark)
      .filter((m): m is NonNullable<typeof m> => m !== null)

    nodes.push({ type: 'text', text, ...(marks.length > 0 ? { marks } : {}) })
    cursor = byteEnd
  }

  if (cursor < bytes.length) {
    nodes.push({ type: 'text', text: decoder.decode(bytes.slice(cursor)) })
  }

  return nodes
}

function featureToMark(feature: { $type?: string; uri?: string }): { type: string; attrs?: Record<string, unknown> } | null {
  switch (feature.$type) {
    case 'fyi.questionable.richtext.facet#bold': return { type: 'bold' }
    case 'fyi.questionable.richtext.facet#italic': return { type: 'italic' }
    case 'fyi.questionable.richtext.facet#underline': return { type: 'underline' }
    case 'fyi.questionable.richtext.facet#strikethrough': return { type: 'strike' }
    case 'fyi.questionable.richtext.facet#code': return { type: 'code' }
    case 'fyi.questionable.richtext.facet#highlight': return { type: 'highlight' }
    case 'fyi.questionable.richtext.facet#link': return { type: 'link', attrs: { href: feature.uri } }
    default: return null
  }
}

function convertBlock(block: Block): JSONContent | null {
  switch (block.$type) {
    case 'fyi.questionable.richtext.text':
      return {
        type: 'paragraph',
        content: textNodesFromFacets(block.plaintext ?? '', block.facets),
      }

    case 'fyi.questionable.richtext.header':
      return {
        type: 'heading',
        attrs: { level: block.level ?? 2 },
        content: textNodesFromFacets(block.plaintext ?? '', block.facets),
      }

    case 'fyi.questionable.richtext.blockquote': {
      const children = (block.items ?? [])
        .map((child) => convertBlock(child))
        .filter((n): n is JSONContent => n !== null)
      return { type: 'blockquote', content: children }
    }

    case 'fyi.questionable.richtext.code':
      return {
        type: 'codeBlock',
        attrs: block.language ? { language: block.language } : {},
        content: block.plaintext ? [{ type: 'text', text: block.plaintext }] : [],
      }

    case 'fyi.questionable.richtext.list': {
      const items = (block.items ?? []).map((item) => {
        if (item.$type === 'fyi.questionable.richtext.list') {
          return convertBlock(item)
        }
        const converted = convertBlock(item)
        return converted ? { type: 'listItem', content: [converted] } : null
      }).filter((n): n is JSONContent => n !== null)

      return {
        type: block.ordered ? 'orderedList' : 'bulletList',
        content: items,
      }
    }

    case 'fyi.questionable.richtext.horizontalRule':
      return { type: 'horizontalRule' }

    default:
      return null
  }
}

/**
 * Converts lexicon richtext content JSON to a TipTap document.
 */
export function lexiconToTiptap(content: LexiconContent): JSONContent {
  const children = (content.items ?? [])
    .map((block) => convertBlock(block))
    .filter((n): n is JSONContent => n !== null)

  return { type: 'doc', content: children }
}
