import vine from '@vinejs/vine'
import { isStrongRef } from '#validators/helpers'
import * as lexicon from '#lexicons/index'
import '#validators/vine_lexicon'

export const askValidator = vine.create({
  title: vine.string().minLength(3).maxLength(3000),
  content: vine.lexicon(lexicon.fyi.questionable.richtext.content.main),
  context: vine.atproto
    .atUri()
    .optional()
    .use(isStrongRef([{ collection: lexicon.fyi.questionable.actor.profile.$nsid, rkey: 'self' }])),
})
