import { describe, it, expect } from 'vitest'
import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
import { tiptapToLexicon } from './tiptap_to_lexicon'
import { lexiconToTiptap } from './lexicon_to_tiptap'
import { basicTiptap, basicLexicon } from './__fixtures__/basic'
import { kitchenSinkTiptap, kitchenSinkLexicon } from './__fixtures__/kitchen_sink'

function expectValidLexicon(value: unknown) {
  const result = $safeValidate(value)
  expect(result.success, JSON.stringify(result, null, 2)).toBe(true)
}

describe('roundtrip', () => {
  describe('lexicon → tiptap → lexicon', () => {
    it.each([
      ['basic', basicLexicon],
      ['kitchen sink', kitchenSinkLexicon],
    ])('%s preserves structure', (_name, fixture) => {
      expectValidLexicon(fixture)
      const result = tiptapToLexicon(lexiconToTiptap(fixture))
      expect(result).toEqual(fixture)
      expectValidLexicon(result)
    })
  })

  describe('tiptap → lexicon → tiptap', () => {
    it.each([
      ['basic', basicTiptap],
      ['kitchen sink', kitchenSinkTiptap],
    ])('%s preserves structure', (_name, fixture) => {
      const intermediate = tiptapToLexicon(fixture)
      expectValidLexicon(intermediate)
      const result = lexiconToTiptap(intermediate)
      expect(result).toEqual(fixture)
    })
  })
})
