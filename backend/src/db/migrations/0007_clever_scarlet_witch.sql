CREATE TABLE IF NOT EXISTS "group_invite" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" integer NOT NULL,
	"group_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group" (
	"id" serial PRIMARY KEY NOT NULL,
	"group" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"group_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_invite" ADD CONSTRAINT "group_invite_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_group" ADD CONSTRAINT "user_group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
