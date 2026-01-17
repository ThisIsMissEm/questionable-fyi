import {
  NodeOAuthClient,
  NodeSavedSession,
  NodeSavedState,
  OAuthClientMetadataInput,
} from '@atproto/oauth-client-node'
// import { JoseKey } from '@atproto/jwk-jose'
import router from '@adonisjs/core/services/router'

import env from '#start/env'
import OauthState from '#models/oauth_state'
import OauthSession from '#models/oauth_session'
import { DEFAULT_PDS } from '#utils/constants'

export type { OAuthPromptMode } from '@atproto/oauth-client-node'

function makeUrl(routeIdentifier: string): string {
  return new URL(router.makeUrl(routeIdentifier), env.get('PUBLIC_URL')).toString()
}

export class OAuthClient {
  #client?: NodeOAuthClient

  readonly defaultPds: string
  readonly clientMetadata: OAuthClientMetadataInput
  constructor() {
    this.defaultPds = `https://${DEFAULT_PDS}`
    this.clientMetadata = {
      // Must be a URL that will be exposing this metadata
      client_id: env.get('OAUTH_CLIENT_ID', makeUrl('oauth.clientMetadata')),
      client_name: 'Questionable.fyi',
      client_uri: makeUrl('home'),
      // logo_uri: 'https://my-app.com/logo.png',
      // tos_uri: 'https://my-app.com/tos',
      // policy_uri: 'https://my-app.com/policy',
      redirect_uris: [makeUrl('oauth.callback')],
      grant_types: ['authorization_code', 'refresh_token'],
      scope: 'atproto transition:generic',
      response_types: ['code'],
      application_type: 'web',
      // token_endpoint_auth_method: 'private_key_jwt',
      // token_endpoint_auth_signing_alg: 'RS256',
      // jwks_uri: makeUrl('oauth.jwks'),
      dpop_bound_access_tokens: true,
      token_endpoint_auth_method: 'none',
    }
  }

  get client(): NodeOAuthClient {
    if (this.#client) {
      return this.#client
    }

    this.#client = new NodeOAuthClient({
      // This object will be used to build the payload of the /client-metadata.json
      // endpoint metadata, exposing the client metadata to the OAuth server.
      clientMetadata: this.clientMetadata,

      // Used to authenticate the client to the token endpoint. Will be used to
      // build the jwks object to be exposed on the "jwks_uri" endpoint.
      // keyset: await Promise.all([JoseKey.fromImportable(env.OAUTH_JWKS, 'key1')]),

      // Interface to store authorization state data (during authorization flows)
      stateStore: {
        async set(key: string, internalState: NodeSavedState): Promise<void> {
          await OauthState.updateOrCreate({ key }, { value: internalState })
        },
        async get(key: string): Promise<NodeSavedState | undefined> {
          const record = await OauthState.find(key)
          if (record === null) {
            return undefined
          }
          return record?.value as NodeSavedState
        },
        async del(key: string): Promise<void> {
          await OauthState.query().where({ key }).delete()
        },
      },

      // Interface to store authenticated session data
      sessionStore: {
        async set(sub: string, session: NodeSavedSession): Promise<void> {
          await OauthSession.updateOrCreate({ sub }, { value: session })
        },
        async get(sub: string): Promise<NodeSavedSession | undefined> {
          const record = await OauthSession.find(sub)
          if (record === null) {
            return undefined
          }
          return record?.value as NodeSavedSession
        },
        async del(sub: string): Promise<void> {
          await OauthSession.query().where({ sub }).delete()
        },
      },

      // A lock to prevent concurrent access to the session store. Optional if only one instance is running.
      // requestLock,
    })

    return this.#client
  }
}
