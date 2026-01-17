import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OauthClientId extends BaseCommand {
  static commandName = 'oauth:client_id'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
    staysAlive: false,
  }

  async prepare() {
    const router = await this.app.container.make('router')
    router.commit()
  }

  async run() {
    const oauthClient = await this.app.container.make('oauth.client')
    const response = await fetch('https://cimd-service.fly.dev/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(oauthClient.clientMetadata),
    })

    const data = (await response.json()) as Record<string, any>

    if (!response.ok) {
      this.ui.logger.error(`Failed to fetch client_id`)
      this.ui.logger.error(JSON.stringify(data, null, 2))
      this.exitCode = 1
      return
    }

    if (data.client_id) {
      console.log('Add the following to .env:\n')
      console.log(`# Expires: ${data.expiresAfter}`)
      console.log(`OAUTH_CLIENT_ID="${data.client_id}"`)
    }
  }
}
