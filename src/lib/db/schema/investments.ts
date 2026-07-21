import { pgTable, text, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'

export const investmentTypeEnum = pgEnum('investment_type', [
  'treasury', 'cdb', 'stock', 'fii', 'etf', 'crypto', 'pension',
])

export const investments = pgTable('investment', {
  id: text('id').primaryKey(),
  type: investmentTypeEnum('type').notNull(),
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  profitability: decimal('profitability', { precision: 6, scale: 2 }).notNull().default('0'),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
