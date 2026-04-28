import { BaseTransformer } from '@adonisjs/core/transformers'
import type Profile from '#models/profile'
import type Account from '#models/account'

export default class ProfileTransformer extends BaseTransformer<Profile> {
  constructor(
    resource: Profile,
    protected account: Account
  ) {
    super(resource)
  }

  toObject() {
    return {
      did: this.resource.did,
      handle: this.account.handle ?? this.resource.did,
      displayName: this.resource.displayName ?? null,
      description: this.resource.description ?? '',
    }
  }
}
