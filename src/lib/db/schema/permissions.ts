import { pgTable, text, boolean } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'

export const permissions = pgTable('permission', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  module: text('module').notNull(),
  canView: boolean('can_view').notNull().default(true),
  canEdit: boolean('can_edit').notNull().default(false),
})
