import vine from '@vinejs/vine'
import { isTid } from '#validators/helpers'

export const listQuestionsValidator = vine.create({
  params: vine.object({
    identifier: vine.atproto.identifier(),
  }),
})

export const showQuestionValidator = vine.create({
  params: vine.object({
    identifier: vine.atproto.identifier(),
    id: vine.string().use(isTid()),
  }),
})
