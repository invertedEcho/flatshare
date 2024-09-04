DO $$ BEGIN
 CREATE TYPE "public"."shopping_list_item_state" AS ENUM('pending', 'purchased', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopping_list_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"user_group_id" integer NOT NULL,
	"state" "shopping_list_item_state" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_user_group_id_user_group_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
