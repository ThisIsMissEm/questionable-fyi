import vine from '@vinejs/vine'

export const resolveMiniDocValidator = vine.create({
  did: vine.string(),
  handle: vine.string(),
  pds: vine.string().url(),
  signing_key: vine.string(),
})
