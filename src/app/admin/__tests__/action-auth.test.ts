import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Server Actions are public HTTP endpoints addressed by an action id — the
 * `(protected)` layout's redirect only guards *page rendering* and never
 * runs for them. Every admin action must therefore check the session
 * itself.
 *
 * This suite asserts that with no session, each action refuses and the
 * database is never touched.
 */

const session = vi.hoisted(() => ({ value: null as unknown }));
const dbCalls = vi.hoisted(() => ({ writes: [] as string[] }));

vi.mock("@/auth", () => ({ auth: async () => session.value }));

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({ redirect: () => {}, notFound: () => {} }));

// Any DB access at all is a failure here — the guard must come first.
function trap(name: string) {
  return (...args: unknown[]) => {
    void args;
    dbCalls.writes.push(name);
    throw new Error(`database touched (${name}) despite no session`);
  };
}

vi.mock("@/db", () => ({
  db: {
    insert: trap("insert"),
    update: trap("update"),
    delete: trap("delete"),
    transaction: trap("transaction"),
    select: trap("select"),
    execute: trap("execute"),
    query: new Proxy({}, { get: () => new Proxy({}, { get: () => trap("query") }) }),
  },
}));

const products = await import("@/app/admin/(protected)/products/actions");
const categories = await import("@/app/admin/(protected)/categories/actions");
const series = await import("@/app/admin/(protected)/categories/series-actions");
const extras = await import("@/app/admin/(protected)/extras/actions");
const features = await import("@/app/admin/(protected)/hozzavalok/actions");
const shipping = await import("@/app/admin/(protected)/shipping/actions");
const settings = await import("@/app/admin/(protected)/settings/actions");
const orders = await import("@/app/admin/(protected)/orders/actions");

beforeEach(() => {
  session.value = null;
  dbCalls.writes = [];
});

type ActionState = { error?: string };

/** Actions taking (prevState, formData). */
const formActions: [string, (s: ActionState, f: FormData) => Promise<ActionState>][] = [
  ["createProduct", products.createProduct],
  ["createCategory", categories.createCategory],
  ["createSeries", series.createSeries],
  ["createExtra", extras.createExtra],
  ["createGroup", features.createGroup],
  ["createFeature", features.createFeature],
  ["createShippingRate", shipping.createShippingRate],
  ["updateExchangeRate", settings.updateExchangeRate],
];

/** Actions taking (id, prevState, formData). */
const idFormActions: [
  string,
  (id: number, s: ActionState, f: FormData) => Promise<ActionState>,
][] = [
  ["updateProduct", products.updateProduct],
  ["updateCategory", categories.updateCategory],
  ["updateExtra", extras.updateExtra],
  ["updateFeature", features.updateFeature],
  ["updateOrderStatus", orders.updateOrderStatus],
];

/** Delete actions taking just an id. */
const deleteActions: [string, (id: number) => Promise<ActionState>][] = [
  ["deleteProduct", products.deleteProduct],
  ["deleteCategory", categories.deleteCategory],
  ["deleteSeries", series.deleteSeries],
  ["deleteExtra", extras.deleteExtra],
  ["deleteGroup", features.deleteGroup],
  ["deleteFeature", features.deleteFeature],
  ["deleteShippingRate", shipping.deleteShippingRate],
];

describe("admin server actions without a session", () => {
  it.each(formActions)("%s refuses", async (_name, action) => {
    const result = await action({}, new FormData());
    expect(result.error).toMatch(/jogosultság/i);
    expect(dbCalls.writes).toEqual([]);
  });

  it.each(idFormActions)("%s refuses", async (_name, action) => {
    const result = await action(1, {}, new FormData());
    expect(result.error).toMatch(/jogosultság/i);
    expect(dbCalls.writes).toEqual([]);
  });

  it.each(deleteActions)("%s refuses", async (_name, action) => {
    const result = await action(1);
    expect(result.error).toMatch(/jogosultság/i);
    expect(dbCalls.writes).toEqual([]);
  });

  it("the CSV import refuses", async () => {
    const importer = await import("@/app/admin/(protected)/products/import/actions");
    const result = await importer.importProductsCsv({}, new FormData());
    expect(result.error).toMatch(/jogosultság/i);
    expect(dbCalls.writes).toEqual([]);
  });

  it("the MNB rate fetch refuses", async () => {
    const result = await settings.fetchExchangeRateFromMnb();
    expect(result.error).toMatch(/jogosultság/i);
  });

  it("the orphan-upload scan and delete refuse", async () => {
    expect((await settings.scanOrphanUploads()).error).toMatch(/jogosultság/i);
    expect((await settings.removeOrphanUploads(["/uploads/x.webp"])).error).toMatch(
      /jogosultság/i,
    );
  });
});
