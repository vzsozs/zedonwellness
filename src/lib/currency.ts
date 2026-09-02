/** Rounds to the nearest 10 Ft — applied everywhere a HUF amount is
 * computed from a EUR source value (e.g. 189 432,21 → 189 430). */
export function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

export function eurToHuf(eur: number, rate: number): number {
  return roundToTen(eur * rate);
}

export function hufToEur(huf: number, rate: number): number {
  return huf / rate;
}

export function formatEur(eur: number): string {
  return `${eur.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}
