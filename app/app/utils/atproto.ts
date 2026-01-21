import { ensureValidDatetime, HandleString, INVALID_HANDLE } from '@atproto/syntax'
import { DateTime } from 'luxon'

export function getCurrentTimestamp() {
  const now = DateTime.now().toISO()
  ensureValidDatetime(now)
  return now
}

export function isHandleInvalid(handle: HandleString | string) {
  return handle.toLowerCase() === INVALID_HANDLE
}
