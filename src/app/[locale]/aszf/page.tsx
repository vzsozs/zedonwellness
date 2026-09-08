import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { ORDER_ONLY_THRESHOLD_HUF } from "@/lib/config";
import { formatHuf } from "@/lib/config";
import { LegalPage, LegalSection, Todo } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek",
  description:
    "A Zedonwellness webáruház általános szerződési feltételei: megrendelés, szállítás, elállási jog, jótállás.",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <LegalPage title="Általános Szerződési Feltételek">
      <p className="rounded-none border-l-[3px] border-amber-500 bg-amber-50 px-4.5 py-3.5 text-sm text-amber-900">
        <strong>Jogi ellenőrzésre vár.</strong> Ez a dokumentum a webáruház tényleges
        működése alapján készült vázlat. Élesítés előtt a sárgával jelölt adatokat ki kell
        tölteni, és a teljes szöveget jogásszal jóvá kell hagyatni.
      </p>

      <LegalSection title="1. A szolgáltató">
        <p className="text-sm text-muted">
          Üzemeltető: <Todo>{COMPANY.legal.legalName}</Todo>, székhely:{" "}
          <Todo>{COMPANY.legal.address}</Todo>, adószám:{" "}
          <Todo>{COMPANY.legal.taxNumber}</Todo>. Részletes adatok az{" "}
          <Link href="/impresszum" className="text-accent underline">
            Impresszumban
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. A megrendelés menete">
        <p className="text-sm text-muted">
          A vásárló a kiválasztott terméket a kosárba helyezi, majd a pénztár oldalon
          megadja a szállítási és számlázási adatait. A megrendelés elküldése fizetési
          kötelezettséget keletkeztet. A rendelés beérkezéséről a rendszer automatikus
          visszaigazoló e-mailt küld; ez a visszaigazolás a szerződés létrejöttét jelenti.
        </p>
        <p className="mt-3 text-sm text-muted">
          Online bankkártyás fizetés jelenleg nem érhető el. A fizetés módjáról (átutalás,
          személyes átvétel) munkatársunk a rendelés után egyeztet a vásárlóval.
        </p>
      </LegalSection>

      <LegalSection title="3. Árak">
        <p className="text-sm text-muted">
          Az árak forintban értendők és tartalmazzák az áfát. Az oldalon feltüntetett euró
          árak tájékoztató jellegűek. A{" "}
          <strong>{formatHuf(ORDER_ONLY_THRESHOLD_HUF)}</strong> feletti bruttó értékű
          rendelések esetén online fizetés nem adható le, ilyenkor a rendelés
          megrendelésként rögzül, és a fizetés módjáról egyedileg egyeztetünk.
        </p>
        <p className="mt-3 text-sm text-muted">
          Az &bdquo;Ár érdeklődésre&rdquo; jelöléssel ellátott termékek esetén a
          weboldalon keresztül nem adható le rendelés — ezekre egyedi árajánlatot adunk.
        </p>
      </LegalSection>

      <LegalSection title="4. Szállítás">
        <p className="text-sm text-muted">
          A kiszállítást GLS futárszolgálat végzi, bel- és külföldre egyaránt. A szállítási
          díj a csomag össztömege alapján, súlysávosan kerül meghatározásra; a pontos díj a
          pénztár oldalon jelenik meg. Nagyméretű termékek (jakuzzi, szauna) és 40 kg feletti
          küldemények esetén a szállítás egyedi ajánlat alapján történik.
        </p>
        <p className="mt-3 text-sm text-muted">
          Várható szállítási határidő: <Todo>TODO — szállítási határidő megadása</Todo>.
        </p>
      </LegalSection>

      <LegalSection title="5. Elállási jog">
        <p className="text-sm text-muted">
          A fogyasztó a 45/2014. (II. 26.) Korm. rendelet alapján a termék átvételétől
          számított <strong>14 napon belül</strong> indokolás nélkül elállhat a
          szerződéstől. Az elállási szándékot a{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-accent underline">
            {COMPANY.email}
          </a>{" "}
          címen kell jelezni. A terméket a vásárló saját költségén küldi vissza; a
          vételárat az elállás beérkezésétől számított 14 napon belül visszatérítjük.
        </p>
        <p className="mt-3 text-sm text-muted">
          Az elállási jog nem gyakorolható egyedi igény alapján, a vásárló utasítása
          szerint gyártott vagy egyedileg konfigurált termékek esetén.
        </p>
      </LegalSection>

      <LegalSection title="6. Jótállás és szavatosság">
        <p className="text-sm text-muted">
          A termékekre a jogszabályban előírt kellékszavatosság, termékszavatosság,
          illetve — a kötelező jótállás alá eső termékek esetén — jótállás vonatkozik.
          A jótállás időtartama: <Todo>TODO — jótállási idő termékkörönként</Todo>.
        </p>
      </LegalSection>

      <LegalSection title="7. Panaszkezelés és jogorvoslat">
        <p className="text-sm text-muted">
          Panaszát a fenti elérhetőségeken jelezheti. Amennyiben a panaszkezelés nem vezet
          eredményre, a fogyasztó a lakóhelye szerint illetékes békéltető testülethez,
          illetve a fogyasztóvédelmi hatósághoz fordulhat. Online vitarendezési platform:{" "}
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

      <LegalSection title="8. Adatkezelés">
        <p className="text-sm text-muted">
          A megrendeléssel kapcsolatos adatkezelésről az{" "}
          <Link href="/adatvedelem" className="text-accent underline">
            Adatkezelési tájékoztatóban
          </Link>{" "}
          olvashat.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
