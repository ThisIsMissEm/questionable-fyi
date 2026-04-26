import { BaseTransformer } from '@adonisjs/core/transformers'
import Profile from '#models/profile'

export default class ProfileTransformer extends BaseTransformer<Profile> {
  toObject() {
    return {
      did: this.resource.did,
      handle: this.resource.account.handle ?? this.resource.did,
      displayName: this.resource.displayName ?? null,
      description: this.resource.description ?? '',
    }
  }
}
