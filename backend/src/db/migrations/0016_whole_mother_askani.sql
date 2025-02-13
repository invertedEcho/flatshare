ALTER TABLE "expense_beneficiary" RENAME TO "expense_beneficiary_mapping";--> statement-breakpoint
ALTER TABLE "expense_beneficiary_mapping" DROP CONSTRAINT "expense_beneficiary_expense_item_id_expense_item_id_fk";
--> statement-breakpoint
ALTER TABLE "expense_beneficiary_mapping" DROP CONSTRAINT "expense_beneficiary_user_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_beneficiary_mapping" ADD CONSTRAINT "expense_beneficiary_mapping_expense_item_id_expense_item_id_fk" FOREIGN KEY ("expense_item_id") REFERENCES "public"."expense_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_beneficiary_mapping" ADD CONSTRAINT "expense_beneficiary_mapping_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
