import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('did').primary()
      table.text('handle')

      // 'active', 'takendown', 'suspended', 'deactivated', 'deleted'
      table.string('status').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      // Moderation, prevents showing this use to the public
      table.boolean('hidden').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
