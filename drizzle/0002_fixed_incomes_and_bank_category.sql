CREATE TABLE "fixed_income" (
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
);
--> statement-breakpoint
ALTER TABLE "fixed_income" ADD CONSTRAINT "fixed_income_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fixed_income" ADD CONSTRAINT "fixed_income_account_id_bank_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_account"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fixed_income" ADD CONSTRAINT "fixed_income_member_id_family_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."family_member"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bank_account" ADD COLUMN "category_id" text;
--> statement-breakpoint
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;
