ALTER TABLE "task" RENAME COLUMN "task_id" TO "task_group_id";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_task_id_task_group_id_fk";
--> statement-breakpoint
ALTER TABLE "assignment" ALTER COLUMN "state" SET DEFAULT 'pending';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_task_group_id_task_group_id_fk" FOREIGN KEY ("task_group_id") REFERENCES "public"."task_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
