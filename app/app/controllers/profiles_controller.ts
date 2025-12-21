import type { HttpContext } from '@adonisjs/core/http'
import Account from '#models/account'
import Profile from '#models/profile'
import ProfileDto from '#dtos/profile_dto'
import { showProfileValidator } from '#validators/profile'

export default class ProfilesController {
  async show({ request, inertia }: HttpContext) {
    const { params } = await request.validateUsing(showProfileValidator)
    const did = await Account.resolve(params.handleOrDid)

    const profile = await Profile.findOrFail(did)
    await profile.load('account')

    return inertia.render('profiles/show', {
      profile: new ProfileDto(profile).toJson(),
    })
  }
}
