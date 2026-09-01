# Zedonwellness — Fejlesztési Napló

Ez a fájl végigvezeti a zedonwellness.com új, kód szintű webshop-fejlesztésének menetét: döntéseket, mérföldköveket, nyitott kérdéseket.

## 2026-09-01 — Projekt indítás, tervezés

### Kiindulási helyzet
- Jelenlegi élő oldal: https://www.zedonwellness.com/ — Webflow-ban épült, ~7 éves.
- Menüszerkezet: Termékek (Masszázsmedence, Szauna, Jakuzzi vízkezelés, Kiegészítők), Grillek (Beépített BBQ, Grillkocsik, Kemencék, Akció), céginfó (A cég, A gyár, Szerviz, Kapcsolat), Blog, EN nyelvi verzió.
  - Megjegyzés: a "Szaniter" menüpont (Zuhanykabin, Zuhanytálca, Kád, Kádparaván) régi, közben törölt melléktermékkör volt — a cég már nem foglalkozik szaniter árusítással, az új oldalba **nem** kerül be.
- ~20+ termékkategória, sok modellváltozat (jakuzzik: HC Design, Celtic SPAS, SWIM SPA, OKA Design, Plug&Play, Cool Pool; szaunák 15+ variáció; grillek; vegyszerek/kiegészítők 20+).
- Blog: tartalma a Soro (https://trysoro.com/) rendszerben van, API-n keresztül érhető el — nem Webflow CMS.
- Sitemap felmérve — alapja lesz a redirect-tervnek élesítéskor.

### Döntések
- **Stack:** Next.js (TypeScript) + Drizzle ORM/Postgres + Stripe + Tailwind/shadcn-ui. Monolit app (nem külön frontend/backend repo). *(2026-09-01 update: a szerveren futó testvér-projektek — hhm-shop, paalmode, mfa-shop stb. — mind ezt a mintát követik: Next.js + Drizzle + shadcn/ui + Docker; ehhez igazodunk Prisma helyett Drizzle-lel az egységes karbantarthatóság miatt.)*
- **Nyelvek:** HU (alapértelmezett) + EN, jövőben bővíthető architektúrával.
- **Blog:** marad a Soro (https://trysoro.com/) rendszerben, az új oldal API-n keresztül olvassa ki és jeleníti meg — nem duplikáljuk a szerkesztőfelületet.
- **Termékadatok:** nincs automata migráció — admin felületen kézzel visszük fel újra, alkalom a leírások/SEO szövegek tisztítására.
- **Szállítás:** fix/sávos szállítási díjtábla adminból kezelve (nem külső futár API). Nagyméretű termékeknél (jakuzzi, szauna) várhatóan egyedi ajánlat/kapcsolatfelvétel a folyamat.
- **Fizetés:** Stripe, EUR és HUF. 1.000.000 Ft (bruttó) felett a fizetés le van tiltva, csak megrendelés adható le.
- **Számlázás:** egyelőre nincs automata integráció (NAV/Számlazz.hu/Billingo) — külső rendszerben, kézzel történik. Későbbi bővítési pont.
- **Design:** meglévő logó megtartva; új színvilág/UI: letisztult, minimál, wellness stílus. Előbb vizuális mockup készül és kerül jóváhagyásra, csak utána kódolás.
- **SEO:**
  - Tesztdomain: zw.formagyar.hu — a kezdetektől `noindex` + robots.txt tiltás, élesítéskor kapcsoljuk vissza a jelenlegi élő domainen.
  - A jelenlegi URL-struktúrát ahol logikus, követjük; ahol nem, redirect-térképet készítünk élesítéskor.
  - Cél: a jelenlegi organikus eredmények megtartása + javítása (meta, hreflang, sitemap, structured data).
- **Admin felület:** saját, a projekten belüli admin (termékek, kategóriák, rendelések, szállítási díjtábla, blog-kapcsolat).
- **Szerver/hosting:** saját VPS (Ubuntu, `vps` host, 185.208.227.129). SSH hozzáférés tesztelve, működik. Felmérés eredménye:
  - A gépen **Nginx Proxy Manager** fut Docker-konténerben (nem sima nginx/PM2 a webappoknál) — ez proxyzza a domaineket SSL-lel.
  - Minden testvér-projekt (hhm-shop-lms, paalmode, mfa-shop, szivunklelkunk, velenceitopart, formagyar, thermoprofessional) saját Docker-konténerben fut, Next.js app port 3000-en, jellemzően saját Postgres-konténerrel, `/root/projects/<projekt-név>/` alatt.
  - A zedonwellness projekt is ezt a mintát fogja követni: `/root/projects/zw-shop/` alatt, `zw-shop-web` + `zw-shop-db` konténerek, NPM-ben proxyzva a `zw.formagyar.hu` (majd élesben a `zedonwellness.com`) domainre.

### Nyitott / későbbi kérdések
- SSH hozzáférés a VPS-hez megadva (kulcsalapú, root). *A konkrét kulcs/IP nincs a naplóban rögzítve — biztonsági megfontolásból nem kerül git-be verzionált fájlba.*
- zw.formagyar.hu DNS/subdomain beállítása a tesztkörnyezethez.
- Soro blog API hozzáférés (API kulcs, végpontok).
- Stripe fiók adatai (élő/teszt kulcsok).
- Pontos szállítási díjsávok (régiók/kategóriák szerint).
- Jövőbeli bővítés: NAV számlázó integráció, több nyelv.

### Következő lépés
Design mockupok készítése: főoldal, terméklista, termék részletező oldal.

## 2026-09-01 — Design mockupok jóváhagyva

- Meglévő logó kinyerve az élő oldalról (`assets/zedonwellness-logo.png`), megtartva.
- Elkészült és jóváhagyva 3 mockup (főoldal, terméklista, termékrészletező) a Claude Design canvason: türkiz (#0E8C9A) + sötét (#17201E) + törtfehér (#FAFAF8) paletta, Bricolage Grotesque (display) + Manrope (body) betűtípus-pár.
- A termékrészletező mockup vizuálisan is bemutatja az 1.000.000 Ft feletti "csak megrendelés, nincs online fizetés" szabályt.
- A szerveren (185.208.227.129) felmérve a testvér-projektek (hhm-shop-lms, paalmode, mfa-shop, stb.) közös stackje: **Next.js 16 + React 19 + Tailwind 4 + Drizzle ORM + shadcn/radix-ui + Docker**, Nginx Proxy Manager mögött, `/root/projects/<projekt>/` alatt, saját Docker hálózattal (pl. `hhm_network`, külsőleg csatlakoztatva az NPM konténerhez). A zedonwellness projekt is ezt fogja követni.

## 2026-09-01 — Projekt scaffold (v0)

Elindult a tényleges kódolás. Létrejött az alap Next.js 16 (App Router, TypeScript, Webpack dev / Turbopack build) projekt:

- **Stack**: Next.js 16 + React 19 + Tailwind CSS 4 + Drizzle ORM (Postgres) + next-intl (i18n) + Stripe (még nincs bekötve) + lucide-react ikonok.
- **i18n**: `next-intl`, HU alapértelmezett nyelv prefix nélkül (`/`), EN `/en` prefixszel (`localePrefix: "as-needed"`) — így a jelenlegi HU URL-struktúra nem törik meg. Locale-fájlok: `messages/hu.json`, `messages/en.json`.
- **Design tokenek** átvéve a jóváhagyott mockupokból: `src/app/globals.css` (`--color-ink`, `--color-paper`, `--color-accent` stb.), Google Fonts (Bricolage Grotesque + Manrope) a `[locale]/layout.tsx`-ben.
- **Komponensek**: `SiteHeader`, `SiteFooter`, és a főoldal szekciói (`Hero`, `TrustStrip`, `CategoryGrid`, `FeaturedProducts`) — a mockup 1:1 leképezése, egyelőre statikus/placeholder termékadatokkal (az admin felület elkészültéig).
- **Adatbázis-séma** (`src/db/schema/index.ts`, Drizzle): `categories`, `products` (HU/EN mezőkkel, `orderOnly` flaggel), `shippingRates` (sávos díjtábla), `orders`. Még nincs migrálva/futtatva DB ellen.
- **SEO / staging védelem**: `src/app/robots.ts` — ha a `NEXT_PUBLIC_STAGING_NOINDEX=true` env változó be van állítva (ez lesz a `zw.formagyar.hu`-n), teljes `disallow: /` megy ki; élesben (`false`/hiányzik) normál `allow` + sitemap link. Metaadat szinten is (`robots` a layoutban) le van tiltva indexelés staging módban.
- **Docker**: `Dockerfile` (multi-stage, Next standalone build) + `docker-compose.yml` (`zw-shop-web` + `zw-shop-db` konténerek, `zw_network` külső hálózat) — a szerveren megfigyelt testvér-projekt mintát követi, hogy a deploy egyszerű és konzisztens legyen.
- Helyi ellenőrzés: `npm run build` sikeres, HU (`/`) és EN (`/en`) route is 200-at ad, mindkettő statikusan pre-renderelt.

### Nyitott / következő lépések
- Kategória-lista és termékrészletező oldal kódolása (a második és harmadik mockup alapján), egyelőre placeholder adatokkal.
- Drizzle migrációk generálása és lokális Postgres elindítása teszteléshez.
- Admin felület vázának megtervezése (termék/kategória/rendelés/szállítási díj CRUD).
- Szerverre telepítés: `zw_network` docker hálózat létrehozása, Nginx Proxy Manager proxy host beállítása a `zw.formagyar.hu` domainre, `.env` production változók beállítása a szerveren (staging noindex = true).
