import Question from '#models/question'
import QuestionTransformer from '#transformers/question_transformer'
import { homeValidator } from '#validators/homepage'
import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ request, inertia, logger }: HttpContext) {
    const { params } = await request.validateUsing(homeValidator)

    logger.debug({ params }, 'homepage')

    const questions = await Question.query()
      .where({ contextType: null })
      .if(params.filter === 'answered', () => {})
      .if(params.filter === 'unanswered', () => {})
      .orderBy('createdAt', 'desc')
      .preload('author', (authorQuery) => {
        authorQuery.preload('profile', (profileQuery) => {
          profileQuery.preload('account')
        })
      })
      .paginate(1)

    const data = questions.all()
    const metadata = questions.getMeta()

    return inertia.render('home', {
      questions: QuestionTransformer.paginate(data, metadata),
    })
  }
}
