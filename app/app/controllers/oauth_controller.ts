import type { HttpContext } from '@adonisjs/core/http'
import { OAuthResolverError } from '@atproto/oauth-client-node'
import { loginRequestValidator, signupRequestValidator } from '#validators/oauth'
import { createFieldError } from '#utils/errors'
import inertia from '@adonisjs/inertia/client'
import Account from '#models/account'
import tap from '@thisismissem/adonisjs-atproto-tap/services/tap'

export default class OAuthController {
  async handleLogin({ request, inertia, oauth, logger }: HttpContext) {
    // input should be a handle or service URL:
    const { input } = await request.validateUsing(loginRequestValidator)
    try {
      const authorizationUrl = await oauth.authorize(input)

      inertia.location(authorizationUrl)
    } catch (err) {
      logger.error(err, 'Error starting AT Protocol OAuth flow')
      if (err instanceof OAuthResolverError) {
        throw createFieldError('input', input, err.message)
      }

      throw createFieldError('input', input, 'Unknown error occurred')
    }
  }

  async handleSignup({ request, inertia, oauth }: HttpContext) {
    // input should be a service URL:
    const { input, force } = await request.validateUsing(signupRequestValidator)
    const service = input ?? 'https://bsky.social'
    const registrationSupported = await oauth.canRegister(service)

    if (!registrationSupported && !force) {
      // Handle registration not supported, you may want to special case for
      // bsky.social which has public registration behind a click.
      throw createFieldError(
        'input',
        input,
        'This service does not advertise support for account creation'
      )
    }

    const authorizationUrl = await oauth.register(service)

    inertia.location(authorizationUrl)
  }

  async handleLogout({ auth, oauth, response }: HttpContext) {
    await oauth.logout(auth.user?.did)
    await auth.use('web').logout()

    return response.redirect().back()
  }

  async callback({ response, oauth, auth, logger }: HttpContext) {
    try {
      const session = await oauth.handleCallback()

      await auth.use('web').login(session.user)

      // You'll probably want to check if you have an "account" according to Tap
      // or some other method, and if not redirect to an onboarding flow
      // We'll have an account if the fyi.questionable.actor.profile record
      // exists & we've ingested it from Tap:
      const account = await Account.find(session.user.did)
      if (account) {
        return response.redirect().toPath('/')
      } else {
        await tap.addRepos([session.user.did])
        return response.redirect().toRoute('onboarding')
      }
    } catch (err) {
      // Handle OAuth failing
      logger.error(err, 'Error completing AT Protocol OAuth flow')

      return response.redirect().toPath('/')
    }
  }
}
