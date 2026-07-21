import { pgTable, text, pgEnum } from 'drizzle-orm/pg-core'

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense'])

export const categories = pgTable('category', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon').notNull(),
  type: categoryTypeEnum('type').notNull(),
})
