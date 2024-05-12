CREATE TABLE IF NOT EXISTS "user_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_task_id_task_id_fk";
--> statement-breakpoint
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "assignment" ADD COLUMN "user_task_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_task" ADD CONSTRAINT "user_task_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_task" ADD CONSTRAINT "user_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignment" ADD CONSTRAINT "assignment_user_task_id_user_task_id_fk" FOREIGN KEY ("user_task_id") REFERENCES "public"."user_task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "assignment" DROP COLUMN IF EXISTS "task_id";--> statement-breakpoint
ALTER TABLE "assignment" DROP COLUMN IF EXISTS "user_id";