ALTER TABLE "group_invite" ALTER COLUMN "code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_group" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_group" ALTER COLUMN "group_id" SET NOT NULL;