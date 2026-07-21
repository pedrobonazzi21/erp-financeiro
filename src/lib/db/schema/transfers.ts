import { pgTable, text, decimal, timestamp } from 'drizzle-orm/pg-core'
import { bankAccounts } from './bank-accounts'
import { familyMembers } from './families'

export const transfers = pgTable('transfer', {
  id: text('id').primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  fromAccountId: text('from_account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  toAccountId: text('to_account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
