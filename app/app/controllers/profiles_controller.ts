import { errors, type HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import Profile, { type ActorProfile } from '#models/profile'
import { showProfileValidator, updateProfileValidator } from '#validators/profile'
import * as lexicon from '#lexicons/index'
import ProfileTransformer from '#transformers/profile_transformer'
import { resolveHandle } from '#utils/helpers'

export default class ProfilesController {
  async show({ request, response, inertia }: HttpContext) {
    const { params } = await request.validateUsing(showProfileValidator)

    const resolved = await resolveHandle({
      url: request.url(),
      params,
      redirect(handle) {
        return response.redirect().toRoute('profile.show', { identifier: handle })
      },
    })

    if (resolved.redirected) {
      return
    }

    const profileResult = ProfileTransformer.transform(resolved.profile, resolved.account)
    if (!profileResult) {
      throw new errors.E_ROUTE_NOT_FOUND(['GET', request.url()])
    }

    return inertia.render('profiles/show', {
      profile: profileResult,
    })
  }

  async update({ request, response, auth, logger }: HttpContext) {
    const user = auth.getUserOrFail()
    logger.debug({ user }, 'Updating profile')
    const data = await request.validateUsing(updateProfileValidator)

    const account = await Account.resolveOrFail(data.params.identifier)

    if (account.did !== user.did) {
      return response.abort('Not allowed', 401)
    }

    const existing = await user.client
      .get(lexicon.fyi.questionable.actor.profile)
      .catch((_) => undefined)

    const updatedProfile: ActorProfile = existing?.value ?? {}
    if (data.displayName) {
      updatedProfile.displayName = data.displayName
    } else {
      updatedProfile.displayName = ''
    }

    if (data.description) {
      updatedProfile.description = data.description
    } else {
      updatedProfile.description = ''
    }
    updatedProfile.displayName = data.displayName
    updatedProfile.description = data.description ?? ''

    const update = await user.client.put(lexicon.fyi.questionable.actor.profile, updatedProfile, {
      swapRecord: existing?.cid || undefined,
    })

    await Profile.upsert(user.did, update.cid, {
      $type: lexicon.fyi.questionable.actor.profile.$type,
      ...updatedProfile,
    })

    return response.redirect().back()
  }
}
