/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const),

  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  PUBLIC_URL: Env.schema.string({ format: 'url', tld: false }),

  APP_KEY: Env.schema.string(),

  SESSION_DRIVER: Env.schema.enum(['database', 'memory'] as const),

  DATABASE_URL: Env.schema.string(),
  DATABASE_POOL_MIN: Env.schema.number.optional(),
  DATABASE_POOL_MAX: Env.schema.number.optional(),
  DATABASE_AUTOMIGRATE: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the AT Protocol Tap client
  |----------------------------------------------------------
  */
  TAP_URL: Env.schema.string({ format: 'url', tld: false, protocol: true }),
  TAP_ADMIN_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the AT Protocol OAuth provider
  |----------------------------------------------------------
  */
  ATPROTO_OAUTH_CLIENT_ID: Env.schema.string.optional({ format: 'url', tld: true, protocol: true }),
  ATPROTO_OAUTH_JWT_PRIVATE_KEY: Env.schema.string.optional(),
})
