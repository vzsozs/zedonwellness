CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "extras" ADD COLUMN "price_eur" numeric(10, 2);