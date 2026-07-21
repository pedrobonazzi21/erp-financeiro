import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { familyMembers } from './families'

export const documentTypeEnum = pgEnum('document_type', [
  'boleto', 'invoice', 'irpf', 'statement', 'contract', 'receipt',
])

export const documents = pgTable('document', {
  id: text('id').primaryKey(),
  type: documentTypeEnum('type').notNull(),
  name: text('name').notNull(),
  fileUrl: text('file_url').notNull(),
  date: timestamp('date').notNull(),
  memberId: text('member_id').notNull().references(() => familyMembers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
