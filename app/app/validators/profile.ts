import vine from '@vinejs/vine'

export const showProfileValidator = vine.compile(
  vine.object({
    params: vine.object({
      handleOrDid: vine.string(),
    }),
  })
)
