import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Profile from './profile.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { IdentityEvent } from '@atproto/tap'

export type AccountRecord = Omit<IdentityEvent, 'id' | 'type'>
export default class Account extends BaseModel {
  @column({ isPrimary: true })
  declare did: string

  @column()
  declare handle: string

  @column()
  declare status: string

  @column()
  declare isActive: boolean

  @column()
  declare hidden: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
