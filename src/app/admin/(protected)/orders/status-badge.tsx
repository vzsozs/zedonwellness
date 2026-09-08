import { ORDER_STATUS_LABELS, type OrderStatus } from "./order-status";

const TONES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  order_only: "bg-sky-100 text-sky-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  shipped: "bg-indigo-100 text-indigo-900",
  completed: "bg-neutral-200 text-neutral-800",
  cancelled: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = TONES[status] ?? "bg-neutral-200 text-neutral-800";
  const label = ORDER_STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone}`}>
      {label}
    </span>
  );
}
