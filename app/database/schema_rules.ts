import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  columns: {
    did: {
      tsType: 'DidString',
      decorator: '@column({ isPrimary: true })',
      imports: [
        {
          source: '@atproto/lex',
          typeImports: ['DidString'],
        },
      ],
    },
    uri: {
      tsType: 'AtUriString',
      decorator: '@column({ isPrimary: true })',
      imports: [
        {
          source: '@atproto/lex',
          typeImports: ['AtUriString'],
        },
      ],
    },
  },
  tables: {
    profiles: {
      skipColumns: ['record'],
    },
    questions: {
      skipColumns: ['record'],
      columns: {
        context_uri: {
          tsType: 'AtUriString',
          decorator: '@column()',
          imports: [
            {
              source: '@atproto/lex',
              typeImports: ['AtUriString'],
            },
          ],
        },
      },
    },
  },
} satisfies SchemaRules
