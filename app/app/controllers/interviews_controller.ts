import type { HttpContext } from '@adonisjs/core/http'

export default class InterviewsController {
  async index({ inertia }: HttpContext) {
    return inertia.render('interviews')
  }
}
