import { resolveMiniDocValidator } from '#validators/slingshot'

export class Slingshot {
  constructor() {}

  async resolveIdentity(did: string): Promise<string> {
    const url = new URL(
      'https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc'
    )
    url.searchParams.append('identifier', did)

    try {
      const response = await fetch(url)
      if (response.ok) {
        const json = await response.json()
        const [error, result] = await resolveMiniDocValidator.tryValidate(json)
        if (!error) {
          return result.handle
        }
      }

      return 'handle.invalid'
    } catch (err) {
      return 'handle.invalid'
    }
  }
}
