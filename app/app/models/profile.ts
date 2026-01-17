import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Account from '#models/account'
import { Main as ActorProfileMain } from '#lexicons/fyi/questionable/actor/profile'
import { ModelAttributes } from '@adonisjs/lucid/types/model'

export type ActorProfile = Omit<ActorProfileMain, '$type'>

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare did: string

  @column()
  declare displayName: string | null

  @column()
  declare description: string

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

  static async upsert(did: string, profile: ActorProfile, indexedAt?: DateTime | undefined) {
    const update: Partial<ModelAttributes<Profile>> = {
      displayName: profile.displayName?.trim() ?? null,
      description: profile.description?.trim() ?? '',
      createdAt: profile.createdAt ? DateTime.fromISO(profile.createdAt) : DateTime.now(),
    }

    if (indexedAt) {
      update.indexedAt = indexedAt
    }

    return this.updateOrCreate({ did }, update)
  }
}
