import type { ReactNode } from 'react'
import { canonicalHttpUri, presentLink } from '~/lib/richtext/link_sanitization'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

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

/**
 * Renders a plaintext string with byte-range facets into React elements.
 */
function renderTextWithFacets(plaintext: string, facets?: Facet[]): ReactNode {
  if (!facets || facets.length === 0) {
    return plaintext
  }

  const bytes = encoder.encode(plaintext)
  const sorted = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)

  const segments: ReactNode[] = []
  let cursor = 0

  for (let i = 0; i < sorted.length; i++) {
    const facet = sorted[i]
    const { byteStart, byteEnd } = facet.index

    if (byteStart > cursor) {
      segments.push(decoder.decode(bytes.slice(cursor, byteStart)))
    }

    const facetText = decoder.decode(bytes.slice(byteStart, byteEnd))

    // Resolve the link feature (if any) up front so we can apply homoglyph
    // defenses: rewrite the visible text and/or drop the anchor wrapper.
    const linkFeature = facet.features.find(
      (f) => f.$type === 'fyi.questionable.richtext.facet#link'
    )
    const canonicalHref =
      linkFeature && typeof linkFeature.uri === 'string' ? canonicalHttpUri(linkFeature.uri) : null

    let displayText = facetText
    let dropLink = false
    if (linkFeature && typeof linkFeature.uri === 'string' && canonicalHref !== null) {
      const decision = presentLink(facetText, linkFeature.uri, canonicalHref)
      displayText = decision.text
      dropLink = decision.dropLink
    }

    let element: ReactNode = displayText

    for (const feature of facet.features) {
      if (feature.$type === 'fyi.questionable.richtext.facet#link') {
        // Drop links with non-http(s) URIs (javascript:, data:, …) and
        // links flagged by homoglyph detection. The text still renders.
        if (canonicalHref === null || dropLink) continue
        element = (
          <a
            key={`l-${i}`}
            href={canonicalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            {element}
          </a>
        )
      } else {
        element = wrapWithFeature(element, feature, i)
      }
    }

    segments.push(element)
    cursor = byteEnd
  }

  if (cursor < bytes.length) {
    segments.push(decoder.decode(bytes.slice(cursor)))
  }

  return segments
}

function wrapWithFeature(
  node: ReactNode,
  feature: { $type?: string; uri?: string; did?: string },
  key: number
): ReactNode {
  switch (feature.$type) {
    case 'fyi.questionable.richtext.facet#bold':
      return <strong key={`b-${key}`}>{node}</strong>
    case 'fyi.questionable.richtext.facet#italic':
      return <em key={`i-${key}`}>{node}</em>
    case 'fyi.questionable.richtext.facet#underline':
      return (
        <span key={`u-${key}`} className="underline">
          {node}
        </span>
      )
    case 'fyi.questionable.richtext.facet#strikethrough':
      return (
        <span key={`s-${key}`} className="line-through">
          {node}
        </span>
      )
    case 'fyi.questionable.richtext.facet#code':
      return <code key={`c-${key}`}>{node}</code>
    case 'fyi.questionable.richtext.facet#highlight':
      return <mark key={`h-${key}`}>{node}</mark>
    case 'fyi.questionable.richtext.facet#subscript':
      return <sub key={`sub-${key}`}>{node}</sub>
    case 'fyi.questionable.richtext.facet#superscript':
      return <sup key={`sup-${key}`}>{node}</sup>
    case 'fyi.questionable.richtext.facet#mention':
      return (
        <a key={`m-${key}`} href={`/p/${feature.did}`} className="underline text-primary">
          {node}
        </a>
      )
    default:
      return node
  }
}

function renderBlock(item: Block, index: number): ReactNode {
  switch (item.$type) {
    case 'fyi.questionable.richtext.text':
      return <p key={index}>{renderTextWithFacets(item.plaintext ?? '', item.facets)}</p>

    case 'fyi.questionable.richtext.header': {
      const content = renderTextWithFacets(item.plaintext ?? '', item.facets)
      switch (item.level) {
        case 1:
          return <h1 key={index}>{content}</h1>
        case 2:
          return <h2 key={index}>{content}</h2>
        case 3:
          return <h3 key={index}>{content}</h3>
        case 4:
          return <h4 key={index}>{content}</h4>
        case 5:
          return <h5 key={index}>{content}</h5>
        case 6:
          return <h6 key={index}>{content}</h6>
        default:
          return <h2 key={index}>{content}</h2>
      }
    }

    case 'fyi.questionable.richtext.blockquote':
      return (
        <blockquote key={index}>
          {(item.items ?? []).map((child, i) => renderBlock(child as Block, i))}
        </blockquote>
      )

    case 'fyi.questionable.richtext.code':
      return (
        <pre key={index}>
          <code className={item.language ? `language-${item.language}` : undefined}>
            {item.plaintext}
          </code>
        </pre>
      )

    case 'fyi.questionable.richtext.list': {
      const ListTag = item.ordered ? 'ol' : 'ul'
      const items = item.items ?? []

      // Group items: text blocks followed by nested lists belong in the same <li>
      const groups: { content: Block; nested: Block[] }[] = []
      for (const child of items) {
        const block = child as Block
        if (block.$type === 'fyi.questionable.richtext.list') {
          if (groups.length > 0) {
            groups[groups.length - 1].nested.push(block)
          } else {
            // Nested list with no preceding item — render standalone
            groups.push({
              content: { $type: 'fyi.questionable.richtext.text', plaintext: '' },
              nested: [block],
            })
          }
        } else {
          groups.push({ content: block, nested: [] })
        }
      }

      return (
        <ListTag key={index}>
          {groups.map((group, i) => (
            <li key={i}>
              {renderBlock(group.content, i)}
              {group.nested.map((nested, j) => renderBlock(nested, j))}
            </li>
          ))}
        </ListTag>
      )
    }

    case 'fyi.questionable.richtext.horizontalRule':
      return <hr key={index} />

    default:
      return null
  }
}

/**
 * Renders a full richtext content object to React elements.
 */
export function RichtextContent({ content }: { content: { items: readonly unknown[] } }) {
  if (!content.items || content.items.length === 0) {
    return null
  }

  return <>{content.items.map((item, index) => renderBlock(item as Block, index))}</>
}
