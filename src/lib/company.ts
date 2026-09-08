/**
 * Single source of truth for the company's public contact and legal details.
 *
 * These used to be duplicated across the footer (with placeholder values),
 * the contact modal (with the real ones) and the top bar — so the site
 * advertised a phone number nobody answers. Everything reads from here now.
 *
 * ⚠️ TODO (user): the `legal` block below is required on a Hungarian webshop
 * (Impresszum, ÁSZF). The values marked TODO are placeholders — replace them
 * with the real company data before going live.
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

  legal: {
    /** TODO: exact registered company name (e.g. "Zedon Kft."). */
    legalName: "TODO — cégnév",
    /** TODO: registered seat. */
    address: "TODO — székhely (irányítószám, település, utca, házszám)",
    /** TODO: company registration number. */
    registrationNumber: "TODO — cégjegyzékszám",
    /** TODO: tax number. */
    taxNumber: "TODO — adószám",
    /** TODO: hosting provider name + contact (required in the Impresszum). */
    hosting: "TODO — tárhelyszolgáltató neve és elérhetősége",
  },
} as const;
