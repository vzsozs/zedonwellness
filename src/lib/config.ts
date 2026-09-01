// Above this gross total (HUF), online payment is disabled and only an
// order request can be submitted (see FEJLESZTESINAPLO.md).
export const ORDER_ONLY_THRESHOLD_HUF = Number(
  process.env.ORDER_ONLY_THRESHOLD_HUF ?? 1_000_000,
);

export function isOrderOnly(priceHuf: number, orderOnlyFlag = false) {
  return orderOnlyFlag || priceHuf > ORDER_ONLY_THRESHOLD_HUF;
}

export function formatHuf(amount: number | string) {
  return `${Number(amount).toLocaleString("hu-HU")} Ft`;
}
