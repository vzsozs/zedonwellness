CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name_hu" text NOT NULL,
	"name_en" text,
	"sku" text,
	"price_huf" numeric(12, 0),
	"weight_kg" numeric(8, 2),
	"image_url" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;