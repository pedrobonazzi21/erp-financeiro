import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

const migrations = [
  `CREATE TABLE IF NOT EXISTS "fixed_income" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "amount" numeric(12, 2) NOT NULL,
    "category_id" text NOT NULL,
    "account_id" text NOT NULL,
    "member_id" text NOT NULL,
    "due_day" integer,
    "frequency" text DEFAULT 'monthly' NOT NULL,
    "start_date" timestamp,
    "end_date" timestamp,
    "description" text,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,
  `DO $$ BEGIN
    ALTER TABLE "fixed_income" ADD CONSTRAINT "fixed_income_category_id_category_id_fk"
      FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE restrict;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
  `DO $$ BEGIN
    ALTER TABLE "fixed_income" ADD CONSTRAINT "fixed_income_account_id_bank_account_id_fk"
      FOREIGN KEY ("account_id") REFERENCES "bank_account"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
  `DO $$ BEGIN
    ALTER TABLE "fixed_income" ADD CONSTRAINT "fixed_income_member_id_family_member_id_fk"
      FOREIGN KEY ("member_id") REFERENCES "family_member"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
  `ALTER TABLE "bank_account" ADD COLUMN IF NOT EXISTS "category_id" text`,
  `DO $$ BEGIN
    ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_category_id_category_id_fk"
      FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE set null;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
]

async function run() {
  console.log('Running migrations...')
  for (const migration of migrations) {
    try {
      await sql.unsafe(migration)
      console.log('  OK')
    } catch (e) {
      console.error('  FAILED:', e.message)
    }
  }
  console.log('Done.')
  await sql.end()
}

run()
