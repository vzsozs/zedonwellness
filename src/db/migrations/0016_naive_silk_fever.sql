CREATE TABLE "product_feature_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_hu" text NOT NULL,
	"name_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_feature_links" (
	"product_id" integer NOT NULL,
	"feature_id" integer NOT NULL,
	CONSTRAINT "product_feature_links_product_id_feature_id_pk" PRIMARY KEY("product_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "product_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"name_hu" text NOT NULL,
	"name_en" text,
	"icon_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "documents" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_on_request" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_feature_links" ADD CONSTRAINT "product_feature_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_feature_links" ADD CONSTRAINT "product_feature_links_feature_id_product_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."product_features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_group_id_product_feature_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_feature_groups"("id") ON DELETE cascade ON UPDATE no action;