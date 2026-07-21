import { pgTable, text } from 'drizzle-orm/pg-core'
import { families } from './families'

export const tags = pgTable('tag', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  familyId: text('family_id').references(() => families.id, { onDelete: 'cascade' }),
})
