CREATE TABLE "banks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_account" ALTER COLUMN "agency" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "bank_account" ALTER COLUMN "account" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "bank_account" ALTER COLUMN "overdraft_limit" DROP NOT NULL;
