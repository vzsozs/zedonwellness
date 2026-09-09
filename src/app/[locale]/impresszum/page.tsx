import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { COMPANY } from "@/lib/company";
import { LegalPage, LegalSection, Todo } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Impresszum",
  description: "A Zedonwellness webáruház üzemeltetőjének adatai.",
};

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <LegalPage title="Impresszum">
      <LegalSection title="A szolgáltató adatai">
        <dl className="flex flex-col gap-2.5 text-sm">
          <Row label="Cégnév">{COMPANY.legal.legalName}</Row>
          <Row label="Székhely">{COMPANY.legal.address}</Row>
          <Row label="Képviselő">{COMPANY.legal.representative}</Row>
          <Row label="Adószám">{COMPANY.legal.taxNumber}</Row>
          <Row label="Cégjegyzékszám">
            <Todo>{COMPANY.legal.registrationNumber}</Todo>
          </Row>
          <Row label="E-mail">
            <a href={`mailto:${COMPANY.email}`} className="text-accent underline">
              {COMPANY.email}
            </a>
          </Row>
          <Row label="Telefon">
            <a href={`tel:${COMPANY.phoneHref}`} className="text-accent underline">
              {COMPANY.phone}
            </a>
          </Row>
        </dl>
      </LegalSection>

      <LegalSection title="További elérhetőségek">
        <dl className="flex flex-col gap-2.5 text-sm">
          <Row label="Értékesítés">
            <a href={`mailto:${COMPANY.sales}`} className="text-accent underline">
              {COMPANY.sales}
            </a>
          </Row>
          <Row label="Webáruház">
            <a href={`mailto:${COMPANY.webshop}`} className="text-accent underline">
              {COMPANY.webshop}
            </a>
          </Row>
          <Row label="Szerviz">
            <a href={`mailto:${COMPANY.service.email}`} className="text-accent underline">
              {COMPANY.service.email}
            </a>{" "}
            · {COMPANY.service.contactName},{" "}
            <a href={`tel:${COMPANY.service.phoneHref}`} className="text-accent underline">
              {COMPANY.service.phone}
            </a>
          </Row>
        </dl>
      </LegalSection>

      <LegalSection title="Tárhelyszolgáltató">
        <p className="text-sm text-muted">
          <Todo>{COMPANY.legal.hosting}</Todo>
        </p>
      </LegalSection>
    </LegalPage>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-line pb-2.5 max-sm:grid-cols-1 max-sm:gap-1">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}
