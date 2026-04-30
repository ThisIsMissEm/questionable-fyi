import { describe, it, expect } from 'vitest'
import { utf8Len } from '@atproto/lex'
import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
import type { JSONContent } from '@tiptap/react'
import { tiptapToLexicon } from './tiptap_to_lexicon'
import { basicTiptap, basicLexicon } from './__fixtures__/basic'
import { kitchenSinkTiptap, kitchenSinkLexicon } from './__fixtures__/kitchen_sink'

function expectValidLexicon(value: unknown) {
  const result = $safeValidate(value)
  expect(result.success, JSON.stringify(result, null, 2)).toBe(true)
}

function doc(...children: JSONContent[]): JSONContent {
  return { type: 'doc', content: children }
}

const BYTE_SLICE = 'fyi.questionable.richtext.facet#byteSlice'

describe('tiptapToLexicon', () => {
  describe('block types', () => {
    it('converts a plain paragraph to a text block with no facets', () => {
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [{ type: 'text', text: 'hello world' }],
        })
      )
      expect(result).toEqual({
        $type: 'fyi.questionable.richtext.content',
        items: [
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'hello world',
          },
        ],
      })
      expectValidLexicon(result)
    })

    it('converts headings with explicit levels', () => {
      const result = tiptapToLexicon(
        doc(
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'h2' }],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'h3' }],
          }
        )
      )
      expect(result.items).toEqual([
        { $type: 'fyi.questionable.richtext.header', level: 2, plaintext: 'h2' },
        { $type: 'fyi.questionable.richtext.header', level: 3, plaintext: 'h3' },
      ])
      expectValidLexicon(result)
    })

    it('falls back to level 2 when heading attrs.level is missing', () => {
      const result = tiptapToLexicon(
        doc({
          type: 'heading',
          content: [{ type: 'text', text: 'untyped' }],
        })
      )
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.header',
        level: 2,
        plaintext: 'untyped',
      })
      expectValidLexicon(result)
    })

    it('flattens a blockquote with mixed children via flatMap', () => {
      const result = tiptapToLexicon(
        doc({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'quoted' }],
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'inner' }],
            },
          ],
        })
      )
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.blockquote',
        plaintext: 'quoted\ninner',
        items: [
          { $type: 'fyi.questionable.richtext.text', plaintext: 'quoted' },
          { $type: 'fyi.questionable.richtext.header', level: 3, plaintext: 'inner' },
        ],
      })
      expectValidLexicon(result)
    })

    it('emits language only when codeBlock has attrs.language', () => {
      const result = tiptapToLexicon(
        doc(
          {
            type: 'codeBlock',
            attrs: { language: 'ts' },
            content: [{ type: 'text', text: 'const x = 1' }],
          },
          {
            type: 'codeBlock',
            attrs: {},
            content: [{ type: 'text', text: 'no lang' }],
          }
        )
      )
      expect(result.items).toEqual([
        {
          $type: 'fyi.questionable.richtext.code',
          plaintext: 'const x = 1',
          language: 'ts',
        },
        {
          $type: 'fyi.questionable.richtext.code',
          plaintext: 'no lang',
        },
      ])
      expectValidLexicon(result)
    })

    it('converts bullet and ordered lists with multiple items', () => {
      const bulletItems = ['apples', 'bananas', 'cherries']
      const orderedItems = ['first', 'second', 'third', 'fourth']
      const result = tiptapToLexicon(
        doc(
          {
            type: 'bulletList',
            content: bulletItems.map((text) => ({
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text }] },
              ],
            })),
          },
          {
            type: 'orderedList',
            content: orderedItems.map((text) => ({
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text }] },
              ],
            })),
          }
        )
      )
      expect(result.items).toEqual([
        {
          $type: 'fyi.questionable.richtext.list',
          ordered: false,
          items: bulletItems.map((plaintext) => ({
            $type: 'fyi.questionable.richtext.text',
            plaintext,
          })),
        },
        {
          $type: 'fyi.questionable.richtext.list',
          ordered: true,
          items: orderedItems.map((plaintext) => ({
            $type: 'fyi.questionable.richtext.text',
            plaintext,
          })),
        },
      ])
      expectValidLexicon(result)
    })

    it('handles a list nested as a direct child of another list (no listItem wrapper)', () => {
      const topItems = ['first top', 'second top', 'third top']
      const innerItems = ['inner one', 'inner two', 'inner three']
      const result = tiptapToLexicon(
        doc({
          type: 'bulletList',
          content: [
            ...topItems.map((text) => ({
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text }] },
              ],
            })),
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
      )
      expect(result.items[0]).toEqual({
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
      })
      expectValidLexicon(result)
    })

    it('converts horizontalRule', () => {
      const result = tiptapToLexicon(doc({ type: 'horizontalRule' }))
      expect(result.items).toEqual([
        { $type: 'fyi.questionable.richtext.horizontalRule' },
      ])
      expectValidLexicon(result)
    })

    it('inserts a newline + 1-byte offset for hardBreak inside a paragraph', () => {
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [
            { type: 'text', text: 'a' },
            { type: 'hardBreak' },
            { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
          ],
        })
      )
      // 'a' is 1 byte, '\n' is 1 byte, so 'b' starts at byte 2.
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.text',
        plaintext: 'a\nb',
        facets: [
          {
            index: { $type: BYTE_SLICE, byteStart: 2, byteEnd: 3 },
            features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
          },
        ],
      })
      expectValidLexicon(result)
    })
  })

  describe('mark types', () => {
    function paragraphWithMarks(text: string, marks: JSONContent['marks']): JSONContent {
      return {
        type: 'paragraph',
        content: [{ type: 'text', text, marks }],
      }
    }

    it.each([
      ['bold', [{ type: 'bold' }], { $type: 'fyi.questionable.richtext.facet#bold' }],
      ['italic', [{ type: 'italic' }], { $type: 'fyi.questionable.richtext.facet#italic' }],
      ['underline', [{ type: 'underline' }], { $type: 'fyi.questionable.richtext.facet#underline' }],
      ['strike → strikethrough', [{ type: 'strike' }], { $type: 'fyi.questionable.richtext.facet#strikethrough' }],
      ['code', [{ type: 'code' }], { $type: 'fyi.questionable.richtext.facet#code' }],
      ['highlight', [{ type: 'highlight' }], { $type: 'fyi.questionable.richtext.facet#highlight' }],
      ['subscript', [{ type: 'subscript' }], { $type: 'fyi.questionable.richtext.facet#subscript' }],
      ['superscript', [{ type: 'superscript' }], { $type: 'fyi.questionable.richtext.facet#superscript' }],
    ])('maps %s mark to a single-feature facet', (_label, marks, expectedFeature) => {
      const result = tiptapToLexicon(doc(paragraphWithMarks('hi', marks)))
      const item = result.items[0] as { facets?: Array<{ features: unknown[] }> }
      expect(item.facets?.[0].features).toEqual([expectedFeature])
      expectValidLexicon(result)
    })

    it('maps subscript + bold marks on one text node to a single facet with both features', () => {
      const result = tiptapToLexicon(
        doc(paragraphWithMarks('2', [{ type: 'subscript' }, { type: 'bold' }]))
      )
      const item = result.items[0] as { facets?: Array<{ features: unknown[] }> }
      expect(item.facets?.[0].features).toEqual([
        { $type: 'fyi.questionable.richtext.facet#subscript' },
        { $type: 'fyi.questionable.richtext.facet#bold' },
      ])
      expectValidLexicon(result)
    })

    it('maps a link mark to a link feature carrying the uri', () => {
      const result = tiptapToLexicon(
        doc(
          paragraphWithMarks('docs', [
            { type: 'link', attrs: { href: 'https://example.com/docs' } },
          ])
        )
      )
      const item = result.items[0] as { facets?: Array<{ features: unknown[] }> }
      expect(item.facets?.[0].features).toEqual([
        { $type: 'fyi.questionable.richtext.facet#link', uri: 'https://example.com/docs' },
      ])
      expectValidLexicon(result)
    })

    it('emits one facet with multiple features when a text node has multiple marks', () => {
      const result = tiptapToLexicon(
        doc(paragraphWithMarks('both', [{ type: 'bold' }, { type: 'italic' }]))
      )
      const item = result.items[0] as { facets?: Array<{ features: unknown[] }> }
      expect(item.facets?.[0].features).toEqual([
        { $type: 'fyi.questionable.richtext.facet#bold' },
        { $type: 'fyi.questionable.richtext.facet#italic' },
      ])
      expectValidLexicon(result)
    })

    it('produces distinct facets for sequential mark transitions in one paragraph', () => {
      // "The quick brown fox jumps over the lazy dog"
      //  ↑word 1   ↑words 2-3       ↑words 4-5     ↑remainder
      //  unmarked  bold              italic         unmarked
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [
            { type: 'text', text: 'The ' },
            { type: 'text', text: 'quick brown', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'fox jumps', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' over the lazy dog' },
          ],
        })
      )
      // ASCII so char index == byte index.
      // 'The ' = 0-4, 'quick brown' = 4-15, ' ' = 15-16, 'fox jumps' = 16-25
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.text',
        plaintext: 'The quick brown fox jumps over the lazy dog',
        facets: [
          {
            index: { $type: BYTE_SLICE, byteStart: 4, byteEnd: 15 },
            features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
          },
          {
            index: { $type: BYTE_SLICE, byteStart: 16, byteEnd: 25 },
            features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
          },
        ],
      })
      expectValidLexicon(result)
    })

    it('produces three facets when bold and italic spans overlap on a shared word', () => {
      // Markdown analogue: "foo **bar **__**baz**____ quux__"
      //   "foo " plain → "bar " bold → "baz" bold+italic → " quux" italic
      // The bold span covers "bar baz" and the italic span covers "baz quux";
      // the two overlap on "baz". TipTap represents the overlap as a text node
      // carrying both marks, which produces a single facet with two features.
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [
            { type: 'text', text: 'foo ' },
            { type: 'text', text: 'bar ', marks: [{ type: 'bold' }] },
            {
              type: 'text',
              text: 'baz',
              marks: [{ type: 'bold' }, { type: 'italic' }],
            },
            { type: 'text', text: ' quux', marks: [{ type: 'italic' }] },
          ],
        })
      )
      // Bytes (ASCII): 'foo '=0-4, 'bar '=4-8, 'baz'=8-11, ' quux'=11-16
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.text',
        plaintext: 'foo bar baz quux',
        facets: [
          {
            index: { $type: BYTE_SLICE, byteStart: 4, byteEnd: 8 },
            features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
          },
          {
            index: { $type: BYTE_SLICE, byteStart: 8, byteEnd: 11 },
            features: [
              { $type: 'fyi.questionable.richtext.facet#bold' },
              { $type: 'fyi.questionable.richtext.facet#italic' },
            ],
          },
          {
            index: { $type: BYTE_SLICE, byteStart: 11, byteEnd: 16 },
            features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
          },
        ],
      })
      expectValidLexicon(result)
    })

    it('produces back-to-back facets when marks transition with no gap', () => {
      // 'BOLDED' has bold mark, 'ITALIC' has italic — no whitespace between.
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [
            { type: 'text', text: 'BOLDED', marks: [{ type: 'bold' }] },
            { type: 'text', text: 'ITALIC', marks: [{ type: 'italic' }] },
          ],
        })
      )
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.text',
        plaintext: 'BOLDEDITALIC',
        facets: [
          {
            index: { $type: BYTE_SLICE, byteStart: 0, byteEnd: 6 },
            features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
          },
          {
            index: { $type: BYTE_SLICE, byteStart: 6, byteEnd: 12 },
            features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
          },
        ],
      })
      expectValidLexicon(result)
    })

    it('silently drops unknown mark types', () => {
      const result = tiptapToLexicon(
        doc(paragraphWithMarks('weird', [{ type: 'unknownMark' }]))
      )
      // Unknown marks produce no features, and zero-features facets are skipped.
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.text',
        plaintext: 'weird',
      })
      expectValidLexicon(result)
    })
  })

  describe('UTF-8 byte offsets', () => {
    it('uses byte length, not char length, for accented characters', () => {
      const text = 'héllo'
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [{ type: 'text', text, marks: [{ type: 'bold' }] }],
        })
      )
      const item = result.items[0] as { facets?: Array<{ index: { byteEnd: number } }> }
      expect(item.facets?.[0].index.byteEnd).toBe(utf8Len(text))
      expect(item.facets?.[0].index.byteEnd).toBe(6) // 4 ASCII + é (2 bytes)
      expectValidLexicon(result)
    })

    it('handles emoji (4-byte) byte offsets correctly', () => {
      const text = 'hi 👋'
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [{ type: 'text', text, marks: [{ type: 'bold' }] }],
        })
      )
      const item = result.items[0] as { facets?: Array<{ index: { byteEnd: number } }> }
      expect(item.facets?.[0].index.byteEnd).toBe(utf8Len(text))
      expect(item.facets?.[0].index.byteEnd).toBe(7) // "hi " (3) + 👋 (4)
      expectValidLexicon(result)
    })

    it('places facet boundaries on character boundaries when marks span multi-byte text', () => {
      // unmarked "Hello " (6 bytes) + bold "café" (5 bytes) + unmarked rest
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'café', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' world' },
          ],
        })
      )
      const item = result.items[0] as {
        facets?: Array<{ index: { byteStart: number; byteEnd: number } }>
      }
      expect(item.facets?.[0].index).toMatchObject({ byteStart: 6, byteEnd: 11 })
      expectValidLexicon(result)
    })
  })

  describe('empty-input edge cases', () => {
    it('filters empty paragraphs out of the result', () => {
      const result = tiptapToLexicon(
        doc(
          { type: 'paragraph', content: [] },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'kept' }],
          }
        )
      )
      expect(result.items).toEqual([
        { $type: 'fyi.questionable.richtext.text', plaintext: 'kept' },
      ])
      expectValidLexicon(result)
    })

    it('handles a document with no content field', () => {
      const result = tiptapToLexicon({ type: 'doc' })
      expect(result).toEqual({
        $type: 'fyi.questionable.richtext.content',
        items: [],
      })
      expectValidLexicon(result)
    })

    it('skips empty text nodes inside a paragraph', () => {
      const result = tiptapToLexicon(
        doc({
          type: 'paragraph',
          content: [
            { type: 'text', text: '' },
            { type: 'text', text: 'real' },
          ],
        })
      )
      expect(result.items[0]).toEqual({
        $type: 'fyi.questionable.richtext.text',
        plaintext: 'real',
      })
      expectValidLexicon(result)
    })
  })

  describe('fixture-level integration', () => {
    it('matches the basic fixture lexicon', () => {
      const result = tiptapToLexicon(basicTiptap)
      expect(result).toEqual(basicLexicon)
      expectValidLexicon(result)
    })

    it('matches the kitchen sink fixture lexicon', () => {
      const result = tiptapToLexicon(kitchenSinkTiptap)
      expect(result).toEqual(kitchenSinkLexicon)
      expectValidLexicon(result)
    })
  })
})
