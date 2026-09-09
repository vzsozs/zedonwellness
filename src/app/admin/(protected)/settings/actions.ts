"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setEurHufRate } from "@/lib/settings";
import { fetchMnbEurHufRate } from "@/lib/mnb";
import { repriceCatalog, type RepriceResult } from "@/lib/reprice";
import { deleteOrphanUploads, findOrphanUploads, type OrphanFile } from "@/lib/uploads-gc";
import { requireAdmin } from "@/lib/require-admin";
import { type ActionState, toActionError } from "@/lib/action-state";

const schema = z.object({
  eurHufRate: z.coerce
    .number()
    .positive("Az árfolyamnak pozitív számnak kell lennie.")
    .max(10_000, "Ez az árfolyam nem tűnik reálisnak — ellenőrizd az értéket."),
});

export type ExchangeRateState = ActionState & {
  /** How many rows were re-priced, so the admin can see it actually happened. */
  repriced?: RepriceResult;
  rate?: number;
};

function revalidatePriceSurfaces() {
  revalidatePath("/admin/settings");
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
  revalidatePath("/admin/hozzavalok");
  revalidatePath("/", "layout");
}

/**
 * Saves a new EUR/HUF rate *and* re-prices everything derived from it.
 *
 * These two steps belong together: storing the rate alone used to leave the
 * catalogue priced at the old one.
 */
export async function updateExchangeRate(
  _prevState: ExchangeRateState,
  formData: FormData,
): Promise<ExchangeRateState> {
  try {
    await requireAdmin();
    const { eurHufRate } = schema.parse({ eurHufRate: formData.get("eurHufRate") });
    await setEurHufRate(eurHufRate);
    const repriced = await repriceCatalog(eurHufRate);
    revalidatePriceSurfaces();
    return { repriced, rate: eurHufRate };
  } catch (err) {
    return toActionError(err);
  }
}

export type MnbFetchState = { error?: string; rate?: number };

/** Fetches the MNB middle rate. Only reads it — the admin still confirms
 * with Save, which is what applies it to the catalogue. */
export async function fetchExchangeRateFromMnb(): Promise<MnbFetchState> {
  try {
    await requireAdmin();
    return { rate: await fetchMnbEurHufRate() };
  } catch (err) {
    return toActionError(err);
  }
}


export type OrphanScanState = ActionState & {
  scanned?: boolean;
  orphans?: OrphanFile[];
  deleted?: { deleted: number; freedBytes: number };
};

/** Lists uploaded files nothing in the database references any more. */
export async function scanOrphanUploads(): Promise<OrphanScanState> {
  try {
    await requireAdmin();
    return { scanned: true, orphans: await findOrphanUploads() };
  } catch (err) {
    return toActionError(err);
  }
}

/** Deletes the listed orphans (each one re-checked against the database
 * first, in case something started using it since the scan). */
export async function removeOrphanUploads(urls: string[]): Promise<OrphanScanState> {
  try {
    await requireAdmin();
    const deleted = await deleteOrphanUploads(urls);
    return { scanned: true, deleted, orphans: await findOrphanUploads() };
  } catch (err) {
    return toActionError(err);
  }
}
