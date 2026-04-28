import type { HasOne } from '@adonisjs/lucid/types/relations'
import type { ModelAttributes } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { computed, hasOne } from '@adonisjs/lucid/orm'
import { AtUri, type AtUriString, type DidString } from '@atproto/syntax'
import logger from '@adonisjs/core/services/logger'

import * as lexicon from '#lexicons/index'
import { withAtprotoRecord } from '#models/atproto_model'
import Account from '#models/account'
import Profile from '#models/profile'
import { QuestionSchema } from '#database/schema'

export type QuestionContextType = 'profile' | undefined

export default class Question extends withAtprotoRecord(
  lexicon.fyi.questionable.graph.question,
  QuestionSchema
) {
  @hasOne(() => Account, {
    localKey: 'authorDid',
    foreignKey: 'did',
  })
  declare author: HasOne<typeof Account>

  @hasOne(() => Profile, {
    localKey: 'authorDid',
    foreignKey: 'did',
  })
  declare profile: HasOne<typeof Profile>

  /**
   * Computed properties from the record:
   **/
  @computed()
  get summary() {
    return this.record?.summary
  }

  @computed()
  get content() {
    return this.record?.content
  }

  @computed()
  get languages() {
    return this.record?.languages
  }

  static async upsert(
    uri: AtUriString,
    cid: string,
    rkey: string,
    author: DidString | string,
    record: lexicon.fyi.questionable.graph.question.Main,
    indexedAt?: DateTime | undefined
  ) {
    logger.trace({ uri, cid, rkey, author, record }, 'Upserting Question')

    let createdAt = record.createdAt ? DateTime.fromISO(record.createdAt) : DateTime.now()
    if (!createdAt.isValid) {
      createdAt = DateTime.now()
    }

    const props: Partial<ModelAttributes<Question>> = {
      uri,
      rkey,
      cid,
      record,
      authorDid: author,
      createdAt,
      updatedAt: DateTime.now(),
    }

    if (record.contextRef) {
      const contextUri = new AtUri(record.contextRef.uri)
      if (
        contextUri.collection === lexicon.fyi.questionable.actor.profile.$nsid &&
        contextUri.rkey === 'self'
      ) {
        props.contextType = 'profile'
        props.contextUri = record.contextRef.uri
        props.contextCid = record.contextRef.cid
      } else {
        logger.warn({ contextRef: record.contextRef, uri }, 'Unknown question contextRef value')
      }
    }

    if (indexedAt) {
      props.indexedAt = indexedAt
    }

    return this.updateOrCreate({ uri: uri }, props)
  }
}
