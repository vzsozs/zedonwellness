/**
 * Single source of truth for the company's public contact and legal details.
 *
 * These used to be duplicated across the footer (with placeholder values),
 * the contact modal (with the real ones) and the top bar — so the site
 * advertised a phone number nobody answers. Everything reads from here now.
 *
 * The `legal` block comes from the live site's own published documents
 * (zedonwellness.com/felhasznalasi-feltetelek and /adatvedelmi-nyilatkozat,
 * last revised 2025-03-24). Note the operator is a Slovak company, which is
 * why VAT is 23% (the Slovak standard rate) rather than the Hungarian 27%.
 */

export const COMPANY = {
  name: "Zedonwellness",
  email: "info@zedonwellness.com",
  phone: "+36 30 951 3808",
  /** Digits only, for tel: links. */
  phoneHref: "+36309513808",
  facebook: "https://www.facebook.com/zedonwellness/",

  service: {
    email: "szerviz@zedonwellness.com",
    contactName: "Kiss György",
    phone: "+36 70 944 9442",
    phoneHref: "+36709449442",
  },

  grill: {
    name: "ZedonGrill",
    email: "sales@zedongrill.com",
    facebook: "https://www.facebook.com/profile.php?id=100085312058058",
  },

  /** Additional inboxes named in the privacy policy. */
  sales: "ertekesites@zedonwellness.com",
  webshop: "webshop@zedonwellness.com",

  legal: {
    legalName: "Zedonwellness s.r.o.",
    address: "94301 Štúrovo, Hlavná 22, Szlovákia",
    /** Slovak VAT identification number. */
    taxNumber: "SK2121666118",
    representative: "Kocsis Gábor vezérigazgató",
    /** Standard Slovak VAT rate, as stated in the published terms. */
    vatRate: "23%",
    /** Date the published legal documents were last revised. */
    revisedAt: "2025. március 24.",
    /** Not published anywhere on the live site — still needed for a
     * complete Impresszum. */
    registrationNumber: "TODO — cégjegyzékszám (IČO)",
    /** TODO: hosting provider name + contact (required in the Impresszum). */
    hosting: "TODO — tárhelyszolgáltató neve és elérhetősége",
  },
} as const;
