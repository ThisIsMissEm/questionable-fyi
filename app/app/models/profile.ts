import { DateTime } from 'luxon'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Account from '#models/account'
import { Main as ActorProfileMain } from '#lexicons/fyi/questionable/actor/profile'
import { ModelAttributes } from '@adonisjs/lucid/types/model'
import { ProfileSchema } from '#database/schema'
import { DidString } from '@atproto/syntax'

export type ActorProfile = Omit<ActorProfileMain, '$type'>

export default class Profile extends ProfileSchema {
  @belongsTo(() => Account, {
    localKey: 'did',
    foreignKey: 'did',
  })
  declare account: BelongsTo<typeof Account>

  static async upsert(
    did: DidString,
    cid: string | undefined,
    profile: ActorProfile,
    indexedAt?: DateTime | undefined
  ) {
    const update: Partial<ModelAttributes<Profile>> = {
      displayName: profile.displayName?.trim() ?? null,
      description: profile.description?.trim() ?? '',
      createdAt: profile.createdAt ? DateTime.fromISO(profile.createdAt) : DateTime.now(),
    }
    if (cid) {
      update.cid = cid
    }

    if (indexedAt) {
      update.indexedAt = indexedAt
    }

    return this.updateOrCreate({ did }, update)
  }
}
