import vine from '@vinejs/vine'
import { isStrongRef } from '#validators/helpers'
import * as lexicon from '#lexicons/index'

export const askValidator = vine.create({
  title: vine.string().minLength(3).maxLength(3000),
  content: vine.string().optional(),
  context: vine.atproto
    .atUri()
    .optional()
    .use(isStrongRef([{ collection: lexicon.fyi.questionable.actor.profile.$nsid, rkey: 'self' }])),
})
