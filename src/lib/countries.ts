// Countries GLS realistically delivers to from Hungary — EU + neighboring
// non-EU markets. Not the full ISO-3166 list; extend here if a customer
// needs a country that isn't listed yet.
export const COUNTRIES: { code: string; hu: string; en: string }[] = [
  { code: "HU", hu: "Magyarország", en: "Hungary" },
  { code: "AT", hu: "Ausztria", en: "Austria" },
  { code: "BE", hu: "Belgium", en: "Belgium" },
  { code: "BG", hu: "Bulgária", en: "Bulgaria" },
  { code: "HR", hu: "Horvátország", en: "Croatia" },
  { code: "CY", hu: "Ciprus", en: "Cyprus" },
  { code: "CZ", hu: "Csehország", en: "Czechia" },
  { code: "DK", hu: "Dánia", en: "Denmark" },
  { code: "EE", hu: "Észtország", en: "Estonia" },
  { code: "FI", hu: "Finnország", en: "Finland" },
  { code: "FR", hu: "Franciaország", en: "France" },
  { code: "DE", hu: "Németország", en: "Germany" },
  { code: "GR", hu: "Görögország", en: "Greece" },
  { code: "IE", hu: "Írország", en: "Ireland" },
  { code: "IT", hu: "Olaszország", en: "Italy" },
  { code: "LV", hu: "Lettország", en: "Latvia" },
  { code: "LI", hu: "Liechtenstein", en: "Liechtenstein" },
  { code: "LT", hu: "Litvánia", en: "Lithuania" },
  { code: "LU", hu: "Luxemburg", en: "Luxembourg" },
  { code: "MT", hu: "Málta", en: "Malta" },
  { code: "NL", hu: "Hollandia", en: "Netherlands" },
  { code: "NO", hu: "Norvégia", en: "Norway" },
  { code: "PL", hu: "Lengyelország", en: "Poland" },
  { code: "PT", hu: "Portugália", en: "Portugal" },
  { code: "RO", hu: "Románia", en: "Romania" },
  { code: "RS", hu: "Szerbia", en: "Serbia" },
  { code: "SK", hu: "Szlovákia", en: "Slovakia" },
  { code: "SI", hu: "Szlovénia", en: "Slovenia" },
  { code: "ES", hu: "Spanyolország", en: "Spain" },
  { code: "SE", hu: "Svédország", en: "Sweden" },
  { code: "CH", hu: "Svájc", en: "Switzerland" },
  { code: "UA", hu: "Ukrajna", en: "Ukraine" },
  { code: "GB", hu: "Egyesült Királyság", en: "United Kingdom" },
];

export function countryLabel(code: string, locale: string): string {
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) return code;
  return locale === "en" ? country.en : country.hu;
}
