// Presentation-only lookups for real (DB-backed) categories/products that
// don't have a photo yet — keeps the brand look from the design mockups
// (gradient + icon per category, gradient fallback per product) without
// storing styling in the database.

type CategoryVisual = {
  gradient: string;
  iconColor: string;
  icon: string; // SVG path data
};

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  jakuzzik: {
    gradient: "from-[#CDEDEF] to-[#9FD9DC]",
    iconColor: "#0A6B76",
    icon: "M4 14c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0M4 18c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0",
  },
  szaunak: {
    gradient: "from-[#E9E2D3] to-[#D3C4A3]",
    iconColor: "#7A5C2E",
    icon: "M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6",
  },
  grillek: {
    gradient: "from-[#EFD9C9] to-[#DFAE8B]",
    iconColor: "#8A4A22",
    icon: "M7 10V7a5 5 0 0 1 10 0v3M3 19h18M3 10h18v9H3z",
  },
  kiegeszitok: {
    gradient: "from-[#D7E4E0] to-[#AFC7C0]",
    iconColor: "#3E5F55",
    icon: "M12 3a9 9 0 1 0 9 9M12 7v5l4 2",
  },
};

const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  gradient: "from-[#D7E4E0] to-[#AFC7C0]",
  iconColor: "#3E5F55",
  icon: "M12 3a9 9 0 1 0 9 9M12 7v5l4 2",
};

export function getCategoryVisual(slug: string): CategoryVisual {
  return CATEGORY_VISUALS[slug] ?? DEFAULT_CATEGORY_VISUAL;
}

const PRODUCT_GRADIENTS = [
  "from-[#CFEFF0] to-[#9FD9DC]",
  "from-[#D7E8EA] to-[#A9CBCF]",
  "from-[#CDEAE0] to-[#96C9B7]",
  "from-[#E3ECD9] to-[#BFD3A6]",
  "from-[#DDE4EF] to-[#A9B7D6]",
  "from-[#F0E6D6] to-[#D9BE95]",
  "from-[#E9E2D3] to-[#D3C4A3]",
  "from-[#EFD9C9] to-[#DFAE8B]",
];

/** Deterministic placeholder gradient for a product without an uploaded photo. */
export function getProductGradient(productId: number): string {
  return PRODUCT_GRADIENTS[productId % PRODUCT_GRADIENTS.length];
}
