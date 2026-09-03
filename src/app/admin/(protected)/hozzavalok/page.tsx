import { asc } from "drizzle-orm";
import { db } from "@/db";
import { productFeatureGroups, productFeatures, extras } from "@/db/schema";
import { getEurHufRate } from "@/lib/settings";
import { HozzavalokTabs } from "./hozzavalok-tabs";
import { NewGroupForm } from "./new-group-form";

export default async function HozzavalokPage() {
  const [groups, extraList, eurHufRate] = await Promise.all([
    db.query.productFeatureGroups.findMany({
      orderBy: [asc(productFeatureGroups.sortOrder), asc(productFeatureGroups.nameHu)],
      with: {
        features: {
          orderBy: [asc(productFeatures.sortOrder), asc(productFeatures.nameHu)],
        },
      },
    }),
    db.query.extras.findMany({ orderBy: [asc(extras.sortOrder)] }),
    getEurHufRate(),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Termék hozzávalók</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        A "Jakuzzi extrák" lap a rendelhető (ár szerinti) extrák katalógusa,
        a többi lap ikonos, informatív jellemző-csoport (pl. egy szaunánál:
        van kályha, van lámpa, van szaunaszett) — a termék szerkesztésénél
        innen lehet kiválasztani, mi jelenjen meg az adott terméken.
      </p>

      <div className="mb-6">
        <NewGroupForm />
      </div>

      <HozzavalokTabs groups={groups} extras={extraList} eurHufRate={eurHufRate} />
    </div>
  );
}
