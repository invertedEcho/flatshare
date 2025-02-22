ALTER TABLE "expense_beneficiary_mapping" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_item" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_payer_mapping" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;