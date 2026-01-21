import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('uri').notNullable().primary()
      table.text('cid')
      table.text('rkey').notNullable()
      table.text('author_did').notNullable()
      table.text('context_type').nullable()
      table.text('context_uri').nullable()
      table.text('context_cid').nullable()
      table.text('record').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('indexed_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
