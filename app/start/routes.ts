/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

import '#start/routes/oauth'

router.get('/', [controllers.Home, 'index'])
router.get('/interviews', [controllers.Interviews, 'index'])
router
  .resource('/p', controllers.Profiles)
  .params({ p: 'handleOrDid' })
  .only(['show', 'update'])
  .as('profiles')

router
  .group(() => {
    router.get('/login', [controllers.Auth, 'login'])
    router.get('/signup', [controllers.Auth, 'signup'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('/onboarding', [controllers.Onboarding, 'show'])
    router.post('/onboarding', [controllers.Onboarding, 'store'])
  })
  .use(middleware.protected())
