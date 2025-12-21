import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Account from '#models/account'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare did: string

  @column()
  declare displayName: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare indexedAt: DateTime

  @belongsTo(() => Account, {
    localKey: 'did',
    foreignKey: 'did',
  })
  declare account: BelongsTo<typeof Account>
}
