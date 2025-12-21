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

router.get('/', [HomeController, 'index'])
router.resource('/p', ProfilesController).params({ p: 'handleOrDid' }).only(['show']).as('profile')
