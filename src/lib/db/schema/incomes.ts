import { pgTable, text, decimal, timestamp, boolean } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'
import { bankAccounts } from './bank-accounts'
import { categories } from './categories'
import { subcategories } from './subcategories'
import { paymentMethods } from './payment-methods'
import { costCenters } from './cost-centers'

export const incomes = pgTable('income', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  subcategoryId: text('subcategory_id').references(() => subcategories.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  competenceDate: timestamp('competence_date').notNull(),
  receivedDate: timestamp('received_date'),
  accountId: text('account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  paymentMethodId: text('payment_method_id').references(() => paymentMethods.id, { onDelete: 'set null' }),
  costCenterId: text('cost_center_id').references(() => costCenters.id, { onDelete: 'set null' }),
  description: text('description'),
  receipt: text('receipt'),
  recurring: boolean('recurring').notNull().default(false),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
