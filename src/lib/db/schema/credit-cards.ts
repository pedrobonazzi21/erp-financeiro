import { pgTable, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'
import { bankAccounts } from './bank-accounts'

export const creditCards = pgTable('credit_card', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  limit: decimal('limit', { precision: 12, scale: 2 }).notNull(),
  used: decimal('used', { precision: 12, scale: 2 }).notNull().default('0'),
  available: decimal('available', { precision: 12, scale: 2 }).notNull(),
  bestDay: integer('best_day').notNull(),
  closingDay: integer('closing_day').notNull(),
  dueDay: integer('due_day').notNull(),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  bankAccountId: text('bank_account_id').references(() => bankAccounts.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
