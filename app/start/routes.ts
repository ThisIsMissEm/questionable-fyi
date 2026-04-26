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
  .params({ p: 'identifier' })
  .only(['show', 'update'])
  .as('profile')

router
  .group(() => {
    router.resource('questions', controllers.Questions).only(['index', 'show'])
  })
  .prefix('/p/:identifier')
  .as('profile')

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

router
  .group(() => {
    router.resource('ask', controllers.api.Asks).only(['store'])
  })
  .prefix('/api')
  .as('api')
