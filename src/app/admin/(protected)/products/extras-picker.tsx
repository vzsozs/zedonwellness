import Link from "next/link";
import type { Extra } from "@/db/schema";
import { formatHuf } from "@/lib/config";

export function ExtrasPicker({
  allExtras,
  selectedIds,
}: {
  allExtras: Extra[];
  selectedIds: number[];
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-semibold text-muted">
          Rendelhető extrák
        </label>
        <Link
          href="/admin/extras"
          className="text-xs font-semibold text-accent hover:text-accent-dark"
        >
          Extrák szerkesztése →
        </Link>
      </div>

      {allExtras.length === 0 ? (
        <p className="border border-line px-3.5 py-3 text-sm text-muted">
          Még nincs egyetlen extra sem felvéve.{" "}
          <Link href="/admin/extras" className="text-accent hover:text-accent-dark">
            Vegyél fel egyet itt
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 border border-line p-3.5">
          {allExtras.map((extra) => (
            <label key={extra.id} className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                name="extraIds"
                value={extra.id}
                defaultChecked={selectedIds.includes(extra.id)}
                className="accent-accent"
              />
              <span className="min-w-0 flex-1 truncate">{extra.nameHu}</span>
              <span className="shrink-0 text-muted">{formatHuf(extra.priceHuf)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
