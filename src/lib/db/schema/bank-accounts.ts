import { pgTable, text, decimal, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'

export const accountTypeEnum = pgEnum('account_type', ['checking', 'savings', 'investment'])

export const bankAccounts = pgTable('bank_account', {
  id: text('id').primaryKey(),
  bank: text('bank').notNull(),
  agency: text('agency').notNull(),
  account: text('account').notNull(),
  type: accountTypeEnum('type').notNull().default('checking'),
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0'),
  overdraftLimit: decimal('overdraft_limit', { precision: 12, scale: 2 }).notNull().default('0'),
  pixKey: text('pix_key'),
  joint: boolean('joint').notNull().default(false),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
