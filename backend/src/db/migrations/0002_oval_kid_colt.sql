ALTER TABLE "task_group" ADD COLUMN "initial_start_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_task_group" DROP COLUMN IF EXISTS "initial_start_date";