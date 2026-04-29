/**
 * Kitchen-sink richtext fixture: exercises every code path in both converters
 * and pushes UTF-8 byte offsets to their edges.
 *
 * Sections and the converter paths they cover:
 *
 * - h2 heading with bold + italic across multi-byte characters
 *     → mark→feature mapping; byte offsets through é/☕
 *
 * - h3 heading
 *     → header default level handling
 *
 * - paragraph carrying every supported mark + a multi-mark span
 *     → markToFeature switch (bold, italic, underline, strike, code, highlight, link);
 *       multiple-marks-on-one-text-node → single facet with multiple features
 *
 * - blockquote containing a paragraph and a heading
 *     → flatMap flattening of mixed-children blockquote (line 143);
 *       blockquote.plaintext derivation via plaintextFromBlocks
 *
 * - code block with language="ts" and code block with no language
 *     → conditional language emission (line 160) and reverse (line 101)
 *
 * - bulletList whose second item is a nested orderedList
 *     → forward: nested-list-as-direct-child branch (lines 174-177)
 *       reverse: unwrapped-nested-list branch (lines 107-109)
 *
 * - standalone orderedList with three items
 *     → list ordered=true mapping
 *
 * - horizontalRule
 *
 * - UTF-8 stress paragraph mixing ASCII + 2-byte (é) + 4-byte (👋) + 3-byte (日本)
 *   with a bold span and a link span that each cross multi-byte boundaries
 *     → utf8Len-based byte-offset arithmetic, TextEncoder/TextDecoder slicing
 */
import type { JSONContent } from '@tiptap/react'
import {
  bold,
  italic,
  underline,
  strikethrough,
  code,
  highlight,
  link,
  facet,
} from './helpers'

// Section plaintexts (declared up front so facets can reference them by name).
const h2Text = 'Café ☕ Notes'
const allMarksPara =
  'This is bold and italic at once, then underlined, then struck, then in code, then highlighted, then a link to docs.'
const blockquotePara = 'A quoted thought worth pondering.'
const blockquoteHeading = 'Inner heading'
const codeWithLang = "console.log('hi')"
const codeNoLang = 'plain text snippet'
const bulletItem = 'first bullet'
const nestedOrdered1 = 'nested 1'
const nestedOrdered2 = 'nested 2'
const orderedItem1 = 'alpha'
const orderedItem2 = 'beta'
const orderedItem3 = 'gamma'
const utf8Para = 'Hello 👋 from café in 日本! Visit example.com.'

export const kitchenSinkTiptap: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        { type: 'text', text: 'Café', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' ☕ ' },
        { type: 'text', text: 'Notes', marks: [{ type: 'italic' }] },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Section One' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is ' },
        {
          type: 'text',
          text: 'bold and italic at once',
          marks: [{ type: 'bold' }, { type: 'italic' }],
        },
        { type: 'text', text: ', then ' },
        { type: 'text', text: 'underlined', marks: [{ type: 'underline' }] },
        { type: 'text', text: ', then ' },
        { type: 'text', text: 'struck', marks: [{ type: 'strike' }] },
        { type: 'text', text: ', then in ' },
        { type: 'text', text: 'code', marks: [{ type: 'code' }] },
        { type: 'text', text: ', then ' },
        { type: 'text', text: 'highlighted', marks: [{ type: 'highlight' }] },
        { type: 'text', text: ', then a ' },
        {
          type: 'text',
          text: 'link to docs',
          marks: [{ type: 'link', attrs: { href: 'https://example.com/docs' } }],
        },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: blockquotePara }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: blockquoteHeading }],
        },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'ts' },
      content: [{ type: 'text', text: codeWithLang }],
    },
    {
      type: 'codeBlock',
      attrs: {},
      content: [{ type: 'text', text: codeNoLang }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: bulletItem }],
            },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: nestedOrdered1 }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: nestedOrdered2 }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: orderedItem1 }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: orderedItem2 }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: orderedItem3 }],
            },
          ],
        },
      ],
    },
    { type: 'horizontalRule' },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello 👋 from ' },
        { type: 'text', text: 'café', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' in 日本! Visit ' },
        {
          type: 'text',
          text: 'example.com',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
        },
        { type: 'text', text: '.' },
      ],
    },
  ],
}

const blockquoteItems = [
  { $type: 'fyi.questionable.richtext.text', plaintext: blockquotePara },
  {
    $type: 'fyi.questionable.richtext.header',
    level: 3,
    plaintext: blockquoteHeading,
  },
]

export const kitchenSinkLexicon = {
  $type: 'fyi.questionable.richtext.content',
  items: [
    {
      $type: 'fyi.questionable.richtext.header',
      level: 2,
      plaintext: h2Text,
      facets: [facet(h2Text, 'Café', [bold]), facet(h2Text, 'Notes', [italic])],
    },
    {
      $type: 'fyi.questionable.richtext.header',
      level: 3,
      plaintext: 'Section One',
    },
    {
      $type: 'fyi.questionable.richtext.text',
      plaintext: allMarksPara,
      facets: [
        facet(allMarksPara, 'bold and italic at once', [bold, italic]),
        facet(allMarksPara, 'underlined', [underline]),
        facet(allMarksPara, 'struck', [strikethrough]),
        facet(allMarksPara, 'code', [code]),
        facet(allMarksPara, 'highlighted', [highlight]),
        facet(allMarksPara, 'link to docs', [link('https://example.com/docs')]),
      ],
    },
    {
      $type: 'fyi.questionable.richtext.blockquote',
      plaintext: `${blockquotePara}\n${blockquoteHeading}`,
      items: blockquoteItems,
    },
    {
      $type: 'fyi.questionable.richtext.code',
      plaintext: codeWithLang,
      language: 'ts',
    },
    {
      $type: 'fyi.questionable.richtext.code',
      plaintext: codeNoLang,
    },
    {
      $type: 'fyi.questionable.richtext.list',
      ordered: false,
      items: [
        { $type: 'fyi.questionable.richtext.text', plaintext: bulletItem },
        {
          $type: 'fyi.questionable.richtext.list',
          ordered: true,
          items: [
            { $type: 'fyi.questionable.richtext.text', plaintext: nestedOrdered1 },
            { $type: 'fyi.questionable.richtext.text', plaintext: nestedOrdered2 },
          ],
        },
      ],
    },
    {
      $type: 'fyi.questionable.richtext.list',
      ordered: true,
      items: [
        { $type: 'fyi.questionable.richtext.text', plaintext: orderedItem1 },
        { $type: 'fyi.questionable.richtext.text', plaintext: orderedItem2 },
        { $type: 'fyi.questionable.richtext.text', plaintext: orderedItem3 },
      ],
    },
    { $type: 'fyi.questionable.richtext.horizontalRule' },
    {
      $type: 'fyi.questionable.richtext.text',
      plaintext: utf8Para,
      facets: [
        facet(utf8Para, 'café', [bold]),
        facet(utf8Para, 'example.com', [link('https://example.com')]),
      ],
    },
  ],
}
