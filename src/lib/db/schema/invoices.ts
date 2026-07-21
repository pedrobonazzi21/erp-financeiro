import { pgTable, text, decimal, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { creditCards } from './credit-cards'

export const invoiceStatusEnum = pgEnum('invoice_status', ['open', 'closed', 'paid', 'overdue'])

export const invoices = pgTable('invoice', {
  id: text('id').primaryKey(),
  creditCardId: text('credit_card_id').notNull().references(() => creditCards.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  status: invoiceStatusEnum('status').notNull().default('open'),
  dueDate: timestamp('due_date'),
  closingDate: timestamp('closing_date'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
