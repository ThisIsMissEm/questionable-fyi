import ProfileDto from '#dtos/profile_dto'
import Account from '#models/account'
import Profile from '#models/profile'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class InertiaMiddleware {
  async handle({ auth, inertia }: HttpContext, next: NextFn) {
    inertia.share({
      isAuthenticated: inertia.always(() => {
        return auth?.isAuthenticated ?? false
      }),
      user: inertia.always(async () => {
        if (auth?.user) {
          const account = await Account.resolve(auth.user.did)
          const profile = await Profile.find(auth.user.did)
          if (account) {
            return new ProfileDto(account, profile).toJson()
          }
          return undefined
        } else {
          return undefined
        }
      }),
    })

    return await next()
  }
}
