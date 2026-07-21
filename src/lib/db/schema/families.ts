import { pgTable, text, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const profileEnum = pgEnum('profile', ['adult', 'teen', 'child'])

export const families = pgTable('family', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const familyMembers = pgTable('family_member', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  photo: text('photo'),
  profile: profileEnum('profile').notNull().default('adult'),
  income: decimal('income', { precision: 12, scale: 2 }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  familyId: text('family_id').notNull().references(() => families.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
