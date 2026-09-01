CREATE TABLE "product_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "series_id" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "short_description_hu" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "short_description_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "main_image" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "three_d_ar_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "variant_options" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "extras" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product_series" ADD CONSTRAINT "product_series_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_series_id_product_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."product_series"("id") ON DELETE no action ON UPDATE no action;