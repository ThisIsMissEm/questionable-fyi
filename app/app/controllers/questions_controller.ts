import { errors, type HttpContext } from '@adonisjs/core/http'
import { AtUri } from '@atproto/syntax'
import * as lexicon from '#lexicons/index'

import Question from '#models/question'
import { listQuestionsValidator, showQuestionValidator } from '#validators/question'
import { resolveHandle } from '#utils/helpers'
import ProfileTransformer from '#transformers/profile_transformer'
import QuestionTransformer from '#transformers/question_transformer'

export default class QuestionsController {
  async index({ request, response, inertia }: HttpContext) {
    const { params } = await request.validateUsing(listQuestionsValidator)

    const resolved = await resolveHandle({
      url: request.url(),
      params,
      redirect(handle) {
        return response.redirect().toRoute('profile.questions.index', { identifier: handle })
      },
    })

    if (resolved.redirected) return

    const profileResult = ProfileTransformer.transform(resolved.profile, resolved.account)
    if (!profileResult) {
      throw new errors.E_ROUTE_NOT_FOUND(['GET', request.url()])
    }

    const questions = await Question.query()
      .where({ authorDid: resolved.account.did, contextType: null })
      .orderBy('createdAt', 'desc')
      .preload('author', (authorQuery) => {
        authorQuery.preload('profile', (profileQuery) => {
          profileQuery.preloadOnce('account')
        })
      })
      .paginate(1)

    const data = questions.all()
    const metadata = questions.getMeta()

    return inertia.render('profiles/questions/index', {
      profile: profileResult,
      questions: QuestionTransformer.paginate(data, metadata),
    })
  }

  async show({ request, response, inertia }: HttpContext) {
    const { params } = await request.validateUsing(showQuestionValidator)

    const resolved = await resolveHandle({
      url: request.url(),
      params,
      redirect(handle) {
        return response
          .redirect()
          .toRoute('profile.questions.show', { identifier: handle, id: params.id })
      },
    })

    if (resolved.redirected) return

    const atUri = AtUri.make(
      resolved.account.did,
      lexicon.fyi.questionable.question.$nsid,
      params.id
    )
    const question = await Question.query()
      .where({ uri: atUri.toString() })
      .preload('author', (authorQuery) => {
        authorQuery.preload('profile', (profile) => {
          profile.preload('account')
        })
      })
      .firstOrFail()

    question.assertValid()

    const profileResult = ProfileTransformer.transform(resolved.profile, resolved.account)
    if (!profileResult) {
      throw new errors.E_ROUTE_NOT_FOUND(['GET', request.url()])
    }

    return inertia.render('questions/show', {
      question: QuestionTransformer.transform(question),
      profile: profileResult,
    })
  }
}
