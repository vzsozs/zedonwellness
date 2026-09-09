"use client";

import { useActionState, useState } from "react";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { useActionError } from "@/components/admin/use-action-error";
import { updateOrderStatus } from "../actions";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "../order-status";

export function StatusForm({ orderId, current }: { orderId: number; current: OrderStatus }) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatus.bind(null, orderId),
    initialActionState,
  );
  const actionError = useActionError(state);
  const [saved, setSaved] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <ErrorModal message={actionError.message} onClose={actionError.dismiss} />
      <select
        name="status"
        defaultValue={current}
        onChange={() => setSaved(false)}
        className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        onClick={() => setSaved(true)}
        className="bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Mentés…" : "Állapot mentése"}
      </button>
      {saved && !pending && !state.error ? (
        <p className="text-sm text-accent">Elmentve.</p>
      ) : null}
    </form>
  );
}
