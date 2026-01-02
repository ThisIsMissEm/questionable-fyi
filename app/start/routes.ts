/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const HomeController = () => import('#controllers/home_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const OAuthController = () => import('#controllers/oauth_controller')

router.get('/', [HomeController, 'index']).as('home')
router.on('/login').renderInertia('login').as('login')
router.on('/signup').renderInertia('signup').as('signup')
router.resource('/p', ProfilesController).params({ p: 'handleOrDid' }).only(['show']).as('profile')

router
  .group(() => {
    router.post('/oauth/login', [OAuthController, 'login']).as('login')
    router.post('/oauth/logout', [OAuthController, 'login']).as('logout')
    router.post('/oauth/signup', [OAuthController, 'signup']).as('signup')
    router.get('/oauth/callback', [OAuthController, 'callback']).as('callback')
    router.get('/oauth/jwks.json', [OAuthController, 'jwks']).as('jwks')
    router
      .get('/oauth-client-metadata.json', [OAuthController, 'clientMetadata'])
      .as('clientMetadata')
  })
  .as('oauth')
