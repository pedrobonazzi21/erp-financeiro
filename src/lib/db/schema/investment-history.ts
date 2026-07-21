import { pgTable, text, decimal, timestamp } from 'drizzle-orm/pg-core'
import { investments } from './investments'

export const investmentHistory = pgTable('investment_history', {
  id: text('id').primaryKey(),
  investmentId: text('investment_id').notNull().references(() => investments.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  type: text('type').notNull().default('apport'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
