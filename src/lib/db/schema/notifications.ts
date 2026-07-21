import { pgTable, text, boolean, jsonb } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const notifications = pgTable('notification', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  config: jsonb('config'),
})
