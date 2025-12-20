import type { HttpContext } from '@adonisjs/core/http'
import Tap from '@thisismissem/adonisjs-atproto-tap/services/tap'

export default class HomeController {
  async index({ request, response }: HttpContext) {
    const did = request.input('did')

    console.log({ did })

    if (!did) {
      return response.json({ error: 'missing did query parameter' })
    }

    if (typeof did === 'string') {
      await Tap.addRepos([did])
      return response.json({ result: `Added ${did}` })
    }
  }
}
