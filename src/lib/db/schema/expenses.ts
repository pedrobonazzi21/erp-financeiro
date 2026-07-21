import { pgTable, text, decimal, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'
import { bankAccounts } from './bank-accounts'
import { creditCards } from './credit-cards'
import { categories } from './categories'
import { subcategories } from './subcategories'
import { paymentMethods } from './payment-methods'
import { costCenters } from './cost-centers'

export const expenses = pgTable('expense', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  subcategoryId: text('subcategory_id').references(() => subcategories.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  competenceDate: timestamp('competence_date').notNull(),
  paidDate: timestamp('paid_date'),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  accountId: text('account_id').references(() => bankAccounts.id, { onDelete: 'set null' }),
  creditCardId: text('credit_card_id').references(() => creditCards.id, { onDelete: 'set null' }),
  paymentMethodId: text('payment_method_id').references(() => paymentMethods.id, { onDelete: 'set null' }),
  costCenterId: text('cost_center_id').references(() => costCenters.id, { onDelete: 'set null' }),
  description: text('description'),
  receipt: text('receipt'),
  recurring: boolean('recurring').notNull().default(false),
  splitMembers: jsonb('split_members'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
