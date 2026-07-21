import { pgTable, text, decimal, timestamp } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'

export const goals = pgTable('goal', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  target: decimal('target', { precision: 12, scale: 2 }).notNull(),
  saved: decimal('saved', { precision: 12, scale: 2 }).notNull().default('0'),
  deadline: timestamp('deadline'),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
