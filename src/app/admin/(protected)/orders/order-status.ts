/**
 * Order lifecycle.
 *
 * Deliberately not in the actions file: a "use server" module may only
 * export async functions, so a plain array/record there fails the build
 * with "A 'use server' file can only export async functions, found object".
 *
 * Kept in TypeScript rather than as a Postgres enum so adding a step
 * doesn't need a migration.
 */
export const ORDER_STATUSES = [
  "pending",
  "order_only",
  "confirmed",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Új rendelés",
  order_only: "Megrendelés (nincs online fizetés)",
  confirmed: "Visszaigazolva",
  shipped: "Kiszállítva",
  completed: "Teljesítve",
  cancelled: "Lemondva",
};
