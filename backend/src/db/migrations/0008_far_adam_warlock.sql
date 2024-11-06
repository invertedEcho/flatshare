ALTER TABLE "user_user_group" DROP COLUMN IF EXISTS "id";
ALTER TABLE "user_user_group" ADD CONSTRAINT "user_user_group_user_id_group_id_pk" PRIMARY KEY("user_id","group_id");--> statement-breakpoint
