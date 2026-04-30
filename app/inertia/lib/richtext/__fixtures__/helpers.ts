import { utf8Len } from '@atproto/lex'

const BYTE_SLICE = 'fyi.questionable.richtext.facet#byteSlice' as const

export type Feature = { $type: string; uri?: string; did?: string; title?: string }

export const bold: Feature = { $type: 'fyi.questionable.richtext.facet#bold' }
export const italic: Feature = { $type: 'fyi.questionable.richtext.facet#italic' }
export const underline: Feature = { $type: 'fyi.questionable.richtext.facet#underline' }
export const strikethrough: Feature = { $type: 'fyi.questionable.richtext.facet#strikethrough' }
export const code: Feature = { $type: 'fyi.questionable.richtext.facet#code' }
export const highlight: Feature = { $type: 'fyi.questionable.richtext.facet#highlight' }
export const subscript: Feature = { $type: 'fyi.questionable.richtext.facet#subscript' }
export const superscript: Feature = { $type: 'fyi.questionable.richtext.facet#superscript' }
export const link = (uri: string): Feature => ({
  $type: 'fyi.questionable.richtext.facet#link',
  uri,
})
export const abbr = (title: string): Feature => ({
  $type: 'fyi.questionable.richtext.facet#abbr',
  title,
})

/**
 * Builds a facet for a substring of the given plaintext, computing byte offsets
 * via `utf8Len` so multi-byte characters are handled correctly.
 *
 * Throws if the substring is not found, or if `nth` (0-indexed occurrence) is missing.
 */
export function facet(plaintext: string, substring: string, features: Feature[], nth = 0) {
  let charIdx = -1
  let cursor = 0
  for (let i = 0; i <= nth; i++) {
    charIdx = plaintext.indexOf(substring, cursor)
    if (charIdx < 0) {
      throw new Error(`fixture: occurrence ${nth} of "${substring}" not found in plaintext`)
    }
    cursor = charIdx + substring.length
  }
  const before = plaintext.slice(0, charIdx)
  const byteStart = utf8Len(before)
  return {
    index: { $type: BYTE_SLICE, byteStart, byteEnd: byteStart + utf8Len(substring) },
    features,
  }
}
