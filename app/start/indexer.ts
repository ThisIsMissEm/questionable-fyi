import indexer from '@thisismissem/adonisjs-atproto-tap/services/indexer'
import tap from '@thisismissem/adonisjs-atproto-tap/services/tap'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

import * as ActorProfile from '#lexicons/fyi/questionable/actor/profile'
import Account from '#models/account'
import Profile from '#models/profile'
import { IdentityEvent, RepoStatus } from '@atproto/tap'

type AccountRecord = Omit<IdentityEvent, 'id' | 'type' | 'status'> & { status: string }

async function upsertAccount(account: AccountRecord) {
  const updatedAt = DateTime.now()

  await Account.updateOrCreate(
    {
      did: account.did,
    },
    {
      did: account.did,
      handle: account.handle,
      status: account.status,
      isActive: account.isActive,
      hidden: account.status !== 'active',
      updatedAt,
    }
  )
}

indexer.identity(async (evt) => {
  await upsertAccount(evt)
})

indexer.record(async (evt) => {
  const uri = `at://${evt.did}/${evt.collection}/${evt.rkey}`
  if (evt.action === 'create' || evt.action === 'update') {
    console.log(`${evt.action}: ${uri}`)
  } else {
    console.log(`deleted: ${uri}`)
  }

  const account = await Account.find(evt.did)
  if (!account) {
    const repo = await tap.getRepoInfo(evt.did)
    if (repo.error) {
      return
    }

    await upsertAccount({
      did: repo.did,
      handle: repo.handle,
      status: repo.state,
      isActive: repo.state === 'active',
    })
  }

  if (evt.collection === ActorProfile.$nsid) {
    if (evt.rkey !== 'self') {
      return
    }

    if (evt.action === 'delete') {
      await Profile.query().where('did', evt.did).delete()
      return
    }

    const parsedProfile = ActorProfile.$safeParse(evt.record)
    if (!parsedProfile.success) {
      logger.info({ record: evt.record }, `Invalid ${ActorProfile.$nsid} record for: ${evt.did}`)
      return
    }

    logger.debug(parsedProfile.value, `Parsed profile for ${evt.did}`)

    const profile = parsedProfile.value
    const indexedAt = DateTime.now()

    await Profile.updateOrCreate(
      {
        did: evt.did,
      },
      {
        displayName: profile.displayName ?? null,
        createdAt: profile.createdAt ? DateTime.fromISO(profile.createdAt) : undefined,
        indexedAt,
      }
    )
  }
})
