// Shared column contract between the CSV export route and the CSV import
// action — column order/names must match so a re-imported export round-trips.
//
// Deliberately flat/scalar fields only: rich descriptions, specs, gallery
// images, variant options and SKU variants stay in the product edit form —
// they don't fit a spreadsheet row well and bulk-editing them by CSV would
// be more error-prone than useful.
export const CSV_COLUMNS = [
  "id",
  "szlug",
  "cikkszam",
  "kategoria",
  "sorozat",
  "nev_hu",
  "nev_en",
  "alcim_hu",
  "alcim_en",
  "rovid_leiras_hu",
  "rovid_leiras_en",
  "ar_eur",
  "ar_huf",
  "ar_huf_manualis",
  "ferohely",
  "suly_kg",
  "csak_megrendelheto",
  "keszleten",
  "kiemelt",
  "uj",
  "akcio",
  "ar_3d",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

export function boolToCsv(v: boolean): string {
  return v ? "igen" : "nem";
}

export function csvToBool(v: string | undefined): boolean {
  const s = (v ?? "").trim().toLowerCase();
  return s === "igen" || s === "true" || s === "1" || s === "x" || s === "yes";
}
