ALTER TABLE "products" ADD COLUMN "weight_kg" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "shipping_rates" DROP COLUMN "label";--> statement-breakpoint
ALTER TABLE "shipping_rates" DROP COLUMN "band";