ALTER TABLE "recurring_task_group_user" ADD COLUMN "assigment_ordinal" integer;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "assignment-order-position";