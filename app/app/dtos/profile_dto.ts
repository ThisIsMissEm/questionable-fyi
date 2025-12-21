import Account from '#models/account'
import Profile from '#models/profile'

export default class ProfileDto {
  constructor(
    private profile: Profile,
    private account: Account
  ) {}

  toJson() {
    return {
      did: this.account.did,
      handle: this.account.handle ?? this.account.did,
      displayName: this.profile.displayName,
    }
  }
}
