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
 * AT Protocol records pass through schema validation but the schema only
 * enforces `byteStart >= 0` and `byteEnd >= 0`; it does not require the
 * range to be ordered, non-empty, or within the plaintext's byte length.
 * Drop any facet whose range would slice nonsense out of the plaintext.
 */
function isValidByteRange(
  index: { byteStart: number; byteEnd: number },
  byteLen: number
): boolean {
  const { byteStart, byteEnd } = index
  return (
    Number.isInteger(byteStart) &&
    Number.isInteger(byteEnd) &&
    byteStart >= 0 &&
    byteEnd > byteStart &&
    byteEnd <= byteLen
  )
}

/**
 * Validates and canonicalizes a link URI. Returns the WHATWG-normalized
 * `href` (lowercase scheme + host, trailing slash on empty paths, etc.) for
 * http/https URIs, or `null` for anything else (javascript:, data:, file:,
 * protocol-relative, malformed, non-string). Non-http(s) facets are dropped
 * by callers, so the underlying text content survives as plain text.
 */
function canonicalHttpUri(uri: unknown): string | null {
  if (typeof uri !== 'string') return null
  try {
    const parsed = new URL(uri)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.href
  } catch {
    return null
  }
}

/**
 * Exposes homoglyph link spoofs by rewriting visible link text when the URI
 * required canonicalization (e.g., IDN-encoded a Cyrillic host) AND the
 * text is presenting itself as that URI or its hostname. In that case the
 * reader is being told "this link goes to <visually familiar host>" while
 * it actually goes to its punycode form — surfacing the punycode in the
 * visible text removes the deception.
 *
 * Returns text unchanged when the URI was already canonical (no spoof to
 * expose) or when the text is clearly a label rather than a URL claim.
 */
function displayTextForLink(
  text: string,
  uri: string,
  canonicalHref: string
): string {
  if (canonicalHref === uri) return text
  try {
    const canonicalHostname = new URL(canonicalHref).hostname
    // `new URL(uri).hostname` already returns the canonical (punycode)
    // form, so it can't tell us whether the *text* mirrors the host as the
    // user typed it. Pull the as-typed host substring out of the URI string.
    const asTypedHost = uri.match(/^https?:\/\/([^/?#]+)/i)?.[1]
    if (asTypedHost !== undefined && text === asTypedHost) return canonicalHostname
    if (text === uri) return canonicalHref
  } catch {
    // canonicalHttpUri already parsed `uri` successfully; unreachable.
  }
  return text
}

/**
 * Converts faceted plaintext into TipTap text nodes with marks.
 */
function textNodesFromFacets(plaintext: string, facets?: Facet[]): JSONContent[] {
  if (!facets || facets.length === 0) {
    return plaintext ? [{ type: 'text', text: plaintext }] : []
  }

  const bytes = encoder.encode(plaintext)
  const sorted = [...facets]
    .filter((f) => isValidByteRange(f.index, bytes.length))
    .sort((a, b) => a.index.byteStart - b.index.byteStart)

  if (sorted.length === 0) {
    return plaintext ? [{ type: 'text', text: plaintext }] : []
  }

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

    const linkFeature = facet.features.find(
      (f): f is { $type: string; uri: string } =>
        f.$type === 'fyi.questionable.richtext.facet#link' &&
        typeof f.uri === 'string'
    )
    const linkHref = marks.find((m) => m.type === 'link')?.attrs?.['href']
    const displayText =
      linkFeature && typeof linkHref === 'string'
        ? displayTextForLink(text, linkFeature.uri, linkHref)
        : text

    nodes.push({
      type: 'text',
      text: displayText,
      ...(marks.length > 0 ? { marks } : {}),
    })
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
    case 'fyi.questionable.richtext.facet#link': {
      // Drop the mark for non-http(s) URIs (javascript:, data:, etc.); the
      // text content survives because zero-mark facets push a plain text node.
      // Canonicalize via WHATWG so consumers always see a normalized href.
      const href = canonicalHttpUri(feature.uri)
      if (href === null) return null
      return { type: 'link', attrs: { href } }
    }
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
