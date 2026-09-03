ALTER TABLE "product_features" ADD COLUMN "price_eur" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_features" ADD COLUMN "price_huf" numeric(12, 0);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "specs_position" text DEFAULT 'auto' NOT NULL;