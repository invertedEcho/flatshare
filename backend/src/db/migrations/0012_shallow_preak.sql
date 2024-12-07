ALTER TABLE "user_group_invite" RENAME COLUMN "group_id" TO "user_group_id";--> statement-breakpoint
ALTER TABLE "user_group_invite" DROP CONSTRAINT "user_group_invite_group_id_user_group_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_group_invite" ADD CONSTRAINT "user_group_invite_user_group_id_user_group_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
