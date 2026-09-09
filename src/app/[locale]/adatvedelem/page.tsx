import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { LegalPage, LegalSection, Todo } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Adatvédelmi nyilatkozat",
  description:
    "Hogyan kezeli a Zedonwellness a webáruházban megadott személyes adatokat.",
};

/** The data subject rights, as enumerated in the published policy. */
const RIGHTS: [string, string][] = [
  [
    "A hozzáférés joga",
    "Az érintett jogosult arra, hogy az Adatkezelőtől visszajelzést kapjon arra vonatkozóan, hogy személyes adatainak kezelése folyamatban van-e, és ha igen, jogosult arra, hogy a személyes adatokhoz és az adatkezelés körülményeivel kapcsolatos információkhoz hozzáférést kapjon.",
  ],
  [
    "A helyesbítés joga",
    "Az érintett jogosult arra, hogy kérésére az Adatkezelő indokolatlan késedelem nélkül helyesbítse a rá vonatkozó pontatlan személyes adatokat.",
  ],
  [
    "A törléshez és az „elfeledtetéshez” való jog",
    "Az érintett jogosult arra, hogy az Adatkezelő indokolatlan késedelem nélkül törölje a rá vonatkozó személyes adatokat, ha az adatkezelésnek nincs célja vagy egyéb jogalapja, tiltakozás esetén nincs elsőbbséget élvező jogszerű ok az adatkezelésre, az adatokat eleve jogellenesen kezelték, vagy jogi kötelezettség teljesítéséhez törölni kell azokat.",
  ],
  [
    "Az adatkezelés korlátozásához való jog",
    "Az érintett jogosult arra, hogy kérésére az Adatkezelő korlátozza az adatkezelést, ha a GDPR-ban meghatározott feltételek bármelyike megvalósul, és a tároláson kívül más műveletet az adattal ne végezzen.",
  ],
  [
    "A tiltakozáshoz való jog",
    "Az érintett jogosult arra, hogy a saját helyzetével kapcsolatos okokból bármikor tiltakozzon személyes adatainak a GDPR 6. cikk (1) bekezdés e) vagy f) pontján alapuló kezelése ellen.",
  ],
  [
    "Az adathordozhatósághoz való jog",
    "Az érintett jogosult arra, hogy a rá vonatkozó, általa az Adatkezelő rendelkezésére bocsátott személyes adatokat tagolt, széles körben használt, géppel olvasható formátumban megkapja, továbbá jogosult arra, hogy ezeket az adatokat egy másik adatkezelőnek továbbítsa.",
  ],
];

/** Every processing activity listed in the published policy. */
const ACTIVITIES = [
  "Egyszeri információkérés és -adás",
  "Folyamatos, rendszeres kapcsolattartás",
  "Ajánlatkérés és ajánlatadás",
  "Megrendelés",
  "Megállapodás megkötése",
  "Számlakibocsátás",
  "Számlabefogadás",
  "Szervizelés",
  "Reklamáció- és panaszkezelés",
  "Érintetti (ügyfél- és partner) nyilvántartás",
  "Hozzájáruló nyilatkozatok",
  "Hírlevél küldése",
  "Időpontegyeztetés (időpontfoglalás)",
  "Ügyfélelégedettség mérése",
  "Nyereményjáték szervezése",
  "Rendezvényszervezés",
  "Közösségi oldalakon történő marketing",
  "Rögzített vonalú telefonbeszélgetés",
  "Kamerarendszer üzemeltetése",
  "Beléptetés",
];

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <LegalPage title="Adatvédelmi nyilatkozat" updatedAt={COMPANY.legal.revisedAt}>
      <LegalSection title="1. Az adatkezelő">
        <p className="text-sm leading-relaxed text-muted">
          A {COMPANY.legal.legalName}, székhely: {COMPANY.legal.address}, adószám:{" "}
          {COMPANY.legal.taxNumber}, e-mail cím:{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-accent underline">
            {COMPANY.email}
          </a>
          , telefon:{" "}
          <a href={`tel:${COMPANY.phoneHref}`} className="text-accent underline">
            {COMPANY.phone}
          </a>
          , önállóan képviseli: {COMPANY.legal.representative} — ezúton tájékoztatja
          összefoglalóan és röviden az általa végzett adatkezelési tevékenységekről.
        </p>
      </LegalSection>

      <LegalSection title="2. Az érintettek jogai">
        <div className="flex flex-col gap-4">
          {RIGHTS.map(([title, text]) => (
            <div key={title}>
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Jogaikat az érintettek a{" "}
          {[COMPANY.email, COMPANY.sales, COMPANY.service.email, COMPANY.webshop].map(
            (address, i, all) => (
              <span key={address}>
                <a href={`mailto:${address}`} className="text-accent underline">
                  {address}
                </a>
                {i < all.length - 1 ? ", " : ""}
              </span>
            ),
          )}{" "}
          e-mail címre, vagy az Adatkezelő más elérhetőségére küldött nyilatkozattal
          gyakorolhatják. Adott joggyakorlásnak lehetnek feltételei és korlátai egy-egy
          adatkezeléssel kapcsolatban; ha egy jogával az érintett nem élhet, úgy a
          joggyakorlást kizáró vagy korlátozó ténybeli és jogi indokokról az Adatkezelő
          írásban tájékoztatja az érintettet, és arról nyilvántartást vezet.
        </p>
      </LegalSection>

      <LegalSection title="3. Adatbiztonság">
        <p className="text-sm leading-relaxed text-muted">
          Az Adatkezelő a megvalósítás költségei, továbbá az adatkezelés jellege,
          hatóköre, körülményei és céljai, valamint a természetes személyek jogaira és
          szabadságaira jelentett kockázat figyelembevételével megfelelő technikai és
          szervezési intézkedéseket hajt végre. Az informatikai védelemmel kapcsolatos
          feladatai körében gondoskodik különösen:
        </p>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted">
          <li>az adatkezelő rendszer jogosulatlan személyek általi hozzáférésének megtagadásáról,</li>
          <li>az adathordozók jogosulatlan olvasásának, másolásának, módosításának vagy eltávolításának megakadályozásáról,</li>
          <li>a személyes adatok jogosulatlan bevitelének, megismerésének, módosításának vagy törlésének megakadályozásáról,</li>
          <li>arról, hogy a rendszer használatára jogosult személyek kizárólag a hozzáférési engedélyben meghatározott adatokhoz férjenek hozzá,</li>
          <li>arról, hogy ellenőrizhető legyen, mely adatokat, mikor és ki vitt be a rendszerbe, illetve mely címzettnek továbbították,</li>
          <li>az adatok továbbítása és szállítása közbeni jogosulatlan megismerésének megakadályozásáról,</li>
          <li>arról, hogy üzemzavar esetén a rendszer helyreállítható legyen, és a hibás működés se változtathassa meg a tárolt adatokat.</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Profilalkotás egyik adatkezelés vonatkozásában sem történik. Az egyes
          adatkezelések részletesebb magyarázatai elérhetőek a székhelyen, valamint
          kérésre azokat az Adatkezelő megküldi.
        </p>
      </LegalSection>

      <LegalSection title="4. Adatkezelési tevékenységek">
        <p className="text-sm leading-relaxed text-muted">
          Az alábbi felsorolás az Adatkezelő minden adatkezelését tartalmazza, kivéve
          azokat, amelyek kizárólag a munkatársakra vagy a belső működésre vonatkoznak.
          Az egyes tevékenységek célját, jogalapját, az érintettek körét, az
          adatkategóriákat és a megőrzési időt az adott adatkezelés részletes
          tájékoztatója tartalmazza.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted max-sm:grid-cols-1">
          {ACTIVITIES.map((a) => (
            <li key={a} className="list-disc ml-5">
              {a}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="5. A webáruház adatkezelése">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          A jelen weboldalon leadott megrendeléshez konkrétan az alábbi adatokat
          kezeljük:
        </p>
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
                retention="A számviteli előírások szerint 8 év"
              />
              <Row
                data="Megrendelés tartalma, összege"
                purpose="Számlázás, könyvelés"
                basis="Jogi kötelezettség (GDPR 6. cikk (1) c))"
                retention="8 év"
              />
              <Row
                data="A felhasználási feltételek elfogadásának időpontja"
                purpose="A szerződéskötés igazolása"
                basis="Jogos érdek (GDPR 6. cikk (1) f))"
                retention="A megrendeléssel azonos ideig"
              />
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="6. Sütik (cookie-k)">
        <p className="text-sm leading-relaxed text-muted">
          A weboldal kizárólag a működéshez szükséges, technikai adatokat tárol a
          böngészőben (a kosár tartalma és a kiválasztott pénznem). Ezek nem kerülnek át
          a szerverre marketing célból, és nem alkalmasak a látogató azonosítására —
          ezért nem igényelnek külön hozzájárulást. Analitikai vagy marketing sütiket
          jelenleg nem használunk.
        </p>
      </LegalSection>

      <LegalSection title="7. Adatfeldolgozók">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
          <li>
            Tárhelyszolgáltató: <Todo>{COMPANY.legal.hosting}</Todo>
          </li>
          <li>Futárszolgálat: GLS General Logistics Systems Hungary Kft. (kiszállítás)</li>
          <li>
            E-mail küldő szolgáltató: <Todo>TODO — a rendelés-visszaigazoló levelekhez</Todo>
          </li>
          <li>
            Blogtartalom szolgáltatója: Soro (trysoro.com) — csak a cikkek
            megjelenítéséhez, látogatói adat nélkül
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Jogorvoslat">
        <p className="text-sm leading-relaxed text-muted">
          Amennyiben az érintett úgy ítéli meg, hogy jogai sérültek, panasszal fordulhat
          a felügyeleti hatósághoz — Magyarországon a Nemzeti Adatvédelmi és
          Információszabadság Hatósághoz (
          <a
            href="https://naih.hu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            naih.hu
          </a>
          ) —, vagy a lakóhelye szerint illetékes bírósághoz, és többek között
          sérelemdíjat követelhet.
        </p>
      </LegalSection>

      <LegalSection title="9. Kapcsolódó dokumentumok">
        <p className="text-sm text-muted">
          <Link href="/aszf" className="text-accent underline">
            Felhasználási feltételek
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
    <tr className="border-b border-line align-top last:border-0">
      <td className="py-3 pr-4">{data}</td>
      <td className="py-3 pr-4">{purpose}</td>
      <td className="py-3 pr-4">{basis}</td>
      <td className="py-3">{retention}</td>
    </tr>
  );
}
