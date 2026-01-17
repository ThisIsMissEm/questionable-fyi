import indexer from '@thisismissem/adonisjs-atproto-tap/services/indexer'
import tap from '@thisismissem/adonisjs-atproto-tap/services/tap'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

import * as ActorProfile from '#lexicons/fyi/questionable/actor/profile'
import Account from '#models/account'
import Profile from '#models/profile'
import { RecordEvent } from '@atproto/tap'

indexer.identity(async (evt) => {
  await Account.upsert(evt)
})

indexer.record(async (evt: RecordEvent) => {
  const uri = `at://${evt.did}/${evt.collection}/${evt.rkey}`
  if (evt.action === 'create' || evt.action === 'update') {
    logger.info(
      { event: evt.action, uri, cid: evt.cid, rev: evt.rev },
      `Tap: ${evt.action}: ${uri}`
    )
  } else {
    logger.info({ event: evt.action, uri }, `Tap: deleted: ${uri}`)
  }

  const account = await Account.find(evt.did)
  if (!account) {
    // FIXME: We probably need to call resolveIdentity here:
    const repo = await tap.getRepoInfo(evt.did)

    await Account.upsert({
      did: repo.did,
      handle: repo.handle,
      // FIXME: We assume the account is active, because Tap doesn't tell us:
      status: 'active',
      isActive: true,
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

    const profile = ActorProfile.$safeParse(evt.record)
    if (!profile.success) {
      logger.info({ record: evt.record }, `Invalid ${ActorProfile.$nsid} record for: ${evt.did}`)
      return
    }

    logger.debug(profile.value, `Parsed profile for ${evt.did}`)

    await Profile.upsert(evt.did, profile.value, DateTime.now())
  }
})
