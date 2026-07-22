import { pgTable, text, decimal, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'
import { bankAccounts } from './bank-accounts'
import { categories } from './categories'

export const fixedIncomes = pgTable('fixed_income', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  accountId: text('account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  dueDay: integer('due_day'),
  frequency: text('frequency').notNull().default('monthly'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
