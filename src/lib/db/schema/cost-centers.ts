import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { families } from './families'

export const costCenters = pgTable('cost_center', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  familyId: text('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
