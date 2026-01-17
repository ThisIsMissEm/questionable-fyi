import Account from '#models/account'
import Profile from '#models/profile'

export type ProfileDtoResult = {
  did: string
  handle: string
  displayName: string | null
  description: string
}

export default class ProfileDto {
  constructor(
    private account: Account,
    private profile: Profile | null
  ) {}

  toJson(): ProfileDtoResult {
    return {
      did: this.account.did,
      handle: this.account.handle ?? this.account.did,
      displayName: this.profile?.displayName ?? null,
      description: this.profile?.description ?? '',
    }
  }
}
