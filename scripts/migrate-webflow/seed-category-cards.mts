// Egyszeri: a főoldali kategória-kártyák szövegeinek feltöltése a
// redesign mockup (Ideiglenes/webflow_database/Clude) alapján.
//
// A `cardBadge*` a kártya címe fölötti kis felirat, a `description*` a
// kártya (és a kategórialista fejlécének) leíró mondata. Mindkettő
// adminból szerkeszthető — ez a szkript csak a kiindulást tölti be.
import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

import { eq } from "drizzle-orm";
const { db } = await import("../../src/db/index.ts");
const { categories } = await import("../../src/db/schema/index.ts");

const COPY: Record<
  string,
  { badgeHu: string; badgeEn: string; descHu: string; descEn: string }
> = {
  jakuzzik: {
    badgeHu: "HC Design & OKA · 25+ modell",
    badgeEn: "HC Design & OKA · 25+ models",
    descHu:
      "Ergonomikus masszázsmedencék Balboa® vezérléssel és GreenShield szigeteléssel.",
    descEn:
      "Ergonomic hot tubs with Balboa® control systems and GreenShield insulation.",
  },
  szaunak: {
    badgeHu: "Kültéri & beltéri · 26+ modell",
    badgeEn: "Outdoor & indoor · 26+ models",
    descHu:
      "Hordószaunák, egyedi finn, infra és kombinált luxus terek Harvia® kályhákkal.",
    descEn:
      "Barrel saunas plus bespoke Finnish, infrared and combined luxury cabins with Harvia® heaters.",
  },
  grillek: {
    badgeHu: "BULL & ZedonGrill · 18+ típus",
    badgeEn: "BULL & ZedonGrill · 18+ types",
    descHu:
      "Beépíthető professzionális gázgrillek, grillkocsik és fatüzelésű olasz kemencék.",
    descEn:
      "Built-in professional gas grills, grill carts and wood-fired Italian ovens.",
  },
  kiegeszitok: {
    badgeHu: "Aqua Excellent & Hanscraft",
    badgeEn: "Aqua Excellent & Hanscraft",
    descHu:
      "Klórmentes tisztítószerek, illataromák, hőszivattyúk és prémium thermotetők.",
    descEn:
      "Chlorine-free cleaning agents, fragrances, heat pumps and premium thermal covers.",
  },
};

for (const [slug, c] of Object.entries(COPY)) {
  const result = await db
    .update(categories)
    .set({
      cardBadgeHu: c.badgeHu,
      cardBadgeEn: c.badgeEn,
      descriptionHu: c.descHu,
      descriptionEn: c.descEn,
    })
    .where(eq(categories.slug, slug))
    .returning({ slug: categories.slug });

  console.log(result.length ? `  ✓ ${slug}` : `  ⚠ ${slug} — nincs ilyen kategória`);
}
process.exit(0);
