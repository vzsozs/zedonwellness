import type { Extra } from "@/db/schema";
import { ExtraCard } from "./extra-card";
import { NewExtraForm } from "./new-extra-form";

export function ExtrasPane({ extras, eurHufRate }: { extras: Extra[]; eurHufRate: number }) {
  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Ez a rendelhető extrák globális katalógusa (pl. Lépcső, WiFi, Audio
        rendszer) — a termék szerkesztésénél innen lehet kiválasztani, mely
        extrák érhetők el az adott terméknél. Kártyaként jelennek meg a
        főoldalon is. Az árat euróban add meg — az aktuális{" "}
        <span className="font-semibold text-ink">{eurHufRate} Ft/EUR</span>{" "}
        árfolyamon (Beállítások) számolt forint érték a rendszer minden más
        pontján ez alapján jelenik meg.
      </p>

      <div className="mb-8 grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {extras.map((e) => (
          <ExtraCard key={e.id} extra={e} eurHufRate={eurHufRate} />
        ))}
      </div>

      <NewExtraForm eurHufRate={eurHufRate} />
    </div>
  );
}
