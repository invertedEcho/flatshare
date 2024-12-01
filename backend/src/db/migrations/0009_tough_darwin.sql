ALTER TABLE "recurring_task_group_user" DROP COLUMN IF EXISTS "id";
ALTER TABLE "recurring_task_group_user" ADD CONSTRAINT "recurring_task_group_user_recurring_task_group_id_user_id_assignment_ordinal_pk" PRIMARY KEY("recurring_task_group_id","user_id","assignment_ordinal");--> statement-breakpoint
