ALTER TABLE "categories" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "terms_accepted_at" timestamp;--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_features_group_idx" ON "product_features" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "product_series_category_idx" ON "product_series" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_series_idx" ON "products" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "shipping_rates_zone_idx" ON "shipping_rates" USING btree ("zone");