import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import * as lex from '@atproto/lex'
import logger from '@adonisjs/core/services/logger'
import { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { createError } from '@adonisjs/core/exceptions'

export const prepareRecord = (value: any) => {
  return JSON.stringify(value)
}

export function consumeRecord<const T extends lex.RecordSchema>(ns: lex.Main<T>) {
  const schema = lex.getMain(ns)

  return (value: any) => {
    try {
      const json = lex.lexParse(value, { strict: true })
      const result = schema.$parse(json)
      return result
    } catch (err) {
      logger.error(err, 'Error parsing record')
      return undefined
    }
  }
}

export const RecordInvalidError = createError('Record invalid', 'E_RECORD_INVALID', 404)

export function withAtprotoRecord<
  const T extends lex.RecordSchema,
  Model extends NormalizeConstructor<typeof BaseModel>,
>(ns: lex.Main<T>, superclass: Model) {
  const consumer = consumeRecord(ns)
  class AtprotoModel extends superclass {
    @column()
    declare cid: string

    @column({
      prepare: prepareRecord,
      consume: consumer,
    })
    declare record?: lex.InferOutput<T>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime<true>

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @column.dateTime()
    declare indexedAt: DateTime

    assertValid() {
      if (!this.record) {
        throw new RecordInvalidError()
      }
    }
  }

  return AtprotoModel
}
