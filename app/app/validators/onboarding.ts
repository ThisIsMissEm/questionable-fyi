import vine from '@vinejs/vine'

export const storeProfileValidator = vine.compile(
  vine.object({
    displayName: vine.string().minLength(1).maxLength(640),
  })
)
