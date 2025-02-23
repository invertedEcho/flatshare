CREATE TABLE IF NOT EXISTS "expense_beneficiary" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_item_id" integer NOT NULL,
	"user_id" integer,
	"percentage_share" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"user_group_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_payer" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_item_id" integer NOT NULL,
	"user_id" integer,
	"percentage_paid" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_beneficiary" ADD CONSTRAINT "expense_beneficiary_expense_item_id_expense_item_id_fk" FOREIGN KEY ("expense_item_id") REFERENCES "public"."expense_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_beneficiary" ADD CONSTRAINT "expense_beneficiary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_item" ADD CONSTRAINT "expense_item_user_group_id_user_group_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_payer" ADD CONSTRAINT "expense_payer_expense_item_id_expense_item_id_fk" FOREIGN KEY ("expense_item_id") REFERENCES "public"."expense_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_payer" ADD CONSTRAINT "expense_payer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
