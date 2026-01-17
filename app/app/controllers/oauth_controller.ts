import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { OAuthResolverError } from '@atproto/oauth-client-node'
import tap from '@thisismissem/adonisjs-atproto-tap/services/tap'

import { OAuthClient, OAuthPromptMode } from '#services/oauth'
import { AtProtoUser } from '#utils/auth'
import { createFieldError } from '#utils/errors'
import { loginRequestValidator, signupRequestValidator } from '#validators/oauth'
import Account from '#models/account'

@inject()
export default class OAuthController {
  constructor(protected oauth: OAuthClient) {}

  async login({ request, inertia }: HttpContext) {
    const { input } = await request.validateUsing(loginRequestValidator)
    try {
      const authorizationUrl = await this.oauth.client.authorize(input, {
        scope: this.oauth.clientMetadata.scope,
        prompt: 'consent',
      })

      inertia.location(authorizationUrl.toString())
    } catch (err) {
      if (err instanceof OAuthResolverError) {
        throw createFieldError('input', input, err.message)
      }
    }
  }

  async signup({ request, inertia, logger }: HttpContext) {
    const { input, force } = await request.validateUsing(signupRequestValidator)
    const service = input ?? this.oauth.defaultPds
    const authorizationServer = await this.oauth.client.oauthResolver
      .resolveFromService(service)
      .catch((err) => {
        logger.error(err, 'Failed to resolve Authorization Server: %s', service)
        return null
      })

    logger.debug({ service, authorizationServer })

    if (!authorizationServer) {
      throw createFieldError('input', input, 'Please enter a valid personal data server URL')
    }

    if (
      // bsky.social doesn't currently advertise the account creation flow, but
      // it does support account creation with one click:
      service !== this.oauth.defaultPds &&
      !authorizationServer.metadata.prompt_values_supported?.includes('create') &&
      !force
    ) {
      throw createFieldError(
        'input',
        input,
        'This service does not advertise support for account creation'
      )
    }

    // Progressively upgrade to the create account flow:
    let prompt: OAuthPromptMode = 'select_account'
    if (authorizationServer.metadata.prompt_values_supported?.includes('create')) {
      prompt = 'create'
    }

    const authorizationUrl = await this.oauth.client.authorize(service, {
      scope: this.oauth.clientMetadata.scope,
      prompt,
    })

    inertia.location(authorizationUrl.toString())
  }

  async logout({ auth, response }: HttpContext) {
    if (auth.user?.did) {
      await this.oauth.client.revoke(auth.user.did)
    }

    await auth.use('web').logout()

    return response.redirect().back()
  }

  async callback({ request, response, session, logger, auth }: HttpContext) {
    session.regenerate()

    try {
      const params = request.qs()
      const oauth = await this.oauth.client.callback(new URLSearchParams(params))
      const user = new AtProtoUser(oauth.session)

      await auth.use('web').login(user)

      // We'll have an account if the fyi.questionable.actor.profile record
      // exists & we've ingested it from Tap:
      const account = await Account.find(user.did)
      if (!account) {
        await tap.addRepos([user.did])
        return response.redirect().toRoute('onboarding')
      }
    } catch (err) {
      logger.debug(err, 'Error authenticating')

      session.clear()
      session.flash('notification', {
        type: 'error',
        message: 'Error authenticating, please try again',
      })

      return response.redirect().toRoute('login')
    }

    response.redirect().toRoute('home')
  }

  async jwks({}: HttpContext) {}

  async clientMetadata({ response }: HttpContext) {
    return response.json(this.oauth.clientMetadata, true)
  }
}
