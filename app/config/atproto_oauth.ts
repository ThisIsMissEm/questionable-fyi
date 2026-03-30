import {
  defineConfig,
  lucidSessionStore,
  lucidStateStore,
} from '@thisismissem/adonisjs-atproto-oauth'
import env from '#start/env'

export default defineConfig({
  publicUrl: env.get('PUBLIC_URL'),
  metadata: {
    // If ATPROTO_OAUTH_CLIENT_ID is set, the client metadata will be fetched from that URL:
    client_id: env.get('ATPROTO_OAUTH_CLIENT_ID'),
    client_name: 'Questionable.fyi',
    client_uri: new URL('/', env.get('PUBLIC_URL')).toString(),
    // logo_uri: 'https://my-app.com/logo.png',
    // tos_uri: 'https://my-app.com/tos',
    // policy_uri: 'https://my-app.com/policy',
    // TODO: Use permissions
    scope: 'atproto transition:generic',
  },

  // For a confidential client:
  jwks: [env.get('ATPROTO_OAUTH_JWT_PRIVATE_KEY')],

  // Models to store OAuth State and Sessions:
  stores: {
    states: lucidStateStore(() => import('#models/oauth_state')),
    sessions: lucidSessionStore(() => import('#models/oauth_session')),
  },
})
