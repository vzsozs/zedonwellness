CREATE TABLE "extras" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_hu" text NOT NULL,
	"name_en" text,
	"price_huf" numeric(12, 0) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_extras" (
	"product_id" integer NOT NULL,
	"extra_id" integer NOT NULL,
	CONSTRAINT "product_extras_product_id_extra_id_pk" PRIMARY KEY("product_id","extra_id")
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "specs" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "product_extras" ADD CONSTRAINT "product_extras_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_extras" ADD CONSTRAINT "product_extras_extra_id_extras_id_fk" FOREIGN KEY ("extra_id") REFERENCES "public"."extras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "extras";