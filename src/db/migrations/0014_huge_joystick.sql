ALTER TABLE "products" ADD COLUMN "price_eur" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_huf_manual" boolean DEFAULT false NOT NULL;