import { db } from "@/db";
import { extras } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getEurHufRate } from "@/lib/settings";
import { ExtraCard } from "./extra-card";
import { NewExtraForm } from "./new-extra-form";

export default async function ExtrasPage() {
  const [items, eurHufRate] = await Promise.all([
    db.query.extras.findMany({
      orderBy: [asc(extras.sortOrder), asc(extras.nameHu)],
    }),
    getEurHufRate(),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Extrák</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted">
        Ez a rendelhető extrák globális katalógusa (pl. Lépcső, WiFi, Audio
        rendszer) — a termék szerkesztésénél innen lehet kiválasztani, mely
        extrák érhetők el az adott terméknél. Kártyaként jelennek meg a
        főoldalon is. Az árat euróban add meg — az aktuális{" "}
        <span className="font-semibold text-ink">{eurHufRate} Ft/EUR</span>{" "}
        árfolyamon (Beállítások) számolt forint érték a rendszer minden más
        pontján ez alapján jelenik meg.
      </p>

      <div className="mb-12 grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {items.map((e) => (
          <ExtraCard key={e.id} extra={e} eurHufRate={eurHufRate} />
        ))}
      </div>

      <NewExtraForm eurHufRate={eurHufRate} />
    </div>
  );
}
