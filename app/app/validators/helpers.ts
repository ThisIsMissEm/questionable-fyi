import { AtUri, isValidTid } from '@atproto/syntax'
import { isDidString } from '@atproto/lex'
import vine from '@vinejs/vine'

export type StrongRefRule = {
  collection: string
  rkey?: string
}

export const isStrongRef = vine.createRule<StrongRefRule[]>((value, rules, field) => {
  if (!field.isDefined || !field.isValid) {
    return false
  }

  const uri = new AtUri(value as string)
  if (!isDidString(uri.host)) {
    field.report('Invalid reference', 'strong-ref', field)
    return false
  }

  const matchingRule = rules.find((rule) => rule.collection === uri.collection)
  if (matchingRule === undefined) {
    field.report('Invalid collection', 'strong-ref-collection', field)
    return false
  }

  if (matchingRule.rkey && uri.rkey !== matchingRule.rkey) {
    field.report('Invalid rkey', 'strong-ref-rkey', field)
    return false
  }

  return true
})

export const isTid = vine.createRule((value, _, field) => {
  if (!field.isDefined) {
    return false
  }
  if (!field.isValid) {
    return false
  }
  if (!isValidTid(value as string)) {
    field.report('Invalid tid', 'tid', field)
    return false
  }

  return true
})
