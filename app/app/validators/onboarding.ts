import vine from '@vinejs/vine'

export const storeProfileValidator = vine.create({
  displayName: vine.string().minLength(1).maxLength(640),
})
