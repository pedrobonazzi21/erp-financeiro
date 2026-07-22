import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const banks = pgTable('banks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
