/**
 * Basic richtext fixture: two lorem-ipsum paragraphs with simple formatting,
 * an h2 heading, and an h3 heading. ASCII-only so byte length equals character
 * length — this fixture isolates formatting concerns from UTF-8 concerns.
 */
import type { JSONContent } from '@tiptap/react'
import { bold, italic, link, facet } from './helpers'

const para1 =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const para2 =
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Duis aute irure dolor in reprehenderit in voluptate velit.'

export const basicTiptap: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Lorem Ipsum' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Lorem ipsum dolor sit amet, ' },
        { type: 'text', text: 'consectetur', marks: [{ type: 'bold' }] },
        {
          type: 'text',
          text: ' adipiscing elit. Sed do eiusmod tempor incididunt ut labore et ',
        },
        { type: 'text', text: 'dolore', marks: [{ type: 'italic' }] },
        { type: 'text', text: ' magna aliqua.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Sed do eiusmod' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Duis aute irure dolor in reprehenderit in ',
        },
        {
          type: 'text',
          text: 'voluptate',
          marks: [{ type: 'link', attrs: { href: 'https://example.com/' } }],
        },
        { type: 'text', text: ' velit.' },
      ],
    },
  ],
}

export const basicLexicon = {
  $type: 'fyi.questionable.richtext.content',
  items: [
    {
      $type: 'fyi.questionable.richtext.header',
      level: 2,
      plaintext: 'Lorem Ipsum',
    },
    {
      $type: 'fyi.questionable.richtext.text',
      plaintext: para1,
      facets: [
        facet(para1, 'consectetur', [bold]),
        facet(para1, 'dolore', [italic]),
      ],
    },
    {
      $type: 'fyi.questionable.richtext.header',
      level: 3,
      plaintext: 'Sed do eiusmod',
    },
    {
      $type: 'fyi.questionable.richtext.text',
      plaintext: para2,
      facets: [facet(para2, 'voluptate', [link('https://example.com/')])],
    },
  ],
}
