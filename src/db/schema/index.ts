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
  // Entered in EUR going forward (see `settings` for the conversion rate);
  // priceHuf is still stored alongside it — computed at save time — so
  // every existing HUF-only display keeps working unchanged.
  priceEur: numeric("price_eur", { precision: 10, scale: 2 }),
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }).notNull(),
  // Shown as a card image on the homepage extras section.
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Small global key/value store for admin-editable site settings (e.g. the
// EUR/HUF conversion rate) that don't warrant their own dedicated table.
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
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
  // Prices are entered in EUR going forward (see `settings` for the
  // conversion rate) — priceHuf is computed and stored at save time,
  // rounded to the nearest 10 Ft, unless priceHufManual is set (the admin
  // unlocked the HUF field and typed a specific value directly).
  priceEur: numeric("price_eur", { precision: 10, scale: 2 }),
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }).notNull(),
  priceHufManual: boolean("price_huf_manual").notNull().default(false),
  // Seat/person count, e.g. for jacuzzis and saunas — kept structured (not
  // parsed from subtitleHu) so it can drive the category page's filter.
  capacity: integer("capacity"),
  // Shipping weight in kg — drives which GLS weight-band rate applies at
  // checkout. Packaging weight, not just the item itself.
  weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
  // Products above ORDER_ONLY_THRESHOLD_HUF are order-only (no online
  // payment) — this flag lets it be forced on for a specific product too.
  orderOnly: boolean("order_only").notNull().default(false),
  // Ordered gallery of local file paths (served from /uploads/...).
  images: jsonb("images").$type<string[]>().notNull().default([]),
  // Which entry of `images` is the hero/gallery-first shot.
  mainImage: text("main_image"),
  // Which entry of `images` is shown on product listing cards. Falls back
  // to mainImage when unset.
  cardImage: text("card_image"),
  // `type: "boolean"` rows render as a green check / red X instead of free
  // text (value is then literally "true"/"false").
  specs: jsonb("specs")
    .$type<{ label: string; value: string; type?: "text" | "boolean" }[]>()
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
  // Downloadable PDFs (spec sheet, assembly guide, ...), each with its own
  // admin-entered label — an open list, not fixed slots.
  documents: jsonb("documents")
    .$type<{ label: string; url: string }[]>()
    .notNull()
    .default([]),
  // "Hamarosan" / call-for-price products: no real priceHuf yet. When set,
  // the storefront shows a call-for-price note instead of the price and
  // skips add-to-cart — priceHuf is still populated (defaults to "0") only
  // to satisfy the column's NOT NULL constraint, never displayed.
  priceOnRequest: boolean("price_on_request").notNull().default(false),
  // Where the Specifikáció block renders on the product page — "auto"
  // follows the category default (right for grillek, left elsewhere),
  // "left"/"right" force it regardless of category.
  specsPosition: text("specs_position", { enum: ["auto", "left", "right"] })
    .notNull()
    .default("auto"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// True SKU-level variants (e.g. 12 fragrances of the same bottle) — unlike
// variantOptions above, each one carries its own price/SKU/weight/image and
// is a separately orderable thing, not just a cosmetic swatch. Shared
// content (description, specs, category…) stays on the parent product;
// only the fields that legitimately differ per SKU live here.
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  sku: text("sku"),
  // Null falls back to the parent product's priceHuf/weightKg — most
  // variants (e.g. same-priced fragrances) don't need an override.
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }),
  weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
  imageUrl: text("image_url"),
  isDefault: boolean("is_default").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
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

// "Termék hozzávalók" (product features/ingredients) — small icon+label
// badges shown on a product page (e.g. a sauna's "van kályha / van lámpa /
// van szaunaszett" row), grouped into admin-managed tabs (e.g. "Szauna
// jellemzők"). Distinct from `extras`: features aren't purchasable add-ons,
// just informational badges.
export const productFeatureGroups = pgTable("product_feature_groups", {
  id: serial("id").primaryKey(),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productFeatures = pgTable("product_features", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => productFeatureGroups.id, { onDelete: "cascade" }),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  iconUrl: text("icon_url"),
  // Optional, same convention as `extras` — blank means "included/no extra
  // charge", not "free" as a real price point.
  priceEur: numeric("price_eur", { precision: 10, scale: 2 }),
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Which features a product has.
export const productFeatureLinks = pgTable(
  "product_feature_links",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    featureId: integer("feature_id")
      .notNull()
      .references(() => productFeatures.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.featureId] })],
);

// GLS-only shipping, priced by weight band within one of two zones. A band
// with maxKg = null is open-ended (e.g. "40 kg felett") — such bands are
// expected to have requiresQuote = true rather than a fixed priceHuf.
export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  zone: text("zone", { enum: ["domestic", "international"] }).notNull(),
  minKg: numeric("min_kg", { precision: 6, scale: 2 }).notNull().default("0"),
  maxKg: numeric("max_kg", { precision: 6, scale: 2 }),
  priceHuf: numeric("price_huf", { precision: 10, scale: 0 }),
  requiresQuote: boolean("requires_quote").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: jsonb("shipping_address")
    .$type<{
      zone: "domestic" | "international";
      country: string;
      zip: string;
      city: string;
      street: string;
      note: string | null;
      shippingHuf: number | null;
      shippingRequiresQuote: boolean;
    }>()
    .notNull(),
  items: jsonb("items")
    .$type<
      {
        productId: number;
        variantId: number | null;
        slug: string;
        nameHu: string;
        priceHuf: number;
        quantity: number;
        weightKg: number | null;
      }[]
    >()
    .notNull(),
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
  variants: many(productVariants),
  features: many(productFeatureLinks),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productFeatureGroupsRelations = relations(productFeatureGroups, ({ many }) => ({
  features: many(productFeatures),
}));

export const productFeaturesRelations = relations(productFeatures, ({ one, many }) => ({
  group: one(productFeatureGroups, {
    fields: [productFeatures.groupId],
    references: [productFeatureGroups.id],
  }),
  products: many(productFeatureLinks),
}));

export const productFeatureLinksRelations = relations(productFeatureLinks, ({ one }) => ({
  product: one(products, {
    fields: [productFeatureLinks.productId],
    references: [products.id],
  }),
  feature: one(productFeatures, {
    fields: [productFeatureLinks.featureId],
    references: [productFeatures.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type ProductSeries = typeof productSeries.$inferSelect;
export type Extra = typeof extras.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductFeatureGroup = typeof productFeatureGroups.$inferSelect;
export type ProductFeature = typeof productFeatures.$inferSelect;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type Order = typeof orders.$inferSelect;
