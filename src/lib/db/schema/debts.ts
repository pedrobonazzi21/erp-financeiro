import { pgTable, text, decimal, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'

export const debtTypeEnum = pgEnum('debt_type', ['loan', 'financing', 'installment'])

export const debts = pgTable('debt', {
  id: text('id').primaryKey(),
  type: debtTypeEnum('type').notNull(),
  description: text('description').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  remainingAmount: decimal('remaining_amount', { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  installmentsTotal: integer('installments_total').notNull(),
  installmentsRemaining: integer('installments_remaining').notNull(),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  creditorName: text('creditor_name'),
  forMemberIds: jsonb('for_member_ids'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
