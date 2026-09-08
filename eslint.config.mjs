import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat configs, so they are imported
 * directly.
 *
 * The previous setup routed them through `FlatCompat`, which crashed on
 * ESLint 9.39 with "Converting circular structure to JSON" — meaning
 * `npm run lint` had never actually run in this project, and every
 * `eslint-disable` comment in the codebase was silently doing nothing.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "src/db/migrations/**",
      "design-mockups/**",
      "Ideiglenes/**",
      "uploads/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // The admin is behind auth, has no SEO or Core Web Vitals stake, and
    // most of its <img> tags preview `blob:` object URLs from a file input —
    // which next/image cannot optimise at all.
    files: ["src/app/admin/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    rules: {
      // Unused vars are a real signal here, but a leading underscore is the
      // established convention in this codebase for deliberately ignored
      // Server Action parameters (`_prevState`).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
