import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('did').primary()
      table.text('display_name')

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('indexed_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
