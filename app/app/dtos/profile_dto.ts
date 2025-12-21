import Profile from '#models/profile'

export default class ProfileDto {
  constructor(private profile: Profile) {}

  toJson() {
    return {
      did: this.profile.did,
      handle: this.profile.account?.handle ?? this.profile.did,
      displayName: this.profile.displayName,
    }
  }
}
