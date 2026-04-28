import { askValidator } from '#validators/ask'
import type { HttpContext } from '@adonisjs/core/http'
import * as lexicon from '#lexicons/index'
import { getCurrentTimestamp } from '#utils/atproto'
import Question from '#models/question'
import Account from '#models/account'
import { AtUri } from '@atproto/syntax'
import Profile from '#models/profile'

export default class AsksController {
  async store({ request, response, auth, logger }: HttpContext) {
    const user = auth.getUserOrFail()
    logger.debug(request.all(), 'request params')
    const [errors, data] = await request.tryValidateUsing(askValidator)

    if (errors) {
      return response.status(422).json({ errors: errors.messages })
    }

    // Build the context reference:
    let context: lexicon.com.atproto.repo.strongRef.Main | null = null
    if (data.context) {
      const contextUri = new AtUri(data.context)
      if (
        contextUri.collection === lexicon.fyi.questionable.actor.profile.$nsid &&
        contextUri.rkey === 'self'
      ) {
        const profile = await Profile.findOrFail(contextUri.hostname)
        context = {
          uri: contextUri.toString(),
          cid: profile.cid,
        }
      }
    }

    // Build the record to create:
    const record = lexicon.fyi.questionable.graph.question.$build({
      createdAt: getCurrentTimestamp(),
      summary: data.title,
      content: data.content,
      contextRef: context !== null ? lexicon.com.atproto.repo.strongRef.$build(context) : undefined,
    })

    const created = await user.client.create(lexicon.fyi.questionable.graph.question, record)
    const uri = new AtUri(created.uri)
    await Question.upsert(created.uri, created.cid, uri.rkey, user.did, record)

    const author = await Account.resolveOrFail(user.did)
    const identifier = author.handle === 'handle.invalid' ? author.did : author.handle

    return response.json({ identifier, rkey: uri.rkey })
  }
}
