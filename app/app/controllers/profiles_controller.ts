import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import Profile, { ActorProfile } from '#models/profile'
import ProfileDto from '#dtos/profile_dto'
import { showProfileValidator, updateProfileValidator } from '#validators/profile'
import router from '@adonisjs/core/services/router'
import * as lexicon from '#lexicons/index'

export default class ProfilesController {
  async show({ request, response, inertia, logger }: HttpContext) {
    const { params } = await request.validateUsing(showProfileValidator)

    const account = await Account.resolveOrFail(params.handleOrDid)
    const profile = await Profile.findOrFail(account.did)

    if (params.handleOrDid !== account.handle) {
      return response.redirect().toRoute('profile.show', { handleOrDid: account.handle })
    }

    return inertia.render('profiles/show', {
      profile: new ProfileDto(account, profile).toJson(),
      links: {
        asks: router.makeUrl('profile.show', { handleOrDid: params.handleOrDid }),
      },
    })
  }

  async update({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)

    const account = await Account.resolveOrFail(data.params.handleOrDid)

    if (account.did !== user.did) {
      return response.abort('Not allowed', 401)
    }

    const existing = await user.client
      .get(lexicon.fyi.questionable.actor.profile)
      .catch((_) => undefined)

    const updatedProfile: ActorProfile = existing?.value ?? {}
    updatedProfile.displayName = data.displayName
    updatedProfile.description = data.description

    await user.client.put(lexicon.fyi.questionable.actor.profile, updatedProfile, {
      swapRecord: existing?.cid || undefined,
    })

    await Profile.upsert(user.did, updatedProfile)

    return response.redirect().back()
  }
}
