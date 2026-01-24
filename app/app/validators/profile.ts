import vine from '@vinejs/vine'

export const showProfileValidator = vine.compile(
  vine.object({
    params: vine.object({
      handleOrDid: vine.atproto.identifier(),
    }),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    params: vine.object({
      handleOrDid: vine.atproto.identifier(),
    }),

    displayName: vine.string(),
    description: vine.string().optional(),
  })
)
