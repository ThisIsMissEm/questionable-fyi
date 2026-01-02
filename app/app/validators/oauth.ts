import vine from '@vinejs/vine'

export const loginRequestValidator = vine.compile(
  vine.object({
    input: vine.string(),
  })
)

export const signupRequestValidator = vine.compile(
  vine.object({
    input: vine
      .string()
      .url({
        protocols: ['https'],
        require_host: true,
        require_tld: true,
        require_protocol: false,
        allow_query_components: false,
        allow_fragments: false,
        disallow_auth: true,
      })
      .optional()
      .transform((value) => {
        if (value) {
          if (!value.startsWith('https://')) {
            return `https://${value}`
          }
          return value
        } else {
          return 'https://bsky.social'
        }
      }),
  })
)
