import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { isOrderOnly } from "@/lib/config";

/**
 * Single source of truth for "what is actually in this cart, right now".
 *
 * The cart itself lives in localStorage, so everything it remembers (price,
 * name, weight, availability) is a snapshot that may be weeks old. Both the
 * cart/checkout screens and `createOrder` resolve their lines through here,
 * so what the customer sees and what gets ordered can never diverge.
 */

/** Guards against a hand-crafted request ordering an absurd quantity — the
 * resulting total would otherwise overflow orders.total_huf (numeric(12,0)). */
export const MAX_QUANTITY_PER_LINE = 99;

export const cartLineInputSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().nullable(),
  quantity: z.number().int().positive().max(MAX_QUANTITY_PER_LINE),
  /** What the browser's cart believes the unit price is — compared against
   * the DB so a stale cart can be flagged rather than silently re-priced. */
  priceHuf: z.number().nonnegative().optional(),
});

export const cartLinesInputSchema = z.array(cartLineInputSchema).max(50);

export type CartLineInput = z.infer<typeof cartLineInputSchema>;

export type CartIssue =
  /** Product no longer exists (deleted since it was added). */
  | "unavailable"
  /** The chosen SKU variant is gone, or doesn't belong to this product. */
  | "variantUnavailable"
  /** Product or variant is switched off in the admin. */
  | "outOfStock"
  /** "Hamarosan" product — no real price, contact-only. */
  | "priceOnRequest"
  /** Price moved since the item was put in the cart. */
  | "priceChanged";

export type ResolvedCartLine = {
  productId: number;
  variantId: number | null;
  slug: string;
  nameHu: string;
  nameEn: string | null;
  variantNameHu: string | null;
  variantNameEn: string | null;
  image: string | null;
  /** Authoritative unit price from the database. */
  priceHuf: number;
  /** What the browser's cart had, when it differs from `priceHuf`. */
  previousPriceHuf: number | null;
  weightKg: number | null;
  quantity: number;
  orderOnly: boolean;
  issues: CartIssue[];
};

export type ResolvedCart = {
  lines: ResolvedCartLine[];
  /** Lines that can't be ordered at all (missing product/variant, no stock,
   * price on request) — the checkout refuses to submit while any exist. */
  blockingIssues: boolean;
  subtotalHuf: number;
  /** null when any line has no weight set — no automatic shipping quote then. */
  totalWeightKg: number | null;
};

const BLOCKING: ReadonlySet<CartIssue> = new Set<CartIssue>([
  "unavailable",
  "variantUnavailable",
  "outOfStock",
  "priceOnRequest",
]);

export async function resolveCart(items: CartLineInput[]): Promise<ResolvedCart> {
  if (items.length === 0) {
    return { lines: [], blockingIssues: false, subtotalHuf: 0, totalWeightKg: 0 };
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const variantIds = [
    ...new Set(items.map((i) => i.variantId).filter((id): id is number => id !== null)),
  ];

  const [dbProducts, dbVariants] = await Promise.all([
    db.query.products.findMany({ where: inArray(products.id, productIds) }),
    variantIds.length > 0
      ? db.query.productVariants.findMany({ where: inArray(productVariants.id, variantIds) })
      : Promise.resolve([]),
  ]);
  const productById = new Map(dbProducts.map((p) => [p.id, p]));
  const variantById = new Map(dbVariants.map((v) => [v.id, v]));

  const lines = items.map((item): ResolvedCartLine => {
    const product = productById.get(item.productId);

    if (!product) {
      return {
        productId: item.productId,
        variantId: item.variantId,
        slug: "",
        nameHu: "",
        nameEn: null,
        variantNameHu: null,
        variantNameEn: null,
        image: null,
        priceHuf: 0,
        previousPriceHuf: item.priceHuf ?? null,
        weightKg: null,
        quantity: item.quantity,
        orderOnly: false,
        issues: ["unavailable"],
      };
    }

    const issues: CartIssue[] = [];
    const variant = item.variantId !== null ? variantById.get(item.variantId) : undefined;

    // A variant id is only honoured if it actually belongs to this product —
    // otherwise a hand-crafted request could pair an expensive product with
    // a cheap variant's price.
    const variantMatches = variant !== undefined && variant.productId === product.id;
    if (item.variantId !== null && !variantMatches) issues.push("variantUnavailable");

    const effective = variantMatches ? variant : undefined;
    const priceHuf = Number(effective?.priceHuf ?? product.priceHuf);
    const weightRaw = effective?.weightKg ?? product.weightKg;

    if (product.priceOnRequest) issues.push("priceOnRequest");
    if (!product.inStock || (effective && !effective.inStock)) issues.push("outOfStock");
    if (
      item.priceHuf !== undefined &&
      item.priceHuf !== priceHuf &&
      !issues.some((i) => BLOCKING.has(i))
    ) {
      issues.push("priceChanged");
    }

    return {
      productId: product.id,
      variantId: effective?.id ?? null,
      slug: product.slug,
      nameHu: product.nameHu,
      nameEn: product.nameEn,
      variantNameHu: effective?.nameHu ?? null,
      variantNameEn: effective?.nameEn ?? null,
      image: effective?.imageUrl ?? product.cardImage ?? product.mainImage ?? null,
      priceHuf,
      previousPriceHuf:
        item.priceHuf !== undefined && item.priceHuf !== priceHuf ? item.priceHuf : null,
      weightKg: weightRaw !== null ? Number(weightRaw) : null,
      quantity: item.quantity,
      // Evaluated against the *effective* price, so a variant that crosses
      // the threshold is order-only even when the base product isn't.
      orderOnly: isOrderOnly(priceHuf, product.orderOnly),
      issues,
    };
  });

  const subtotalHuf = lines.reduce((sum, l) => sum + l.priceHuf * l.quantity, 0);
  const totalWeightKg = lines.some((l) => l.weightKg === null)
    ? null
    : lines.reduce((sum, l) => sum + (l.weightKg ?? 0) * l.quantity, 0);

  return {
    lines,
    blockingIssues: lines.some((l) => l.issues.some((i) => BLOCKING.has(i))),
    subtotalHuf,
    totalWeightKg,
  };
}
