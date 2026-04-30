import vine, { BaseLiteralType, Vine, symbols } from '@vinejs/vine'
import type { FieldOptions, Validation } from '@vinejs/vine/types'
import type { Schema, InferOutput } from '@atproto/lex'

/**
 * A VineJS rule that delegates validation to an @atproto/lex Schema.
 * The lex schema is passed as the rule's options.
 */
const isLexiconRule = vine.createRule<{ schema: Schema }>((value, options, field) => {
  if (!field.isDefined || !field.isValid) {
    return false
  }

  const result = options.schema.$safeValidate(value)
  if (!result.success) {
    field.report(result.reason.message ?? 'The {{ field }} field is not valid', 'lexicon', field)
    return false
  }

  field.mutate(result.value, field)
  return true
})

/**
 * A generic VineJS schema type that wraps any @atproto/lex Schema for validation.
 *
 * Usage:
 *   vine.lexicon(lexicon.fyi.questionable.richtext.content.main)
 */
export class VineLexicon<T extends Schema> extends BaseLiteralType<
  unknown,
  InferOutput<T>,
  InferOutput<T>
> {
  declare [symbols.SUBTYPE]: string;
  declare [symbols.UNIQUE_NAME]: string;
  [symbols.IS_OF_TYPE] = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null
  }

  constructor(
    private readonly schema: T,
    options?: FieldOptions,
    validations?: Validation<any>[]
  ) {
    super(options, validations || [])
    this[symbols.SUBTYPE] = 'lexicon'
    this[symbols.UNIQUE_NAME] = 'lexicon'
    this.dataTypeValidator = isLexiconRule({ schema: this.schema as Schema })
  }

  clone(): this {
    return new VineLexicon(this.schema, this.cloneOptions(), this.cloneValidations()) as this
  }
}

/**
 * Register vine.lexicon() macro.
 */
Vine.macro('lexicon', function <T extends Schema>(this: Vine, schema: T) {
  return new VineLexicon(schema)
})

declare module '@vinejs/vine' {
  interface Vine {
    lexicon<T extends Schema>(schema: T): VineLexicon<T>
  }
}
