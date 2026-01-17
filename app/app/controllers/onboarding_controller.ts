import * as lexicon from '#lexicons/index'
import Account from '#models/account'
import Profile, { ActorProfile } from '#models/profile'
import { Slingshot } from '#services/slingshot'
import { getCurrentTimestamp } from '#utils/atproto'
import { storeProfileValidator } from '#validators/onboarding'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class OnboardingController {
  @inject()
  async show({ inertia, response, auth, logger }: HttpContext, slingshot: Slingshot) {
    const user = auth.getUserOrFail()

    const handle = await slingshot.resolveIdentity(user.did)

    // Create the Account record if we need one:
    await Account.firstOrCreate(
      { did: user.did },
      {
        did: user.did,
        handle: handle,
        status: 'active',
        isActive: true,
      }
    )

    const existing = await user.client
      .get(lexicon.fyi.questionable.actor.profile)
      .catch((_) => undefined)

    if (existing?.value) {
      logger.debug({ user, profile: existing }, 'Existing actor profile found!')
      await Profile.upsert(user.did, existing.value)

      return response.redirect().toRoute('home')
    }

    return inertia.render('onboarding', {
      handle,
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(storeProfileValidator)

    const existing = await user.client
      .get(lexicon.fyi.questionable.actor.profile)
      .catch((_) => undefined)
    const updatedProfile: ActorProfile = existing?.value ?? {}

    updatedProfile.createdAt = updatedProfile.createdAt ?? getCurrentTimestamp()
    updatedProfile.displayName = data.displayName

    await user.client.put(lexicon.fyi.questionable.actor.profile, updatedProfile, {
      swapRecord: existing?.cid || undefined,
    })

    await Profile.upsert(user.did, updatedProfile)

    return response.redirect().toRoute('home')
  }
}
