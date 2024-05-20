CREATE TABLE IF NOT EXISTS "task_group_assignment_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_task_group" RENAME TO "task_group_user";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_group_assignment_table" ADD CONSTRAINT "task_group_assignment_table_task_group_id_task_group_id_fk" FOREIGN KEY ("task_group_id") REFERENCES "public"."task_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_group_assignment_table" ADD CONSTRAINT "task_group_assignment_table_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
