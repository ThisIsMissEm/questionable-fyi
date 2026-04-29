import { describe, it, expect } from 'vitest'
import { $safeValidate } from '@lexicons/fyi/questionable/richtext/content'
import { basicLexicon } from './basic'
import { kitchenSinkLexicon } from './kitchen_sink'

describe('fixture lexicons', () => {
  it.each([
    ['basic', basicLexicon],
    ['kitchen sink', kitchenSinkLexicon],
  ])('%s validates against fyi.questionable.richtext.content', (_name, lexicon) => {
    const result = $safeValidate(lexicon)
    expect(result.success, JSON.stringify(result, null, 2)).toBe(true)
  })
})
