import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
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
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  nameHu: text("name_hu").notNull(),
  nameEn: text("name_en"),
  descriptionHu: text("description_hu"),
  descriptionEn: text("description_en"),
  // Gross price in HUF. EUR price is derived at render time from the
  // configured exchange rate, unless eurPriceOverride is set.
  priceHuf: numeric("price_huf", { precision: 12, scale: 0 }).notNull(),
  eurPriceOverride: numeric("eur_price_override", { precision: 12, scale: 2 }),
  // Products above ORDER_ONLY_THRESHOLD_HUF are order-only (no online
  // payment) — this flag lets it be forced on for a specific product too.
  orderOnly: boolean("order_only").notNull().default(false),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type Order = typeof orders.$inferSelect;
