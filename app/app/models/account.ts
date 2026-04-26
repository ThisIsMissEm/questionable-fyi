import { DateTime } from 'luxon'
import { hasOne } from '@adonisjs/lucid/orm'
import Profile from './profile.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { IdentityEvent } from '@atproto/tap'
import { AccountSchema } from '#database/schema'

export type AccountRecord = Omit<IdentityEvent, 'id' | 'type'>
export default class Account extends AccountSchema {
  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  static async resolveOrFail(handleOrDid: string) {
    if (handleOrDid.startsWith('did:')) {
      return Account.findOrFail(handleOrDid)
    }

    return Account.findByOrFail({ handle: handleOrDid })
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
        isActive: account.isActive,
        hidden: account.status !== 'active',
        updatedAt,
      }
    )
  }
}
