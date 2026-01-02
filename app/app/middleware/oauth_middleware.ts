import { OAuthClient } from '#services/oauth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { OAuthSession } from '@atproto/oauth-client'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    oauth?: OAuthSession
  }
}

@inject()
export default class OauthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const oauth = await ctx.containerResolver.make(OAuthClient)
    const did = ctx.session.get('oauth_did', null)
    if (!did) {
      ctx.inertia.share({
        authenticated: false,
      })
      ctx.logger.debug('No oauth_did in session')
      return await next()
    }

    try {
      ctx.oauth = await oauth.client.restore(did)
      ctx.inertia.share({
        authenticated: true,
        currentActor: did,
      })
    } catch (err) {
      ctx.logger.debug(err)
      ctx.oauth = undefined
    }

    return await next()
  }
}
