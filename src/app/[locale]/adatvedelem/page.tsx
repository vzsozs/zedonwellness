import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { LegalPage, LegalSection, Todo } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató",
  description:
    "Hogyan kezeli a Zedonwellness a webáruházban megadott személyes adatokat.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <LegalPage title="Adatkezelési tájékoztató">
      <p className="border-l-[3px] border-amber-500 bg-amber-50 px-4.5 py-3.5 text-sm text-amber-900">
        <strong>Jogi ellenőrzésre vár.</strong> Ez a tájékoztató a webáruház tényleges
        adatkezelése alapján készült vázlat — élesítés előtt egészítsd ki a sárgával
        jelölt adatokkal, és hagyasd jóvá adatvédelmi szakértővel.
      </p>

      <LegalSection title="1. Az adatkezelő">
        <p className="text-sm text-muted">
          <Todo>{COMPANY.legal.legalName}</Todo>, székhely:{" "}
          <Todo>{COMPANY.legal.address}</Todo>. Kapcsolat:{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-accent underline">
            {COMPANY.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Milyen adatokat kezelünk és miért">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
                <th className="py-2 pr-4">Adatkör</th>
                <th className="py-2 pr-4">Cél</th>
                <th className="py-2 pr-4">Jogalap</th>
                <th className="py-2">Megőrzés</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <Row
                data="Név, e-mail, telefonszám, szállítási cím"
                purpose="A megrendelés teljesítése, kapcsolattartás"
                basis="Szerződés teljesítése (GDPR 6. cikk (1) b))"
                retention="A számviteli törvény szerint 8 év"
              />
              <Row
                data="Megrendelés tartalma, összege"
                purpose="Számlázás, könyvelés"
                basis="Jogi kötelezettség (GDPR 6. cikk (1) c))"
                retention="8 év"
              />
              <Row
                data="ÁSZF-elfogadás időpontja"
                purpose="A szerződéskötés igazolása"
                basis="Jogos érdek (GDPR 6. cikk (1) f))"
                retention="A megrendeléssel azonos ideig"
              />
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="3. Sütik (cookie-k)">
        <p className="text-sm text-muted">
          A weboldal kizárólag a működéshez szükséges, technikai adatokat tárol a
          böngésződben (kosár tartalma, kiválasztott pénznem). Ezek nem kerülnek át a
          szerverre marketing célból, és nem alkalmasak a látogató azonosítására — ezért
          nem igényelnek külön hozzájárulást. Analitikai vagy marketing sütiket jelenleg
          nem használunk.
        </p>
      </LegalSection>

      <LegalSection title="4. Adatfeldolgozók">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
          <li>
            Tárhelyszolgáltató: <Todo>{COMPANY.legal.hosting}</Todo>
          </li>
          <li>Futárszolgálat: GLS General Logistics Systems Hungary Kft. (kiszállítás)</li>
          <li>
            E-mail küldő szolgáltató: <Todo>TODO — pl. Resend, ha bekötésre kerül</Todo>
          </li>
          <li>
            Blogtartalom szolgáltatója: Soro (trysoro.com) — csak a cikkek megjelenítéséhez,
            látogatói adat nélkül
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Az érintett jogai">
        <p className="text-sm text-muted">
          Kérheted a rólad tárolt adatokhoz való hozzáférést, azok helyesbítését, törlését,
          a kezelés korlátozását, továbbá élhetsz az adathordozhatósághoz való jogoddal.
          Kérésedet a{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-accent underline">
            {COMPANY.email}
          </a>{" "}
          címen jelezheted; 30 napon belül válaszolunk. Panasszal a Nemzeti Adatvédelmi és
          Információszabadság Hatósághoz (
          <a
            href="https://naih.hu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            naih.hu
          </a>
          ) fordulhatsz.
        </p>
      </LegalSection>

      <LegalSection title="6. Kapcsolódó dokumentumok">
        <p className="text-sm text-muted">
          <Link href="/aszf" className="text-accent underline">
            Általános Szerződési Feltételek
          </Link>{" "}
          ·{" "}
          <Link href="/impresszum" className="text-accent underline">
            Impresszum
          </Link>
        </p>
      </LegalSection>
    </LegalPage>
  );
}

function Row({
  data,
  purpose,
  basis,
  retention,
}: {
  data: string;
  purpose: string;
  basis: string;
  retention: string;
}) {
  return (
    <tr className="border-b border-line last:border-0 align-top">
      <td className="py-3 pr-4">{data}</td>
      <td className="py-3 pr-4">{purpose}</td>
      <td className="py-3 pr-4">{basis}</td>
      <td className="py-3">{retention}</td>
    </tr>
  );
}
