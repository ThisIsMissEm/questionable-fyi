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

const HomeController = () => import('#controllers/home_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const OAuthController = () => import('#controllers/oauth_controller')
const OnboardingController = () => import('#controllers/onboarding_controller')

router.get('/', [HomeController, 'index']).as('home')
router
  .resource('/p', ProfilesController)
  .params({ p: 'handleOrDid' })
  .only(['show', 'update'])
  .as('profile')

router
  .group(() => {
    router.on('/login').renderInertia('login').as('login')
    router.on('/signup').renderInertia('signup').as('signup')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('/onboarding', [OnboardingController, 'show']).as('onboarding')
    router.post('/onboarding', [OnboardingController, 'store'])
  })
  .use(middleware.auth())

router.post('/oauth/logout', [OAuthController, 'logout']).as('oauth.logout').use(middleware.auth())

router
  .group(() => {
    router.post('/oauth/login', [OAuthController, 'login']).as('login')
    router.post('/oauth/signup', [OAuthController, 'signup']).as('signup')
    router.get('/oauth/callback', [OAuthController, 'callback']).as('callback')
    router.get('/oauth/jwks.json', [OAuthController, 'jwks']).as('jwks')
    router
      .get('/oauth-client-metadata.json', [OAuthController, 'clientMetadata'])
      .as('clientMetadata')
  })
  .as('oauth')
