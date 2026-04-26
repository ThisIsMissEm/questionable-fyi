import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async login({ inertia }: HttpContext) {
    return inertia.render('chromeless/login', {})
  }

  async signup({ inertia }: HttpContext) {
    return inertia.render('chromeless/signup', {})
  }
}
