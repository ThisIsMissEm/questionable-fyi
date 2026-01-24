import vine from '@vinejs/vine'

export const showProfileValidator = vine.create({
  params: vine.object({
    handleOrDid: vine.atproto.identifier(),
  }),
})

export const updateProfileValidator = vine.create({
  params: vine.object({
    handleOrDid: vine.atproto.identifier(),
  }),

  displayName: vine.string(),
  description: vine.string().optional(),
})
