import { AtProtoUser } from '@thisismissem/adonisjs-atproto-oauth'
import * as lexicon from '#lexicons/index'

AtProtoUser.macro('fetchProfile', async function hasProfile(this: AtProtoUser) {
  const profile = await this.client
    .get(lexicon.fyi.questionable.actor.profile)
    .catch((_) => undefined)

  if (profile?.value) {
    return profile.value
  }

  return undefined
})

declare module '@thisismissem/adonisjs-atproto-oauth' {
  interface AtProtoUser {
    fetchProfile(): Promise<undefined | lexicon.fyi.questionable.actor.profile.Main>
  }
}
