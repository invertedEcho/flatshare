DO $$ BEGIN
 CREATE TYPE "public"."shopping_list_item_state" AS ENUM('pending', 'purchased', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "shopping_list_item" ADD COLUMN "state" "shopping_list_item_state" DEFAULT 'pending' NOT NULL;