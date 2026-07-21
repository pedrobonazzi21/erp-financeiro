import { pgTable, text, decimal, integer, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'
import { bankAccounts } from './bank-accounts'
import { categories } from './categories'

export const billStatusEnum = pgEnum('bill_status', ['paid', 'pending'])
export const billFrequencyEnum = pgEnum('bill_frequency', ['weekly', 'monthly', 'bimonthly', 'quarterly', 'yearly'])

export const recurringBills = pgTable('recurring_bill', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  dueDay: integer('due_day').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  accountId: text('account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  frequency: billFrequencyEnum('frequency').notNull().default('monthly'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  autoAdjust: boolean('auto_adjust').notNull().default(false),
  suspended: boolean('suspended').notNull().default(false),
  status: billStatusEnum('status').notNull().default('pending'),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
