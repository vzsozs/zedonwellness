"use client";

import { useActionState, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { useActionError } from "@/components/admin/use-action-error";
import {
  updateExchangeRate,
  fetchExchangeRateFromMnb,
  type ExchangeRateState,
} from "./actions";

export function ExchangeRateForm({ currentRate }: { currentRate: number }) {
  const [state, formAction, pending] = useActionState(
    updateExchangeRate,
    initialActionState as ExchangeRateState,
  );
  const actionError = useActionError(state);
  const [saved, setSaved] = useState(false);
  const [rate, setRate] = useState(String(currentRate));
  const [mnbPending, startMnbFetch] = useTransition();
  const [mnbError, setMnbError] = useState<string | null>(null);
  const [mnbSuccess, setMnbSuccess] = useState(false);


  function handleMnbFetch() {
    setMnbError(null);
    setMnbSuccess(false);
    startMnbFetch(async () => {
      const result = await fetchExchangeRateFromMnb();
      if (result.error) {
        setMnbError(result.error);
      } else if (result.rate) {
        setRate(String(result.rate));
        setMnbSuccess(true);
      }
    });
  }

  return (
    <div className="max-w-md border border-line bg-white p-6">
      <ErrorModal
        message={actionError.message}
        onClose={actionError.dismiss}
      />
      <h2 className="mb-2 text-base font-semibold">EUR / HUF árfolyam</h2>
      <p className="mb-5 text-sm text-muted">
        Ezt az árfolyamot használja a rendszer, amikor egy euróban megadott
        árat (pl. extrák, termékek) forintra vált — a számított forint érték
        mindig a legközelebbi 10 Ft-ra kerekítve kerül tárolásra.
      </p>
      <p className="mb-5 border-l-[3px] border-accent bg-accent-soft px-4 py-3 text-[13px] text-ink">
        Mentéskor a rendszer <strong>minden</strong> euróban megadott árat
        újraszámol az új árfolyammal (termékek, extrák, hozzávalók). Azok a
        termékek, amiknél a forint ár kézzel, lakat feloldásával lett beírva,
        változatlanok maradnak.
      </p>

      <button
        type="button"
        onClick={handleMnbFetch}
        disabled={mnbPending}
        className="mb-4 flex items-center gap-2 border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-ink disabled:opacity-50"
      >
        <RefreshCw className={`size-4 ${mnbPending ? "animate-spin" : ""}`} strokeWidth={1.8} />
        {mnbPending ? "Lekérdezés…" : "Frissítés az MNB középárfolyamával"}
      </button>
      {mnbError ? (
        <p className="mb-4 text-sm text-red-600">
          {mnbError} Add meg kézzel az árfolyamot a mező alatti gombbal.
        </p>
      ) : null}
      {mnbSuccess ? (
        <p className="mb-4 text-sm text-accent">
          Lekérve az MNB középárfolyama — a <strong>Mentés</strong> gombbal lép életbe
          és számolja újra a katalógus árait.
        </p>
      ) : null}

      <form action={formAction} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            1 EUR = ? HUF
          </label>
          <input
            type="number"
            name="eurHufRate"
            step="0.01"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setSaved(false);
            }}
            required
            className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          onClick={() => setSaved(true)}
          className="bg-ink px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </form>
      {saved && !pending && !state.error ? (
        <p className="mt-3 text-sm text-accent">
          Elmentve.
          {state.repriced
            ? ` Újraszámolva: ${state.repriced.products} termék, ${state.repriced.extras} extra, ${state.repriced.features} hozzávaló.`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
