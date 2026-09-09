import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Felhasználási feltételek",
  description:
    "A Zedonwellness webáruház felhasználási feltételei: megrendelés, szállítási díjak, beüzemelés, fizetés, elállás.",
};

/** Delivery charges as published in the live terms — flat per product
 * category, not the weight-banded GLS rates the checkout currently
 * calculates. See the note in the shipping section. */
const SHIPPING_ROWS: [string, string][] = [
  ["Vegyszer, vegyszercsomag, szűrőbetét", "3 900 Ft"],
  ["Szauna, 1–2 személyes", "60 000 Ft"],
  ["Szauna, 3 személyes", "60 000 Ft"],
  ["Szauna, 4–6 személyes", "90 000 Ft"],
  ["Jakuzzi, 100 km-ig", "120 000 Ft"],
  ["Jakuzzi, 100–200 km", "150 000 Ft"],
  ["Jakuzzi, 200 km felett", "200 000 Ft"],
  ["Swim spa", "250 000 Ft"],
  ["Úszómedence", "350 Ft / km"],
  ["Hordószauna", "Helyszín ismerete után, egyedi ajánlat alapján"],
];

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <LegalPage title="Felhasználási feltételek" updatedAt={COMPANY.legal.revisedAt}>
      <p className="text-sm leading-relaxed text-muted">
        A vevő kijelenti, hogy a www.zedonwellness.com honlapon található internetes
        áruház használata előtt megismerte és elfogadta az alábbi feltételeket.
      </p>

      <LegalSection title="1. A szolgáltató">
        <p className="text-sm text-muted">
          {COMPANY.legal.legalName}, székhely: {COMPANY.legal.address}, adószám:{" "}
          {COMPANY.legal.taxNumber}, önállóan képviseli:{" "}
          {COMPANY.legal.representative}. További adatok az{" "}
          <Link href="/impresszum" className="text-accent underline">
            Impresszumban
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Termékinformációk">
        <p className="text-sm leading-relaxed text-muted">
          Az internetes áruházban szereplő termékekkel kapcsolatos árakra és technikai
          adatokra vonatkozó információk tájékoztató jellegűek, a{" "}
          {COMPANY.legal.legalName} a változtatás jogát fenntartja. A feltüntetett árak
          bruttó árak, azaz {COMPANY.legal.vatRate} áfát tartalmaznak.
        </p>
      </LegalSection>

      <LegalSection title="3. Megrendelés">
        <p className="text-sm leading-relaxed text-muted">
          A vásárló az internetes áruház megrendelési űrlapjának kitöltésével és
          elküldésével megrendeli az általa megadott árut. A {COMPANY.legal.legalName} a
          megrendelést e-mailben vagy telefonon igazolja vissza, és tájékoztatja a
          vásárlót a fizetési feltételekről, a kiszállítás módjáról, időpontjáról és
          annak díjáról.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A termékek ellenértékének minimum 50%-át előlegként kell befizetni. A
          {" "}{COMPANY.legal.legalName} a rendeléseket akkor tekinti érvényesnek, amikor
          az előleg a bankszámlájára beérkezik.
        </p>
      </LegalSection>

      <LegalSection title="4. Szállítási díjak">
        <p className="text-sm leading-relaxed text-muted">
          A csomagok átvételére a rendelésben megadott címzett, vagy az azonos címre
          bejelentett házastársa, rokona, illetve meghatalmazással rendelkező személy
          jogosult. Személyes átvétel GLS-sel vagy egyeztetés alapján lehetséges.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <tbody className="text-muted">
              {SHIPPING_ROWS.map(([label, price]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-4">{label}</td>
                  <td className="py-2.5 text-right font-semibold whitespace-nowrap text-ink">
                    {price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="5. Termékek beüzemelése">
        <p className="text-sm leading-relaxed text-muted">
          Termékeinkhez szakszervizünk általi beüzemelés választható.
        </p>
        <h3 className="mt-5 mb-2 text-sm font-bold">
          A masszázsmedence beüzemelési díja tartalmazza
        </h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
          <li>a medence kicsomagolását,</li>
          <li>az elektromos hálózatra való szabványos bekötést,</li>
          <li>a vízzel való feltöltést,</li>
          <li>a tömítések, csatlakozások, ragasztások ellenőrzését,</li>
          <li>a medence kipróbálását és átadását,</li>
          <li>rövid vízkezelési és használati oktatást,</li>
          <li>
            <strong className="text-ink">3 éves teljes körű garanciát.</strong>
          </li>
        </ul>
        <h3 className="mt-5 mb-2 text-sm font-bold">
          A szauna beüzemelési díja tartalmazza
        </h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
          <li>a lapra szerelt termék összeszerelését,</li>
          <li>az elektromos hálózatra való szabványos bekötést,</li>
          <li>
            <strong className="text-ink">2 éves teljes körű garanciát.</strong>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Fizetési feltételek">
        <p className="text-sm leading-relaxed text-muted">
          A vevő a megrendelés ellenértékét és a szállítási díjat az alábbi módokon
          fizetheti meg. Megrendeléskor 50% előleg fizetendő (készpénzben a
          telephelyen vagy átutalással), a fennmaradó összeg pedig:
        </p>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
          <li>
            a szállítmány átvételekor a sofőrnek készpénzben (utánvét) — cég esetén,
            illetve 1 500 000 Ft-nál magasabb összegnél ez nem érvényesíthető,
          </li>
          <li>a küldemény átvételekor a postásnak készpénzben (postai utánvét),</li>
          <li>
            a {COMPANY.legal.legalName} bankszámlájára történő előzetes
            készpénzbefizetéssel vagy átutalással — ekkor a szállítás a fizetés
            teljesítését követően történik.
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          Az előleg összege a végösszegből levonásra kerül. Online bankkártyás fizetés
          jelenleg nem érhető el.
        </p>
      </LegalSection>

      <LegalSection title="7. Elállási jog">
        <p className="text-sm leading-relaxed text-muted">
          A fogyasztót az uniós fogyasztóvédelmi szabályok alapján a termék átvételétől
          számított <strong className="text-ink">14 napon belül</strong> indokolás
          nélküli elállási jog illeti meg. Az elállási szándékot a{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-accent underline">
            {COMPANY.email}
          </a>{" "}
          címen kell jelezni. A terméket a vásárló saját költségén küldi vissza; a
          vételárat az elállás beérkezésétől számított 14 napon belül visszatérítjük.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Az elállási jog nem gyakorolható egyedi igény alapján, a vásárló utasítása
          szerint gyártott vagy egyedileg konfigurált termékek esetén.
        </p>
      </LegalSection>

      <LegalSection title="8. Panaszkezelés és jogorvoslat">
        <p className="text-sm leading-relaxed text-muted">
          Panaszát a fenti elérhetőségeken jelezheti. Amennyiben a panaszkezelés nem
          vezet eredményre, a fogyasztó a lakóhelye szerint illetékes fogyasztóvédelmi
          fórumhoz fordulhat. Határon átnyúló vásárlás esetén az Európai Fogyasztói
          Központ, illetve az online vitarendezési platform vehető igénybe:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Adatkezelés">
        <p className="text-sm text-muted">
          A megrendeléssel kapcsolatos adatkezelésről az{" "}
          <Link href="/adatvedelem" className="text-accent underline">
            Adatvédelmi nyilatkozatban
          </Link>{" "}
          olvashat.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
