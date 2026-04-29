import { describe, it, expect } from 'vitest'
import { utf8Len } from '@atproto/lex'
import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
import { lexiconToTiptap } from './lexicon_to_tiptap'
import { basicTiptap, basicLexicon } from './__fixtures__/basic'
import { kitchenSinkTiptap, kitchenSinkLexicon } from './__fixtures__/kitchen_sink'

function expectValidInput(value: unknown) {
  // Inputs that pass the lexicon schema are the ones we care about — validating
  // tests against rejected-by-prod inputs would document fictional behavior.
  const result = $safeValidate(value)
  expect(result.success, JSON.stringify(result, null, 2)).toBe(true)
}

const BYTE_SLICE = 'fyi.questionable.richtext.facet#byteSlice'

function content(items: Array<Record<string, unknown>>) {
  return { $type: 'fyi.questionable.richtext.content', items }
}

function byteSlice(byteStart: number, byteEnd: number) {
  return { $type: BYTE_SLICE, byteStart, byteEnd }
}

describe('lexiconToTiptap', () => {
  describe('block types', () => {
    it('converts a text block to a paragraph', () => {
      const input = content([
        { $type: 'fyi.questionable.richtext.text', plaintext: 'hello' },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input)).toEqual({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
        ],
      })
    })

    it('converts a header block to a heading with the right level', () => {
      const input = content([
        { $type: 'fyi.questionable.richtext.header', level: 3, plaintext: 'h3' },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input)).toEqual({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'h3' }],
          },
        ],
      })
    })

    it('converts a blockquote with empty items to an empty blockquote', () => {
      const input = content([
        {
          $type: 'fyi.questionable.richtext.blockquote',
          plaintext: '',
          items: [],
        },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input)).toEqual({
        type: 'doc',
        content: [{ type: 'blockquote', content: [] }],
      })
    })

    it('emits attrs.language only when code block has language', () => {
      const input = content([
        {
          $type: 'fyi.questionable.richtext.code',
          plaintext: 'a',
          language: 'ts',
        },
        {
          $type: 'fyi.questionable.richtext.code',
          plaintext: 'b',
        },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input).content).toEqual([
        {
          type: 'codeBlock',
          attrs: { language: 'ts' },
          content: [{ type: 'text', text: 'a' }],
        },
        {
          type: 'codeBlock',
          attrs: {},
          content: [{ type: 'text', text: 'b' }],
        },
      ])
    })

    it('converts ordered and bullet lists with listItem wrappers', () => {
      const items = ['apples', 'bananas', 'cherries', 'dates']
      const input = content([
        {
          $type: 'fyi.questionable.richtext.list',
          ordered: false,
          items: items.map((plaintext) => ({
            $type: 'fyi.questionable.richtext.text',
            plaintext,
          })),
        },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input).content).toEqual([
        {
          type: 'bulletList',
          content: items.map((text) => ({
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text }] },
            ],
          })),
        },
      ])
    })

    it('does NOT wrap a nested list in a listItem', () => {
      const topItems = ['first top', 'second top', 'third top']
      const innerItems = ['inner one', 'inner two', 'inner three']
      const input = content([
        {
          $type: 'fyi.questionable.richtext.list',
          ordered: false,
          items: [
            ...topItems.map((plaintext) => ({
              $type: 'fyi.questionable.richtext.text',
              plaintext,
            })),
            {
              $type: 'fyi.questionable.richtext.list',
              ordered: true,
              items: innerItems.map((plaintext) => ({
                $type: 'fyi.questionable.richtext.text',
                plaintext,
              })),
            },
          ],
        },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input).content?.[0]).toEqual({
        type: 'bulletList',
        content: [
          ...topItems.map((text) => ({
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text }] },
            ],
          })),
          // nested list appears directly, no listItem wrapper:
          {
            type: 'orderedList',
            content: innerItems.map((text) => ({
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text }] },
              ],
            })),
          },
        ],
      })
    })

    it('converts horizontalRule', () => {
      const input = content([{ $type: 'fyi.questionable.richtext.horizontalRule' }])
      expectValidInput(input)
      expect(lexiconToTiptap(input).content).toEqual([{ type: 'horizontalRule' }])
    })
  })

  describe('facet handling', () => {
    function paragraphWithOneFacet(
      plaintext: string,
      substring: string,
      features: unknown[]
    ) {
      const charIdx = plaintext.indexOf(substring)
      const before = plaintext.slice(0, charIdx)
      const byteStart = utf8Len(before)
      const byteEnd = byteStart + utf8Len(substring)
      return content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [{ index: byteSlice(byteStart, byteEnd), features }],
        },
      ])
    }

    it.each([
      ['bold', 'fyi.questionable.richtext.facet#bold', 'bold'],
      ['italic', 'fyi.questionable.richtext.facet#italic', 'italic'],
      ['underline', 'fyi.questionable.richtext.facet#underline', 'underline'],
      ['strikethrough → strike', 'fyi.questionable.richtext.facet#strikethrough', 'strike'],
      ['code', 'fyi.questionable.richtext.facet#code', 'code'],
      ['highlight', 'fyi.questionable.richtext.facet#highlight', 'highlight'],
    ])('maps %s feature to a single mark', (_label, featureType, expectedMarkType) => {
      const input = paragraphWithOneFacet('hi', 'hi', [{ $type: featureType }])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ marks?: Array<{ type: string }> }>
      }
      expect(para.content[0].marks).toEqual([{ type: expectedMarkType }])
    })

    it('maps a link feature to a link mark with href attr', () => {
      const input = paragraphWithOneFacet('docs', 'docs', [
        { $type: 'fyi.questionable.richtext.facet#link', uri: 'https://example.com/docs' },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ marks?: Array<{ type: string; attrs?: { href: string } }> }>
      }
      expect(para.content[0].marks).toEqual([
        { type: 'link', attrs: { href: 'https://example.com/docs' } },
      ])
    })

    it('returns a single unmarked text node when there are no facets', () => {
      const input = content([
        { $type: 'fyi.questionable.richtext.text', plaintext: 'plain' },
      ])
      expectValidInput(input)
      expect(lexiconToTiptap(input).content?.[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'plain' }],
      })
    })

    it('produces gap text nodes around facets at the start, middle, and end', () => {
      // plaintext: "abXXcdYYef" where XX and YY are bold runs.
      // A: 0-2 unmarked, X: 2-4 bold, b: 4-6 unmarked, Y: 6-8 bold, e: 8-10 unmarked
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext: 'abXXcdYYef',
          facets: [
            {
              index: byteSlice(2, 4),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
            {
              index: byteSlice(6, 8),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: 'ab' },
        { type: 'text', text: 'XX', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'cd' },
        { type: 'text', text: 'YY', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'ef' },
      ])
    })

    it('sorts facets by byteStart even when supplied out of order', () => {
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext: 'aXbYc',
          facets: [
            // Y first, then X — must end up byte-ordered in the output.
            {
              index: byteSlice(3, 4),
              features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
            },
            {
              index: byteSlice(1, 2),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: Array<{ type: string }> }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: 'a' },
        { type: 'text', text: 'X', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'b' },
        { type: 'text', text: 'Y', marks: [{ type: 'italic' }] },
        { type: 'text', text: 'c' },
      ])
    })

    it('produces sequential text nodes for non-overlapping facets in one paragraph', () => {
      // Mirror of the tiptap_to_lexicon "sequential mark transitions" test.
      const plaintext = 'The quick brown fox jumps over the lazy dog'
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(4, 15),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
            {
              index: byteSlice(16, 25),
              features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: Array<{ type: string }> }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: 'The ' },
        { type: 'text', text: 'quick brown', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' ' },
        { type: 'text', text: 'fox jumps', marks: [{ type: 'italic' }] },
        { type: 'text', text: ' over the lazy dog' },
      ])
    })

    it('reconstructs overlapping marks via three facets covering a shared run', () => {
      // Markdown analogue: "foo **bar **__**baz**____ quux__"
      //   bold spans "bar baz", italic spans "baz quux", overlap on "baz".
      // The lexicon encodes the overlap as three sequential facets where the
      // middle one carries both features.
      const plaintext = 'foo bar baz quux'
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(4, 8),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
            {
              index: byteSlice(8, 11),
              features: [
                { $type: 'fyi.questionable.richtext.facet#bold' },
                { $type: 'fyi.questionable.richtext.facet#italic' },
              ],
            },
            {
              index: byteSlice(11, 16),
              features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: Array<{ type: string }> }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: 'foo ' },
        { type: 'text', text: 'bar ', marks: [{ type: 'bold' }] },
        {
          type: 'text',
          text: 'baz',
          marks: [{ type: 'bold' }, { type: 'italic' }],
        },
        { type: 'text', text: ' quux', marks: [{ type: 'italic' }] },
      ])
    })

    it('does not emit empty gap nodes between back-to-back facets', () => {
      // Bold and italic touch at byte 6 — no gap text node should appear.
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext: 'BOLDEDITALIC',
          facets: [
            {
              index: byteSlice(0, 6),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
            {
              index: byteSlice(6, 12),
              features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: Array<{ type: string }> }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: 'BOLDED', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'ITALIC', marks: [{ type: 'italic' }] },
      ])
    })

    it('drops unknown facet feature types', () => {
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext: 'hi',
          facets: [
            {
              index: byteSlice(0, 2),
              features: [{ $type: 'fyi.questionable.richtext.facet#unknown' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      // Filtered to no marks; text remains.
      expect(para.content).toEqual([{ type: 'text', text: 'hi' }])
    })
  })

  describe('UTF-8 byte slicing', () => {
    it('decodes facets that land on multi-byte character boundaries', () => {
      // "Hello café" — bold on "café" (5 bytes, starts after 6 ASCII bytes)
      const plaintext = 'Hello café'
      const byteStart = utf8Len('Hello ')
      const byteEnd = byteStart + utf8Len('café')
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(byteStart, byteEnd),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'café', marks: [{ type: 'bold' }] },
      ])
    })

    it('handles emoji at facet boundaries', () => {
      // "wave 👋 done" — link span on "wave 👋" crosses the emoji
      const plaintext = 'wave 👋 done'
      const byteStart = 0
      const byteEnd = utf8Len('wave 👋')
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(byteStart, byteEnd),
              features: [
                { $type: 'fyi.questionable.richtext.facet#link', uri: 'https://hi' },
              ],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'wave 👋',
        marks: [{ type: 'link', attrs: { href: 'https://hi' } }],
      })
    })
  })

  describe('edge cases', () => {
    it('handles content with empty items array', () => {
      const input = content([])
      expectValidInput(input)
      expect(lexiconToTiptap(input)).toEqual({ type: 'doc', content: [] })
    })

    it('drops blocks with unknown $type', () => {
      const input = content([
        { $type: 'fyi.questionable.richtext.unknown', plaintext: 'huh' },
        { $type: 'fyi.questionable.richtext.text', plaintext: 'real' },
      ])
      // The unknown $type can't be schema-validated; skip the validator for this case
      // (production never receives unknown types — we just want defensive behavior).
      expect(lexiconToTiptap(input).content).toEqual([
        { type: 'paragraph', content: [{ type: 'text', text: 'real' }] },
      ])
    })

    it('emits a text node with no marks when facet features array is empty', () => {
      // Note: the lexicon schema may reject zero-length features, but the converter
      // should still behave defensively if it ever sees this shape.
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext: 'hi',
          facets: [{ index: byteSlice(0, 2), features: [] }],
        },
      ])
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      expect(para.content).toEqual([{ type: 'text', text: 'hi' }])
    })
  })

  describe('fixture-level integration', () => {
    it('matches the basic fixture tiptap document', () => {
      expectValidInput(basicLexicon)
      expect(lexiconToTiptap(basicLexicon)).toEqual(basicTiptap)
    })

    it('matches the kitchen sink fixture tiptap document', () => {
      expectValidInput(kitchenSinkLexicon)
      expect(lexiconToTiptap(kitchenSinkLexicon)).toEqual(kitchenSinkTiptap)
    })
  })
})
