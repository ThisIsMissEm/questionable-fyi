import { DateTime } from 'luxon'
import { hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'

import { IdentityEvent } from '@atproto/tap'
import { AccountSchema } from '#database/schema'

import Profile from '#models/profile'
import Question from '#models/question'

export type AccountRecord = Omit<IdentityEvent, 'id' | 'type'>
export default class Account extends AccountSchema {
  @hasOne(() => Profile, {
    localKey: 'did',
    foreignKey: 'did',
  })
  declare profile: HasOne<typeof Profile>

  @hasMany(() => Question, {
    localKey: 'did',
    foreignKey: 'authorDid',
  })
  declare questions: HasMany<typeof Question>

  static async resolveOrFail(handleOrDid: string) {
    if (handleOrDid.startsWith('did:')) {
      return Account.findByOrFail({ did: handleOrDid, hidden: false })
    }

    return Account.findByOrFail({ handle: handleOrDid, hidden: false })
  }

  static async resolve(handleOrDid: string) {
    if (handleOrDid.startsWith('did:')) {
      return Account.find(handleOrDid)
    }

    return Account.findBy({ handle: handleOrDid })
  }

  static async upsert(account: Partial<AccountRecord>) {
    const updatedAt = DateTime.now()

    return this.updateOrCreate(
      {
        did: account.did,
      },
      {
        did: account.did,
        handle: account.handle,
        status: account.status,
        isActive: account.isActive && account.handle !== 'handle.invalid',
        hidden: account.status !== 'active' || account.handle === 'handle.invalid',
        updatedAt,
      }
    )
  }
}
