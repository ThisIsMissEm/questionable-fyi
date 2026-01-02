import { BaseModel, column } from '@adonisjs/lucid/orm'
import { safeParseJson } from '../utils/json.js'
import { DateTime } from 'luxon'

export default class OauthSession extends BaseModel {
  @column({ isPrimary: true })
  declare sub: string

  @column({
    consume: (value) => {
      return safeParseJson(value)
    },
    prepare: (value) => {
      return JSON.stringify(value)
    },
  })
  declare value: any

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
