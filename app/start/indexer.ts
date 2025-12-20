import indexer from '@thisismissem/adonisjs-atproto-tap/services/indexer'

indexer.identity(async (evt) => {
  console.log(`${evt.did} updated identity: ${evt.handle} (${evt.status})`)
})

indexer.record(async (evt) => {
  const uri = `at://${evt.did}/${evt.collection}/${evt.rkey}`
  if (evt.action === 'create' || evt.action === 'update') {
    console.log(`${evt.action}: ${uri}`)
  } else {
    console.log(`deleted: ${uri}`)
  }
})
