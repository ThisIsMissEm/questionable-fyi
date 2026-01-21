import vine from '@vinejs/vine'

export const homeValidator = vine.create({
  params: vine.object({
    filter: vine.enum(['answered', 'unanswered']).optional(),
  }),
})
