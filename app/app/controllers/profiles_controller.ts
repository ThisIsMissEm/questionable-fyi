import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import Profile from '#models/profile'
import ProfileDto from '#dtos/profile_dto'
import { showProfileValidator } from '#validators/profile'
import router from '@adonisjs/core/services/router'

export default class ProfilesController {
  async show({ request, inertia }: HttpContext) {
    const { params } = await request.validateUsing(showProfileValidator)

    const account = await Account.resolveOrFail(params.handleOrDid)
    const profile = await Profile.findOrFail(account.did)

    return inertia.render('profiles/show', {
      profile: new ProfileDto(profile, account).toJson(),
      links: {
        asks: router.makeUrl('profile.show', { handleOrDid: params.handleOrDid }),
      },
    })
  }
}
