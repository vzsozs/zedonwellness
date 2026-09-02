/** Rounds to the nearest 10 Ft — applied everywhere a HUF amount is
 * computed from a EUR source value (e.g. 189 432,21 → 189 430). */
export function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

export function eurToHuf(eur: number, rate: number): number {
  return roundToTen(eur * rate);
}
