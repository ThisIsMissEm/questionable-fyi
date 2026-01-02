import { OAuthClient } from '#services/oauth'
import { loginRequestValidator, signupRequestValidator } from '#validators/oauth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class OAuthController {
  constructor(protected oauth: OAuthClient) {}

  async login({ request, inertia }: HttpContext) {
    const { input } = await request.validateUsing(loginRequestValidator)
    const authorizationUrl = await this.oauth.client.authorize(input, {
      scope: this.oauth.clientMetadata.scope,
      prompt: 'consent',
    })

    inertia.location(authorizationUrl.toString())
  }

  async signup({ request, inertia }: HttpContext) {
    const { input } = await request.validateUsing(signupRequestValidator)
    const authorizationUrl = await this.oauth.client.authorize(input, {
      scope: this.oauth.clientMetadata.scope,
      prompt: 'consent',
    })

    inertia.location(authorizationUrl.toString())
  }

  async logout({ session, inertia }: HttpContext) {
    const did = session.pull('oauth_did', null)
    if (did) {
      await this.oauth.client.revoke(did)
    }

    await inertia.location('/')
  }

  async callback({ request, response, session, logger }: HttpContext) {
    session.regenerate()

    try {
      const params = request.qs()
      const oauthSession = await this.oauth.client.callback(new URLSearchParams(params))

      logger.debug(oauthSession)

      session.put('oauth_did', oauthSession.session.did)
      session.flash('notification', {
        type: 'success',
        message: 'Logged in successfully!',
      })
    } catch (err) {
      logger.debug(err)

      session.clear()
      session.flash('notification', {
        type: 'error',
        message: 'Error authenticating, please try again',
      })
    }

    response.redirect().toRoute('home')
  }

  async jwks({}: HttpContext) {}

  async clientMetadata({ response }: HttpContext) {
    return response.json(this.oauth.clientMetadata, true)
  }
}
