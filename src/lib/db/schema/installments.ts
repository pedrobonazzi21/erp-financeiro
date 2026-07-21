import { pgTable, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core'
import { creditCards } from './credit-cards'
import { categories } from './categories'

export const installments = pgTable('installment', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  installmentAmount: decimal('installment_amount', { precision: 12, scale: 2 }).notNull(),
  totalCount: integer('total_count').notNull(),
  currentCount: integer('current_count').notNull().default(1),
  creditCardId: text('credit_card_id').references(() => creditCards.id, { onDelete: 'set null' }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  startDate: timestamp('start_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
