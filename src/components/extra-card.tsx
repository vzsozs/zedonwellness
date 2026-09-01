import type { Extra } from "@/db/schema";
import { formatHuf } from "@/lib/config";

export function ExtraCard({ name, extra }: { name: string; extra: Extra }) {
  return (
    <div className="overflow-hidden border border-line">
      <div className="h-40 w-full overflow-hidden bg-paper-muted">
        {extra.imageUrl ? (
          <img src={extra.imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold">{name}</h3>
        <div className="mt-2 text-lg font-extrabold text-accent">
          {formatHuf(extra.priceHuf)}
        </div>
      </div>
    </div>
  );
}
