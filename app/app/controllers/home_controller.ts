import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ inertia, logger, oauth }: HttpContext) {
    logger.debug(oauth)
    let token
    if (oauth) {
      token = await oauth.getTokenInfo()
      logger.debug({ token })
    }
    return inertia.render('home', { debug: JSON.stringify(token, null, 2) })
  }
}
