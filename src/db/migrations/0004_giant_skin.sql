ALTER TABLE "products" DROP CONSTRAINT "products_series_id_product_series_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_series_id_product_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."product_series"("id") ON DELETE set null ON UPDATE no action;