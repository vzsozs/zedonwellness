// Placeholder catalog data — stands in for the database until the admin
// panel and real product import exist. Structure mirrors the eventual
// `categories` / `products` Drizzle tables (see src/db/schema).

export type CategorySlug = "jakuzzik" | "szaunak" | "grillek" | "kiegeszitok";

export type Category = {
  slug: CategorySlug;
  navKey: "jacuzzis" | "saunas" | "grills" | "accessories";
  gradient: string;
  iconColor: string;
  subtitleHu: string;
  icon: string; // SVG path data
};

export const categories: Category[] = [
  {
    slug: "jakuzzik",
    navKey: "jacuzzis",
    gradient: "from-[#CDEDEF] to-[#9FD9DC]",
    iconColor: "#0A6B76",
    subtitleHu: "HC Design, Celtic, OKA — 25+ modell",
    icon: "M4 14c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0M4 18c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0",
  },
  {
    slug: "szaunak",
    navKey: "saunas",
    gradient: "from-[#E9E2D3] to-[#D3C4A3]",
    iconColor: "#7A5C2E",
    subtitleHu: "Hordó, hagyományos, infra — 15+ modell",
    icon: "M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6",
  },
  {
    slug: "grillek",
    navKey: "grills",
    gradient: "from-[#EFD9C9] to-[#DFAE8B]",
    iconColor: "#8A4A22",
    subtitleHu: "Beépíthető, kocsi, kemence",
    icon: "M7 10V7a5 5 0 0 1 10 0v3M3 19h18M3 10h18v9H3z",
  },
  {
    slug: "kiegeszitok",
    navKey: "accessories",
    gradient: "from-[#D7E4E0] to-[#AFC7C0]",
    iconColor: "#3E5F55",
    subtitleHu: "Vegyszerek, takarók, szűrők",
    icon: "M12 3a9 9 0 1 0 9 9M12 7v5l4 2",
  },
];

export type Product = {
  slug: string;
  categorySlug: CategorySlug;
  series: string;
  nameHu: string;
  priceHuf: number;
  gradient: string;
  badge: { label: string; tone: "ink" | "accent" } | null;
  capacityHu: string;
  descriptionHu: string;
  specs: { label: string; value: string }[];
  // No fixed catalog price — always requires a custom quote (distinct from
  // the >1M HUF order-only payment rule, which still shows a real price).
  customQuote?: boolean;
};

export const products: Product[] = [
  {
    slug: "hc-design-1",
    categorySlug: "jakuzzik",
    series: "HC Design",
    nameHu: "HC Design 1",
    priceHuf: 1_190_000,
    gradient: "from-[#CFEFF0] to-[#9FD9DC]",
    badge: { label: "ÚJDONSÁG", tone: "ink" },
    capacityHu: "4 fő · 190×190 cm",
    descriptionHu:
      "Kompakt, belépő szintű jakuzzi 4 fő részére — kisebb teraszra, kertbe is ideális.",
    specs: [
      { label: "Méret", value: "190 × 190 × 88 cm" },
      { label: "Férőhely", value: "4 fő" },
      { label: "Fúvókák száma", value: "28 db" },
      { label: "Vízmennyiség", value: "1 050 liter" },
      { label: "Fűtőteljesítmény", value: "2 kW" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "hc-design-3",
    categorySlug: "jakuzzik",
    series: "HC Design",
    nameHu: "HC Design 3",
    priceHuf: 1_490_000,
    gradient: "from-[#D7E8EA] to-[#A9CBCF]",
    badge: null,
    capacityHu: "5 fő · 210×210 cm",
    descriptionHu:
      "Öt fő kényelmes elhelyezésére tervezett, kiegyensúlyozott méretű modell.",
    specs: [
      { label: "Méret", value: "210 × 210 × 90 cm" },
      { label: "Férőhely", value: "5 fő" },
      { label: "Fúvókák száma", value: "34 db" },
      { label: "Vízmennyiség", value: "1 250 liter" },
      { label: "Fűtőteljesítmény", value: "3 kW" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "hc-design-5",
    categorySlug: "jakuzzik",
    series: "HC Design",
    nameHu: "HC Design 5 — 6 személyes jakuzzi",
    priceHuf: 1_890_000,
    gradient: "from-[#CFEFF0] to-[#8FD0D4]",
    badge: { label: "ÚJDONSÁG", tone: "ink" },
    capacityHu: "6 fő · 220×220 cm",
    descriptionHu:
      "A sorozat legnépszerűbb, közepes méretű jakuzzija — tökéletes egyensúlyt kínál a kompakt elhelyezhetőség és a kényelmes, 6 fős használat között. Az energiatakarékos szigetelésnek köszönhetően egész évben gazdaságosan üzemeltethető, a beépített LED-világítás pedig esti használatra is ideálissá teszi.\n\nA vásárlás ára tartalmazza a helyszíni felmérést, a szakszerű telepítést és a bevizsgálást.",
    specs: [
      { label: "Méret", value: "220 × 220 × 90 cm" },
      { label: "Férőhely", value: "6 fő" },
      { label: "Fúvókák száma", value: "42 db" },
      { label: "Vízmennyiség", value: "1 450 liter" },
      { label: "Fűtőteljesítmény", value: "3 kW" },
      { label: "Súly (üresen)", value: "340 kg" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "celtic-spas-2",
    categorySlug: "jakuzzik",
    series: "Celtic Spas",
    nameHu: "Celtic Spas 2",
    priceHuf: 1_090_000,
    gradient: "from-[#CDEAE0] to-[#96C9B7]",
    badge: { label: "AKCIÓ", tone: "accent" },
    capacityHu: "4 fő · 195×195 cm",
    descriptionHu: "Klasszikus kialakítású, kiváló ár-érték arányú jakuzzi.",
    specs: [
      { label: "Méret", value: "195 × 195 × 88 cm" },
      { label: "Férőhely", value: "4 fő" },
      { label: "Fúvókák száma", value: "30 db" },
      { label: "Vízmennyiség", value: "1 100 liter" },
      { label: "Fűtőteljesítmény", value: "2 kW" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "oka-design-4",
    categorySlug: "jakuzzik",
    series: "OKA Design",
    nameHu: "OKA Design 4",
    priceHuf: 1_990_000,
    gradient: "from-[#E3ECD9] to-[#BFD3A6]",
    badge: null,
    capacityHu: "6 fő · 220×220 cm",
    descriptionHu: "Prémium kivitelű, tágas családi jakuzzi 6 fő részére.",
    specs: [
      { label: "Méret", value: "220 × 220 × 92 cm" },
      { label: "Férőhely", value: "6 fő" },
      { label: "Fúvókák száma", value: "44 db" },
      { label: "Vízmennyiség", value: "1 500 liter" },
      { label: "Fűtőteljesítmény", value: "3 kW" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "hc-swimspa-odin",
    categorySlug: "jakuzzik",
    series: "Swim Spa",
    nameHu: "HC SwimSpa Odin",
    priceHuf: 4_200_000,
    customQuote: true,
    gradient: "from-[#DDE4EF] to-[#A9B7D6]",
    badge: null,
    capacityHu: "6+ fő · 450×220 cm",
    descriptionHu:
      "Úszó- és wellness-medence egyben — ellenáramoltatással, egész éves használatra. Mérete és felszereltsége telephelyenként egyedi konfigurációt igényel, ezért az árat egyedi ajánlatban adjuk meg.",
    specs: [
      { label: "Méret", value: "450 × 220 × 135 cm" },
      { label: "Férőhely", value: "6+ fő" },
      { label: "Fűtőteljesítmény", value: "9 kW" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "plugplay-florida",
    categorySlug: "jakuzzik",
    series: "Plug&Play",
    nameHu: "Plug&Play Florida",
    priceHuf: 890_000,
    gradient: "from-[#F0E6D6] to-[#D9BE95]",
    badge: null,
    capacityHu: "3 fő · 170×170 cm",
    descriptionHu:
      "Azonnal használatba vehető, normál konnektorról üzemeltethető beltéri-kültéri jakuzzi.",
    specs: [
      { label: "Méret", value: "170 × 170 × 85 cm" },
      { label: "Férőhely", value: "3 fő" },
      { label: "Fúvókák száma", value: "22 db" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "hanscraft-s2",
    categorySlug: "szaunak",
    series: "Hanscraft",
    nameHu: "Hanscraft S2 hordószauna, 300 cm",
    priceHuf: 1_240_000,
    gradient: "from-[#E9E2D3] to-[#D3C4A3]",
    badge: null,
    capacityHu: "6 fő · 300 cm",
    descriptionHu: "Hagyományos hordó kialakítású, kanadai vörösfenyő szauna.",
    specs: [
      { label: "Átmérő", value: "300 cm" },
      { label: "Férőhely", value: "6 fő" },
      { label: "Anyag", value: "Kanadai vörösfenyő" },
      { label: "Garancia", value: "5 év" },
    ],
  },
  {
    slug: "gazgrill-4egos",
    categorySlug: "grillek",
    series: "Beépíthető grillek",
    nameHu: "4 égős rozsdamentes gázgrill",
    priceHuf: 420_000,
    gradient: "from-[#EFD9C9] to-[#DFAE8B]",
    badge: { label: "AKCIÓ", tone: "accent" },
    capacityHu: "4 égő",
    descriptionHu: "Rozsdamentes acél kivitelű, beépíthető gázgrill teraszra, kerti konyhába.",
    specs: [
      { label: "Égők száma", value: "4 db" },
      { label: "Anyag", value: "Rozsdamentes acél" },
      { label: "Garancia", value: "3 év" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, limit);
}

export function formatHuf(amount: number) {
  return `${amount.toLocaleString("hu-HU")} Ft`;
}
