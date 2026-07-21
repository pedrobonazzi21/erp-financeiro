import { pgTable, text } from 'drizzle-orm/pg-core'
import { categories } from './categories'

export const subcategories = pgTable('subcategory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
})
