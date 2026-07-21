import { pgTable, text } from 'drizzle-orm/pg-core'
import { families } from './families'

export const paymentMethods = pgTable('payment_method', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  familyId: text('family_id').references(() => families.id, { onDelete: 'cascade' }),
})
