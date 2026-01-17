import vine from '@vinejs/vine'

export const showProfileValidator = vine.compile(
  vine.object({
    params: vine.object({
      handleOrDid: vine.string(),
    }),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    params: vine.object({
      handleOrDid: vine.string(),
    }),

    displayName: vine.string(),
    description: vine.string(),
  })
)
