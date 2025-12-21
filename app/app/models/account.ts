import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Profile from './profile.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

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

  static async resolve(handleOrDid: string) {
    if (handleOrDid.startsWith('did:')) {
      return handleOrDid
    }

    const account = await Account.findByOrFail({ handle: handleOrDid })
    return account.did
  }
}
