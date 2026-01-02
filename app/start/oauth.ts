import app from '@adonisjs/core/services/app'
import { OAuthClient } from '#services/oauth'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'oauth.client': OAuthClient
  }
}

app.container.singleton(OAuthClient, async () => {
  return new OAuthClient()
})

app.container.alias('oauth.client', OAuthClient)
