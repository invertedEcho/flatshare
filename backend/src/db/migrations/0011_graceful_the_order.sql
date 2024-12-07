ALTER TABLE "recurring_task_group" RENAME TO "task_group";--> statement-breakpoint
ALTER TABLE "recurring_task_group_user" RENAME TO "task_group_user_mapping";--> statement-breakpoint
ALTER TABLE "task_user_group" RENAME TO "task_user_group_mapping";--> statement-breakpoint
ALTER TABLE "user_user_group" RENAME TO "user_user_group_mapping";--> statement-breakpoint
ALTER TABLE "task_group_user_mapping" RENAME COLUMN "recurring_task_group_id" TO "task_group_id";--> statement-breakpoint
ALTER TABLE "task" RENAME COLUMN "recurring_task_group_id" TO "task_group_id";--> statement-breakpoint
ALTER TABLE "task_user_group_mapping" RENAME COLUMN "groupId" TO "user_group_id";--> statement-breakpoint
ALTER TABLE "user_user_group_mapping" RENAME COLUMN "group_id" TO "user_group_id";--> statement-breakpoint
ALTER TABLE "task_group_user_mapping" DROP CONSTRAINT "recurring_task_group_user_recurring_task_group_id_recurring_task_group_id_fk";
--> statement-breakpoint
ALTER TABLE "task_group_user_mapping" DROP CONSTRAINT "recurring_task_group_user_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_recurring_task_group_id_recurring_task_group_id_fk";
--> statement-breakpoint
ALTER TABLE "task_user_group_mapping" DROP CONSTRAINT "task_user_group_task_id_task_id_fk";
--> statement-breakpoint
ALTER TABLE "task_user_group_mapping" DROP CONSTRAINT "task_user_group_groupId_user_group_id_fk";
--> statement-breakpoint
ALTER TABLE "user_user_group_mapping" DROP CONSTRAINT "user_user_group_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_user_group_mapping" DROP CONSTRAINT "user_user_group_group_id_user_group_id_fk";
--> statement-breakpoint
ALTER TABLE "task_group_user_mapping" DROP CONSTRAINT "recurring_task_group_user_recurring_task_group_id_user_id_assignment_ordinal_pk";--> statement-breakpoint
ALTER TABLE "user_user_group_mapping" DROP CONSTRAINT "user_user_group_user_id_group_id_pk";--> statement-breakpoint
ALTER TABLE "task_group_user_mapping" ADD CONSTRAINT "task_group_user_mapping_task_group_id_user_id_assignment_ordinal_pk" PRIMARY KEY("task_group_id","user_id","assignment_ordinal");--> statement-breakpoint
ALTER TABLE "user_user_group_mapping" ADD CONSTRAINT "user_user_group_mapping_user_id_user_group_id_pk" PRIMARY KEY("user_id","user_group_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_group_user_mapping" ADD CONSTRAINT "task_group_user_mapping_task_group_id_task_group_id_fk" FOREIGN KEY ("task_group_id") REFERENCES "public"."task_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_group_user_mapping" ADD CONSTRAINT "task_group_user_mapping_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_task_group_id_task_group_id_fk" FOREIGN KEY ("task_group_id") REFERENCES "public"."task_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_user_group_mapping" ADD CONSTRAINT "task_user_group_mapping_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_user_group_mapping" ADD CONSTRAINT "task_user_group_mapping_user_group_id_user_group_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_user_group_mapping" ADD CONSTRAINT "user_user_group_mapping_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_user_group_mapping" ADD CONSTRAINT "user_user_group_mapping_user_group_id_user_group_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
