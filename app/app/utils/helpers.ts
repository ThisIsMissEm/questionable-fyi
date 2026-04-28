import type { AtIdentifierString } from '@atproto/syntax'
import router from '@adonisjs/core/services/router'
import { errors } from '@adonisjs/core'

import type Profile from '#models/profile'
import Account from '#models/account'

type ResolveHandleOptions = {
  url: string
  params: { identifier: AtIdentifierString }
  redirect: (handle: string) => void
}

type ResolveResult =
  | { redirected: true }
  | { redirected: false; account: Account; profile: Profile | null }

export async function resolveHandle({
  url,
  params,
  redirect,
}: ResolveHandleOptions): Promise<ResolveResult> {
  // handle.invalid shouldn't display a profile:
  if (params.identifier === 'handle.invalid') {
    throw new errors.E_ROUTE_NOT_FOUND(['GET', url])
  }

  const account = await Account.resolveOrFail(params.identifier)
  await account.load('profile')

  // Redirect to canonical profile page:
  if (params.identifier !== account.handle && account.handle !== 'handle.invalid') {
    redirect(account.handle)
    return { redirected: true }
  }

  return {
    redirected: false,
    account,
    profile: account.profile,
  }
}

export type ProfileLinks = {
  asks?: string
  questions: string
  answers?: string
}

export function getProfileLinks(account: Account): ProfileLinks {
  return {
    asks: router.makeUrl('profile.show', { identifier: account.handle }),
    questions: router.makeUrl('profile.questions.index', {
      identifier: account.handle,
    }),
    answers: undefined,
  }
}
