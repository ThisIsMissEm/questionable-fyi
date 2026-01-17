import { OAuthClient } from '#services/oauth'
import { symbols } from '@adonisjs/auth'
import { SessionGuardUser, SessionUserProviderContract } from '@adonisjs/auth/types/session'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { OAuthSession } from '@atproto/oauth-client'
import { Client } from '@atproto/lex'

export class AtProtoUser {
  #client?: Client
  constructor(protected session: OAuthSession) {}

  get did() {
    return this.session.did
  }

  get client() {
    if (this.#client) return this.#client
    this.#client = new Client(this.session)
    return this.#client
  }

  get [Symbol.toStringTag]() {
    return JSON.stringify({ did: this.did })
  }
}

export class AtProtoProvider implements SessionUserProviderContract<AtProtoUser> {
  declare [symbols.PROVIDER_REAL_USER]: AtProtoUser
  /**
   * Create a user object that acts as an adapter between
   * the guard and real user value.
   */
  async createUserForGuard(user: AtProtoUser): Promise<SessionGuardUser<AtProtoUser>> {
    return {
      getId() {
        return user.did
      },
      getOriginal() {
        return user
      },
    }
  }
  /**
   * Find a user by their id.
   */
  async findById(identifier: string) {
    const oauth = await app.container.make(OAuthClient)

    try {
      const session = await oauth.client.restore(identifier)
      const user = new AtProtoUser(session)

      return this.createUserForGuard(user)
    } catch (err) {
      logger.error(err, 'Error in findById')
      return null
    }
  }
}
