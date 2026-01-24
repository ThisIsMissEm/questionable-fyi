import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import tap from '@thisismissem/adonisjs-atproto-tap/services/tap'
import { LexIndexer } from '@atproto/tap'
import { DateTime } from 'luxon'

import * as lexicon from '#lexicons/index'
import Account from '#models/account'
import Profile from '#models/profile'

const indexer = new LexIndexer()

indexer.identity(async (evt) => {
  logger.debug(evt, `Updating account for ${evt.did}`)
  await Account.upsert(evt)
})

indexer.delete(lexicon.fyi.questionable.actor.profile, async (evt) => {
  if (evt.rkey !== 'self') {
    return
  }

  logger.debug(`Deleting profile for ${evt.did}`)

  await Profile.query().where('did', evt.did).delete()
})

// Handle both creates and updates of actor profiles:
indexer.put(lexicon.fyi.questionable.actor.profile, async (evt) => {
  if (evt.rkey !== 'self') {
    return
  }

  logger.debug(evt.record, `Updating profile for ${evt.did}`)

  await Profile.upsert(evt.did, evt.record, DateTime.now())
})

indexer.error((err) => {
  logger.error(err, 'Error processing Tap event')
})

// Set the indexer to use with Tap:
tap.setIndexer(indexer)

if (app.getEnvironment() === 'web' && app.inDev) {
  tap.startIndexer()
}
