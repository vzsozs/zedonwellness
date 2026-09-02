ALTER TABLE "shipping_rates" ADD COLUMN "zone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD COLUMN "min_kg" numeric(6, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD COLUMN "max_kg" numeric(6, 2);--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;