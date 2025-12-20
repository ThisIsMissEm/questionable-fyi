import { defineConfig } from '@thisismissem/adonisjs-atproto-tap'
import env from '#start/env'

export default defineConfig({
  url: env.get('TAP_URL'),
  config: {
    adminPassword: env.get('TAP_ADMIN_PASSWORD'),
  },
})
