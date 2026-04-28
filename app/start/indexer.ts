import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import tap from '@thisismissem/adonisjs-atproto-tap/services/tap'
import { LexIndexer } from '@atproto/tap'
import { AtUri } from '@atproto/syntax'
import { DateTime } from 'luxon'

import * as lexicon from '#lexicons/index'
import Account from '#models/account'
import Profile from '#models/profile'
import Question from '#models/question'

const indexer = new LexIndexer()

indexer.identity(async (evt) => {
  // This is an invalid record:
  if (evt.did === 'did:web:lexicon.store') return

  logger.debug(evt, `Updating account for ${evt.did}`)
  await Account.upsert(evt)
})

indexer.put(lexicon.fyi.questionable.graph.question, async (evt) => {
  const uri = AtUri.make(evt.did, evt.collection, evt.rkey).toString()

  logger.debug(evt.record, `Updating question: ${uri}`)

  await Question.upsert(uri, evt.cid, evt.rkey, evt.did, evt.record, DateTime.now())
})

indexer.delete(lexicon.fyi.questionable.graph.question, async (evt) => {
  const uri = AtUri.make(evt.did, evt.collection, evt.rkey).toString()

  logger.debug(`Deleting question: ${uri}`)

  await Question.query().where({ uri }).delete()
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

  logger.debug(
    { record: evt.record, rev: evt.rev, cid: evt.cid },
    `Updating profile for ${evt.did}`
  )

  await Profile.upsert(evt.did, evt.cid, evt.record, DateTime.now())
})

indexer.error((err) => {
  logger.error(err, 'Error processing Tap event')
})

// Set the indexer to use with Tap:
tap.setIndexer(indexer)

if (app.getEnvironment() === 'web' && app.inDev) {
  tap.startIndexer()
}
