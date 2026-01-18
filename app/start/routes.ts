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

import '#start/routes/oauth'

const HomeController = () => import('#controllers/home_controller')
const InterviewsController = () => import('#controllers/interviews_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const OnboardingController = () => import('#controllers/onboarding_controller')

router.get('/', [HomeController, 'index']).as('home')
router.get('/interviews', [InterviewsController, 'index']).as('interviews.index')
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
