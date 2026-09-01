import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  // Short line shown under the category title on its listing page,
  // e.g. "HC Design, Celtic, OKA — 25+ modell".
  descriptionHu: text("description_hu"),
  descriptionEn: text("description_en"),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Product line/series, scoped to a category and managed from the category
// admin page, e.g. "HC Design", "Celtic Spas" under Jakuzzik — picked from
// a dropdown on the product form instead of freely typed (avoids typos that
// would silently split the category filter chips).
export const productSeries = pgTable("product_series", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Reusable, globally-managed orderable add-ons (e.g. "Lépcső", "WiFi") —
// edited from the admin sidebar's "Extrák" page, then picked per product
// from that same list instead of retyped each time.
export const extras = pgTable("extras", {
  id: serial("id").primaryKey(),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sku: text("sku"),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  seriesId: integer("series_id").references(() => productSeries.id, {
    onDelete: "set null",
  }),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  // Short line shown under the name on cards, e.g. "6 fő · 220×220 cm".
  subtitleHu: text("subtitle_hu"),
  subtitleEn: text("subtitle_en"),
  // One-line teaser (product list / search results).
  shortDescriptionHu: text("short_description_hu"),
  shortDescriptionEn: text("short_description_en"),
  // Full body copy on the product page.
  descriptionHu: text("description_hu"),
  descriptionEn: text("description_en"),
  // Gross price in HUF. EUR price is derived at render time from the
  // configured exchange rate, unless eurPriceOverride is set.
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }).notNull(),
  eurPriceOverride: numeric("eur_price_override", { precision: 12, scale: 2 }),
  // Products above ORDER_ONLY_THRESHOLD_HUF are order-only (no online
  // payment) — this flag lets it be forced on for a specific product too.
  orderOnly: boolean("order_only").notNull().default(false),
  // Ordered gallery of local file paths (served from /uploads/...).
  images: jsonb("images").$type<string[]>().notNull().default([]),
  // Which entry of `images` is the hero/gallery-first shot.
  mainImage: text("main_image"),
  specs: jsonb("specs")
    .$type<{ label: string; value: string }[]>()
    .notNull()
    .default([]),
  // Optional 3D/AR viewer link (e.g. a Matterport/Sketchfab/AR Quick Look URL).
  threeDArUrl: text("three_d_ar_url"),
  // No-extra-cost configuration choices, e.g. Héj színe / Sarok színe —
  // each group has named choices, each with its own swatch photo.
  variantOptions: jsonb("variant_options")
    .$type<
      {
        nameHu: string;
        nameEn: string;
        choices: { nameHu: string; nameEn: string; imageUrl: string | null }[];
      }[]
    >()
    .notNull()
    .default([]),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Which extras (from the global catalog) a product offers.
export const productExtras = pgTable(
  "product_extras",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    extraId: integer("extra_id")
      .notNull()
      .references(() => extras.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.extraId] })],
);

export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  // Weight/size band this rate applies to, e.g. "small", "large", "custom-quote".
  band: text("band").notNull(),
  priceHuf: numeric("price_huf", { precision: 10, scale: 0 }),
  requiresQuote: boolean("requires_quote").notNull().default(false),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: jsonb("shipping_address").notNull(),
  items: jsonb("items").notNull(),
  totalHuf: numeric("total_huf", { precision: 12, scale: 0 }).notNull(),
  currency: text("currency").notNull().default("HUF"),
  // "order_only" orders skip online payment entirely (> threshold).
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  series: many(productSeries),
}));

export const productSeriesRelations = relations(productSeries, ({ one, many }) => ({
  category: one(categories, {
    fields: [productSeries.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const extrasRelations = relations(extras, ({ many }) => ({
  products: many(productExtras),
}));

export const productExtrasRelations = relations(productExtras, ({ one }) => ({
  product: one(products, {
    fields: [productExtras.productId],
    references: [products.id],
  }),
  extra: one(extras, {
    fields: [productExtras.extraId],
    references: [extras.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  series: one(productSeries, {
    fields: [products.seriesId],
    references: [productSeries.id],
  }),
  extras: many(productExtras),
}));

export type Category = typeof categories.$inferSelect;
export type ProductSeries = typeof productSeries.$inferSelect;
export type Extra = typeof extras.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type Order = typeof orders.$inferSelect;
