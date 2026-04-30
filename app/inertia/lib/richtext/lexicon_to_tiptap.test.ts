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
      ['subscript', 'fyi.questionable.richtext.facet#subscript', 'subscript'],
      ['superscript', 'fyi.questionable.richtext.facet#superscript', 'superscript'],
    ])('maps %s feature to a single mark', (_label, featureType, expectedMarkType) => {
      const input = paragraphWithOneFacet('hi', 'hi', [{ $type: featureType }])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ marks?: Array<{ type: string }> }>
      }
      expect(para.content[0].marks).toEqual([{ type: expectedMarkType }])
    })

    it('maps a facet with subscript + bold to a text node carrying both marks', () => {
      const input = paragraphWithOneFacet('H2', '2', [
        { $type: 'fyi.questionable.richtext.facet#subscript' },
        { $type: 'fyi.questionable.richtext.facet#bold' },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ marks?: Array<{ type: string }> }>
      }
      expect(para.content[1].marks).toEqual([
        { type: 'subscript' },
        { type: 'bold' },
      ])
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
          plaintext: 'testing',
          facets: [
            {
              index: byteSlice(0, 4),
              features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
            },
            {
              index: byteSlice(4, 7),
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
        { type: 'text', text: 'test', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'ing', marks: [{ type: 'italic' }] },
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
                { $type: 'fyi.questionable.richtext.facet#link', uri: 'https://example.com/wave' },
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
        marks: [{ type: 'link', attrs: { href: 'https://example.com/wave' } }],
      })
    })

    it('preserves a ZWJ family emoji wholly inside a facet', () => {
      // 👨‍👩‍👧‍👧 = man + ZWJ + woman + ZWJ + girl + ZWJ + girl: 7 code points,
      // 25 UTF-8 bytes for one visible cluster. The byte slicer has to span
      // every joiner cleanly or we'd emit a fractured family.
      const family = '👨‍👩‍👧‍👧'
      const plaintext = `meet ${family} here`
      const byteStart = utf8Len('meet ')
      const byteEnd = byteStart + utf8Len(family)
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
        { type: 'text', text: 'meet ' },
        { type: 'text', text: family, marks: [{ type: 'bold' }] },
        { type: 'text', text: ' here' },
      ])
    })

    it('preserves a skin-tone modifier emoji wholly inside a facet', () => {
      // 👋🏽 = wave + medium-skin-tone modifier: 2 code points, 8 UTF-8
      // bytes. A boundary between the two code points would leave an
      // orphan modifier on either side.
      const wave = '👋🏽'
      const plaintext = `${wave} hi`
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(0, utf8Len(wave)),
              features: [
                {
                  $type: 'fyi.questionable.richtext.facet#link',
                  uri: 'https://example.com/wave',
                },
              ],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: Array<{ type: string }> }>
      }
      expect(para.content[0].text).toBe(wave)
      expect(para.content[0].marks?.[0]?.type).toBe('link')
      expect(para.content[1].text).toBe(' hi')
    })

    it('keeps adjacent ZWJ family emoji separable when only one is faceted', () => {
      // Back-to-back fat-unicode clusters with no separator. The byte
      // counter has to land exactly on the boundary between the two
      // 25-byte clusters; off-by-one bytes would shred either cluster.
      const family = '👨‍👩‍👧‍👧'
      const plaintext = `${family}${family}`
      const input = content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(0, utf8Len(family)),
              features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
            },
          ],
        },
      ])
      expectValidInput(input)
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      expect(para.content).toEqual([
        { type: 'text', text: family, marks: [{ type: 'italic' }] },
        { type: 'text', text: family },
      ])
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

  describe('input sanitization (defense against malicious-but-schema-valid input)', () => {
    describe('byte range validation', () => {
      it('drops facets with byteEnd < byteStart (inverted range)', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'hello',
            facets: [
              {
                index: byteSlice(4, 1),
                features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        expect(para.content).toEqual([{ type: 'text', text: 'hello' }])
      })

      it('drops facets with byteEnd > plaintext byte length', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'hello',
            facets: [
              {
                index: byteSlice(0, 99),
                features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        expect(para.content).toEqual([{ type: 'text', text: 'hello' }])
      })

      it('drops facets with byteStart > plaintext byte length', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'hello',
            facets: [
              {
                index: byteSlice(99, 100),
                features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        expect(para.content).toEqual([{ type: 'text', text: 'hello' }])
      })

      it('drops zero-length facets (byteStart === byteEnd)', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'hello',
            facets: [
              {
                index: byteSlice(2, 2),
                features: [{ $type: 'fyi.questionable.richtext.facet#bold' }],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        // Empty-range facets would produce an empty TipTap text node, which
        // the schema rejects. Drop them instead.
        expect(para.content).toEqual([{ type: 'text', text: 'hello' }])
      })

      it('keeps valid facets even when other facets in the same block are invalid', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'hello world',
            facets: [
              {
                index: byteSlice(99, 1), // inverted + out of bounds → drop
                features: [{ $type: 'fyi.questionable.richtext.facet#italic' }],
              },
              {
                index: byteSlice(6, 11), // bold "world" → keep
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
          { type: 'text', text: 'hello ' },
          { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
        ])
      })
    })

    describe('link URI validation', () => {
      function paragraphWithLinkFacet(plaintext: string, uri: string) {
        return content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext,
            facets: [
              {
                index: byteSlice(0, plaintext.length),
                features: [
                  { $type: 'fyi.questionable.richtext.facet#link', uri },
                ],
              },
            ],
          },
        ])
      }

      it.each([
        ['javascript:alert(1)'],
        ['data:text/html,<script>alert(1)</script>'],
        ['vbscript:msgbox("hi")'],
        ['file:///etc/passwd'],
        ['mailto:victim@example.com'],
        ['ftp://example.com'],
        ['//protocol-relative.example.com'],
        ['/relative/path'],
        ['relative/path'],
        [''],
      ])('drops link feature with non-http(s) URI: %s → plain text', (uri) => {
        // Skip expectValidInput — the lexicon URI format check is loose enough
        // to accept some of these. The point is the converter sanitizes them.
        const input = paragraphWithLinkFacet('click me', uri)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        expect(para.content).toEqual([{ type: 'text', text: 'click me' }])
      })

      it.each([
        ['http://example.com', 'http://example.com/'],
        ['https://example.com', 'https://example.com/'],
        ['HTTPS://EXAMPLE.COM/PATH', 'https://example.com/PATH'],
        [
          'https://example.com/path?query=1#fragment',
          'https://example.com/path?query=1#fragment',
        ],
      ])(
        'keeps link feature with valid http(s) URI: %s → canonical %s',
        (uri, canonical) => {
          const input = paragraphWithLinkFacet('safe link', uri)
          expectValidInput(input)
          const para = lexiconToTiptap(input).content?.[0] as {
            content: Array<{ text: string; marks?: Array<{ attrs?: { href: string } }> }>
          }
          expect(para.content[0].marks).toEqual([
            { type: 'link', attrs: { href: canonical } },
          ])
        }
      )

      it('drops only the link feature when other features on the same facet are valid', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'mixed',
            facets: [
              {
                index: byteSlice(0, 5),
                features: [
                  {
                    $type: 'fyi.questionable.richtext.facet#link',
                    uri: 'javascript:alert(1)',
                  },
                  { $type: 'fyi.questionable.richtext.facet#bold' },
                ],
              },
            ],
          },
        ])
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: Array<{ type: string }> }>
        }
        expect(para.content).toEqual([
          { type: 'text', text: 'mixed', marks: [{ type: 'bold' }] },
        ])
      })

      it('drops link feature with non-string uri', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'broken',
            facets: [
              {
                index: byteSlice(0, 6),
                features: [
                  { $type: 'fyi.questionable.richtext.facet#link', uri: null },
                ],
              },
            ],
          },
        ])
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        expect(para.content).toEqual([{ type: 'text', text: 'broken' }])
      })
    })
  })

  describe('OWASP / unicode link sanitization', () => {
    function paragraphWithLinkFacet(plaintext: string, uri: unknown) {
      return content([
        {
          $type: 'fyi.questionable.richtext.text',
          plaintext,
          facets: [
            {
              index: byteSlice(0, plaintext.length),
              features: [
                { $type: 'fyi.questionable.richtext.facet#link', uri },
              ],
            },
          ],
        },
      ])
    }

    function getLinkHref(input: ReturnType<typeof content>): string | undefined {
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ marks?: Array<{ attrs?: { href: string } }> }>
      }
      return para.content[0].marks?.[0]?.attrs?.href
    }

    function expectLinkDropped(input: ReturnType<typeof content>, plaintext: string) {
      const para = lexiconToTiptap(input).content?.[0] as {
        content: Array<{ text: string; marks?: unknown[] }>
      }
      expect(para.content).toEqual([{ type: 'text', text: plaintext }])
    }

    describe('scheme-confusion XSS attempts (rejected)', () => {
      it.each([
        // Case variations of dangerous schemes — WHATWG lowercases protocol.
        'JaVaScRiPt:alert(1)',
        'JAVASCRIPT:alert(1)',
        'Javascript:alert(1)',
        'javaScript:alert(1)',
        'Data:text/html,<script>alert(1)</script>',
        'DATA:text/html,foo',
        'VBScript:msgbox("x")',
        // Leading whitespace — WHATWG strips ASCII whitespace before parsing.
        ' javascript:alert(1)',
        '  javascript:alert(1)',
        '\tjavascript:alert(1)',
        '\njavascript:alert(1)',
        '\rjavascript:alert(1)',
        // Trailing whitespace
        'javascript:alert(1)\n',
        'javascript:alert(1) ',
        // Whitespace inside scheme — WHATWG strips \t \r \n.
        'java\tscript:alert(1)',
        'java\nscript:alert(1)',
        'java\rscript:alert(1)',
      ])('rejects scheme-confusion attempt: %j', (uri) => {
        expectLinkDropped(paragraphWithLinkFacet('click', uri), 'click')
      })
    })

    describe('zero-width / invisible character scheme attempts (rejected)', () => {
      // These chars are NOT in WHATWG's strip-list (only \t \r \n are stripped).
      // They remain in the URL string and break scheme parsing → new URL throws.
      it.each([
        ['soft hyphen', 'java\u00ADscript:alert(1)'],
        ['zero-width space', 'java\u200Bscript:alert(1)'],
        ['zero-width non-joiner', 'java\u200Cscript:alert(1)'],
        ['zero-width joiner', 'java\u200Dscript:alert(1)'],
        ['word joiner', 'java\u2060script:alert(1)'],
        ['BOM', 'java\uFEFFscript:alert(1)'],
        ['null byte', 'java\u0000script:alert(1)'],
        ['LTR override', 'java\u202Dscript:alert(1)'],
        ['RTL override', 'java\u202Escript:alert(1)'],
      ])('rejects %s in scheme: %j', (_label, uri) => {
        expectLinkDropped(paragraphWithLinkFacet('click', uri), 'click')
      })
    })

    describe('IDN / unicode hostname canonicalization', () => {
      it('encodes Japanese IDN as punycode', () => {
        const input = paragraphWithLinkFacet('safe', 'https://例え.jp/')
        const href = getLinkHref(input)
        // Compare against WHATWG's own canonical form rather than hard-coding
        // a punycode that could shift across Node versions.
        expect(href).toBe(new URL('https://例え.jp/').href)
        expect(href).toMatch(/^https:\/\/xn--/)
      })

      it('encodes Cyrillic homograph host as punycode (unmasking visual spoof)', () => {
        // 'а' (U+0430, Cyrillic) instead of 'a' (U+0061, Latin).
        const spoofed = 'https://аpple.com/'
        const input = paragraphWithLinkFacet('Apple', spoofed)
        const href = getLinkHref(input)
        // After canonicalization the host is ASCII-only punycode, so users
        // (and downstream warning code) can see it isn't really apple.com.
        expect(href).not.toContain('а') // no Cyrillic char in canonical href
        expect(href).toMatch(/^https:\/\/xn--/)
      })

      it('rewrites text and drops link mark when text claims the spoofed host', () => {
        // The text presents itself as the host the reader will visit, but
        // uses Cyrillic а (U+0430) instead of Latin a — visually identical,
        // different code points. Mixing Latin with a confusable script in
        // the same host is the homoglyph signal; the converter rewrites
        // the visible text AND strips the link mark so readers can't
        // accidentally click.
        // cSpell:disable-next-line
        const plaintext = 'аpple.com'
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext,
            facets: [
              {
                index: byteSlice(0, utf8Len(plaintext)),
                features: [
                  {
                    $type: 'fyi.questionable.richtext.facet#link',
                    uri: 'https://аpple.com/',
                  },
                ],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: Array<{ type: string }> }>
        }
        const node = para.content[0]
        const expectedHostname = new URL('https://аpple.com/').hostname
        expect(node.text).toBe(expectedHostname)
        expect(node.text).toMatch(/^xn--/)
        expect(node.text).not.toContain('а')
        expect(node.marks).toBeUndefined()
      })

      it('rewrites text and drops link mark when text claims the full spoofed URI', () => {
        const plaintext = 'https://аpple.com/'
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext,
            facets: [
              {
                index: byteSlice(0, utf8Len(plaintext)),
                features: [
                  {
                    $type: 'fyi.questionable.richtext.facet#link',
                    uri: 'https://аpple.com/',
                  },
                ],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: unknown[] }>
        }
        const node = para.content[0]
        expect(node.text).toBe(new URL('https://аpple.com/').href)
        expect(node.text).not.toContain('а')
        expect(node.marks).toBeUndefined()
      })

      it('preserves other marks (bold, italic, …) when dropping a homoglyph link mark', () => {
        // cSpell:disable-next-line
        const plaintext = 'аpple.com'
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext,
            facets: [
              {
                index: byteSlice(0, utf8Len(plaintext)),
                features: [
                  {
                    $type: 'fyi.questionable.richtext.facet#link',
                    uri: 'https://аpple.com/',
                  },
                  { $type: 'fyi.questionable.richtext.facet#bold' },
                ],
              },
            ],
          },
        ])
        expectValidInput(input)
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string; marks?: Array<{ type: string }> }>
        }
        const node = para.content[0]
        expect(node.marks).toEqual([{ type: 'bold' }])
      })

      it.each([
        ['Japanese (Han + Hiragana)', '例え.jp', 'https://例え.jp/'],
        ['Korean (Hangul)', '한국.kr', 'https://한국.kr/'],
        // cSpell:disable-next-line
        ['pure Cyrillic (no Latin mixing)', 'президент.рф', 'https://президент.рф/'],
      ])(
        'keeps text and link for %s even when text mirrors the IDN host',
        (_label, plaintext, uri) => {
          const input = content([
            {
              $type: 'fyi.questionable.richtext.text',
              plaintext,
              facets: [
                {
                  index: byteSlice(0, utf8Len(plaintext)),
                  features: [
                    { $type: 'fyi.questionable.richtext.facet#link', uri },
                  ],
                },
              ],
            },
          ])
          expectValidInput(input)
          const para = lexiconToTiptap(input).content?.[0] as {
            content: Array<{ text: string; marks?: Array<{ type: string }> }>
          }
          const node = para.content[0]
          expect(node.text).toBe(plaintext)
          expect(node.marks?.some((m) => m.type === 'link')).toBe(true)
        }
      )

      it('leaves text unchanged when the URI required no canonicalization', () => {
        // No spoof to expose — rewriting an innocuous match would be churn.
        const input = paragraphWithLinkFacet(
          'https://example.com/',
          'https://example.com/'
        )
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string }>
        }
        expect(para.content[0].text).toBe('https://example.com/')
      })

      it('leaves text unchanged when text is a label rather than a URL claim', () => {
        // text "Apple" is just a label; rewriting would corrupt legit content.
        const input = paragraphWithLinkFacet('Apple', 'https://аpple.com/')
        const para = lexiconToTiptap(input).content?.[0] as {
          content: Array<{ text: string }>
        }
        expect(para.content[0].text).toBe('Apple')
      })

      it('passes through punycode hosts unchanged', () => {
        const uri = 'https://xn--r8jz45g.jp/'
        const href = getLinkHref(paragraphWithLinkFacet('safe', uri))
        expect(href).toBe(uri)
      })

      it('percent-encodes unicode in path', () => {
        const href = getLinkHref(
          paragraphWithLinkFacet('safe', 'https://example.com/café')
        )
        expect(href).toBe('https://example.com/caf%C3%A9')
      })

      it('percent-encodes unicode in query string', () => {
        const href = getLinkHref(
          paragraphWithLinkFacet('safe', 'https://example.com/?q=café')
        )
        expect(href).toBe('https://example.com/?q=caf%C3%A9')
      })
    })

    describe('userinfo / credentials in URL (accepted, host visible after canonicalization)', () => {
      // WHATWG permits userinfo in http(s) URLs. We accept these but rely on
      // the rendering layer to surface label/host mismatches as a warning.
      // Mirrors bsky's approach (see linkRequiresWarning in social-app).

      it('preserves the host-spoofing pattern `host@evil.com` in canonical form', () => {
        // The visible label here might say "google.com" but the real host is evil.com.
        const href = getLinkHref(
          paragraphWithLinkFacet('Google', 'https://google.com@evil.com/')
        )
        // Canonical form makes the actual host visible to humans + render layer.
        expect(href).toBe('https://google.com@evil.com/')
      })

      it('preserves user:pass credentials in canonical form', () => {
        const href = getLinkHref(
          paragraphWithLinkFacet('login', 'https://user:secret@example.com/')
        )
        expect(href).toBe('https://user:secret@example.com/')
      })
    })

    describe('whitespace and control characters in legitimate http(s) URLs', () => {
      it('strips tabs/newlines/CR per WHATWG normalization', () => {
        const href = getLinkHref(
          paragraphWithLinkFacet(
            'click',
            'https://example.com/\tpath\nwith\rcontrols'
          )
        )
        // No raw \t \n \r remain in the canonical href.
        expect(href).not.toMatch(/[\t\n\r]/)
        expect(href).toBe('https://example.com/pathwithcontrols')
      })

      it('percent-encodes literal spaces in path', () => {
        const href = getLinkHref(
          paragraphWithLinkFacet('click', 'https://example.com/path with spaces')
        )
        expect(href).toBe('https://example.com/path%20with%20spaces')
      })
    })

    describe('malformed input (rejected)', () => {
      it('drops the link mark when uri is undefined', () => {
        const input = content([
          {
            $type: 'fyi.questionable.richtext.text',
            plaintext: 'broken',
            facets: [
              {
                index: byteSlice(0, 6),
                features: [
                  { $type: 'fyi.questionable.richtext.facet#link' },
                ],
              },
            ],
          },
        ])
        expectLinkDropped(input, 'broken')
      })

      it('drops the link mark when the URI cannot be parsed', () => {
        expectLinkDropped(paragraphWithLinkFacet('click', 'http://'), 'click')
        expectLinkDropped(paragraphWithLinkFacet('click', '://nohost'), 'click')
      })
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
