import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router.post('/oauth/logout', [controllers.Oauth, 'logout']).use(middleware.protected())

router.group(() => {
  router.post('/oauth/login', [controllers.Oauth, 'login'])
  router.post('/oauth/signup', [controllers.Oauth, 'signup'])
  router.get('/oauth/callback', [controllers.Oauth, 'callback'])
})
