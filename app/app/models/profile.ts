import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ModelAttributes } from '@adonisjs/lucid/types/model'
import { belongsTo } from '@adonisjs/lucid/orm'
import { DidString } from '@atproto/syntax'

import { ProfileSchema } from '#database/schema'
import Account from '#models/account'
import * as lexicon from '#lexicons/index'
import { withAtprotoRecord } from '#models/atproto_model'

export type ActorProfile = Omit<lexicon.fyi.questionable.actor.profile.Main, '$type'>

export default class Profile extends withAtprotoRecord(
  lexicon.fyi.questionable.actor.profile.main,
  ProfileSchema
) {
  @belongsTo(() => Account, {
    localKey: 'did',
    foreignKey: 'did',
  })
  declare account: BelongsTo<typeof Account>

  static async upsert(
    did: DidString,
    cid: string | undefined,
    record: lexicon.fyi.questionable.actor.profile.Main,
    indexedAt?: DateTime | undefined
  ) {
    const update: Partial<ModelAttributes<Profile>> = {
      displayName: record.displayName?.trim() ?? null,
      description: record.description?.trim() ?? '',
      record,
    }

    let createdAt = record.createdAt ? DateTime.fromISO(record.createdAt) : DateTime.now()
    if (!createdAt.isValid) {
      createdAt = DateTime.now()
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
