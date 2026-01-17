import { ensureValidDatetime } from '@atproto/syntax'
import { DateTime } from 'luxon'

export function getCurrentTimestamp() {
  const now = DateTime.now().toISO()
  ensureValidDatetime(now)
  return now
}
