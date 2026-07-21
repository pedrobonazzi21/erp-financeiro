import { pgTable, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core'
import { families } from './families'
import { categories } from './categories'

export const budgets = pgTable('budget', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  limit: decimal('limit', { precision: 12, scale: 2 }).notNull(),
  spent: decimal('spent', { precision: 12, scale: 2 }).notNull().default('0'),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  familyId: text('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
