import { defineConfig } from '@thisismissem/adonisjs-atproto-tap'
import { LexIndexer } from '@atproto/tap'
import env from '#start/env'

export default defineConfig({
  url: env.get('TAP_URL'),
  adminPassword: env.get('TAP_ADMIN_PASSWORD'),
  createIndexer() {
    return new LexIndexer()
  },
})
