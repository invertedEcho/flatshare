CREATE TABLE IF NOT EXISTS "user_fcm_registration_token_mapping" (
	"user_id" integer NOT NULL,
	"fcm_registration_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_fcm_registration_token_mapping_user_id_fcm_registration_token_pk" PRIMARY KEY("user_id","fcm_registration_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_fcm_registration_token_mapping" ADD CONSTRAINT "user_fcm_registration_token_mapping_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
