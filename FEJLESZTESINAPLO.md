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

## 2026-09-01 — Terméklista és termékrészletező oldal

- Létrejött egy közös placeholder katalógus (`src/lib/catalog.ts`): kategóriák + termékek egy helyen, ezt használja a főoldal (`CategoryGrid`, `FeaturedProducts`), az új `/[category]` (kategória/terméklista) oldal és az új `/termek/[slug]` (termékrészletező) oldal is — nincs többé duplikált adat komponensenként.
- **Kategória oldal** (`src/app/[locale]/[category]/page.tsx`): a 2. mockup alapján — törzs, sorozat szerinti szűrő (egyelőre vizuális, nincs bekötve működő szűrésre), termékrács. `generateStaticParams` a 4 ismert kategóriaslugra (jakuzzik, szaunak, grillek, kiegeszitok); ismeretlen slugra `notFound()`.
- **Termékrészletező oldal** (`src/app/[locale]/termek/[slug]/page.tsx`): galéria (placeholder gradiens blokkok), ár, specifikáció-tábla, hasonló termékek. Az **1.000.000 Ft-os szabály élesben működik**: ha a termék ára a küszöb felett van, a "Kosárba" gomb helyett "Megrendelés leadása" jelenik meg + egy magyarázó szövegdoboz, hogy online fizetés nem elérhető. Külön `customQuote` flag azoknak a termékeknek, amiknek nincs fix listaára (pl. egyedi konfigurációjú Swim Spa) — ott "Egyedi ajánlat" a katalógusban is, a részletezőn is.
- Az üzleti logika helyben tesztelve (`src/lib/config.ts` — `ORDER_ONLY_THRESHOLD_HUF`, `isOrderOnly()`): 1M Ft alatti termék → "Kosárba", felette → "Megrendelés leadása" + figyelmeztető szöveg, `customQuote` termék → "Egyedi ajánlat". Build zöld, minden route (kategóriák × 2 nyelv, termékek × 2 nyelv) statikusan generálva.

## 2026-09-01 — Design finomhangolás (font, hero-kép, háttérszín)

- **Display betűtípus**: Bricolage Grotesque → **Inter** (a body betűtípus, Manrope, változatlan maradt). Frissítve a `globals.css`-ben és a `[locale]/layout.tsx`-ben.
- **Hero valós képpel**: a mockupban használt gradiens-placeholder helyett most a `public/Jacuzzi-bg.webp` valódi termékfotó a Hero háttere, bal oldalon szövegolvashatóságot biztosító elmosódással (mivel a szöveg is ott van). Jobb alsó sarokban megjelenik a `public/tuv_certified.webp` TÜV Rheinland tanúsítvány-jelvény.
- **Háttérszín**: `--color-paper` `#fafaf8` → **`#ebf6ff`** (kékebb árnyalat) — ez az oldal globális alap-háttérszíne.
- Módszertani megjegyzés: mostantól a saját tesztfuttatásaimhoz külön `git worktree`-t használok (`/tmp/zw-preview`), hogy ne ütközzön a felhasználó saját, párhuzamosan futó dev szerverével (korábban egy `rm -rf .next` véletlenül megzavarta az ő szerverét, mert ugyanazt a `.next` mappát használtuk).

- **Finomhangolás**: TÜV-jelvény natív alfa-csatornával (a korábbi fehér doboz eltávolítva) és megnövelt méretben; a fejléc menüsora fehér hátterű; új "A cég" menüpont a Blog és a Kapcsolat között (`/a-ceg`, az oldal még nincs megépítve).

### Következő lépések
- **Admin felület** (soron következő) — termék/kategória/rendelés/szállítási díj CRUD, ez váltja majd le a `src/lib/catalog.ts` placeholder adatokat valós DB-re.
- Kosár és checkout folyamat (Stripe EUR/HUF + megrendelés-only ág).
- Nginx Proxy Manager proxy host beállítása a `zw.formagyar.hu` domainre, `.env` production változók beállítása a szerveren (staging noindex = true), teljes app deploy (`docker compose up -d`, jelenleg csak a `db` service fut).

## 2026-09-01 — Admin felület (auth + termék/kategória/szállítás CRUD)

- **Auth**: next-auth v5, credentials provider (email + jelszó, bcrypt-tel hashelve), `admin_users` tábla. Session JWT-alapú, `/admin/login` a bejelentkező oldal.
- **Route-szerkezet**: `/admin` külön, saját gyökér-layoutot kapott (`src/app/admin/layout.tsx`, saját `<html>` fa) — **fontos technikai döntés**: eredetileg egy közös `src/app/layout.tsx`-t hoztam létre a `[locale]` és az `admin` ág fölé, de ez `getLocale()` dinamikus API-t igényelt volna, ami **az egész oldalt dinamikussá tette volna** (elveszett a publikus oldalak statikus előregenerálása — SEO-kritikus regresszió). Javítva: a Next.js "több gyökér-layout" mintáját használva a `[locale]/layout.tsx` és az `admin/layout.tsx` egymástól függetlenül definiálja a saját `<html>/<body>`-ját, közös `app/layout.tsx` nélkül — így a publikus oldalak visszakapták a statikus (`SSG`) buildet, az admin pedig dinamikus marad (ahogy kell egy session-függő felületnek).
- Admin csoport: `src/app/admin/(protected)/` — bejelentkezés nélkül minden ide tartozó oldal `/admin/login`-ra redirectel.
- **CRUD**: Termékek (`/admin/products`), Kategóriák (`/admin/categories`), Szállítási díjsávok (`/admin/shipping`) — Server Actionökkel + Drizzle-lel, zod validációval. Rendelések (`/admin/orders`) egyelőre csak olvasható lista (üres, amíg nincs checkout folyamat).
- `npm run seed:admin -- <email> <jelszó> [név]` hozza létre/frissíti az admin belépést.
- **Dev adatbázis**: mivel helyben nincs Docker/Postgres, és a user jóváhagyta, hogy a valós (még üres) céladatbázist használjuk fejlesztésre is — létrehoztam a `zw-shop-db` Postgres konténert a szerveren (`/root/projects/zw-shop/`, `zw_network` docker hálózat, `127.0.0.1:5434`-re publikálva). Helyi eléréshez SSH-alagutat nyitok igény szerint: `ssh -i ~/.ssh/hhm_shop_deploy_key -f -N -L 127.0.0.1:5434:127.0.0.1:5434 root@185.208.227.129`. A `.env.local` ehhez van beállítva.
- Végig-tesztelve egy elkülönített worktree-ben: migráció lefutott, valódi bejelentkezés a NextAuth HTTP folyamaton keresztül (CSRF + credentials callback), kategória/termék CRUD DB-szinten (relációkkal együtt) és az admin listaoldalak helyes megjelenítése — utána a teszt adatok törölve.

### Következő lépések
- Kosár és checkout folyamat (Stripe EUR/HUF + megrendelés-only ág, 1M Ft-os szabály a checkoutban is).
- Termékkép-feltöltés az adminban (jelenleg csak URL-listaként kezelhető a `images` mező).
- Szerverre telepítés: Nginx Proxy Manager proxy host a `zw.formagyar.hu`-ra, teljes app konténer build+deploy.

## 2026-09-01 — Mobil finomhangolás + gombstílus az élő oldalról

- **Hamburger menü**: a fejléc (`site-header.tsx`) kliens-komponenssé alakítva, mobilon (`max-lg`) hamburger ikon nyit egy lecsúszó menüpanelt ugyanazokkal a linkekkel.
- **Hero mobilon**: a TÜV-jelvény bal felülre kerül (desktopon marad jobb alul).
- **Bizalmi sáv (TrustStrip)**: mobilon 2×2-es grid a korábbi tördelt sor helyett.
- **Terméklista szűrők**: a függőleges checkbox-lista helyett egységes méretű, vízszintesen tördelődő "chip" gombok (még csak vizuális, nincs bekötve valós szűréshez).
- **Termék név/ár**: mindenhol (kártyák, kiemelt termékek, részletező oldal) félkövér név + türkiz-zöld (`text-accent`) félkövér ár.
- **CTA gomb (Kosárba / Megrendelés leadása)**: `coprBlue` háttérszín + az élő oldal eredeti "Button Wave" mintázata — ezt kikerestem az élő Webflow-oldal CSS-éből (`Button Wave.svg`, buborék-motívumhoz illő finom hullámvonalak a gomb bal alsó sarkából), lementve ide: `public/brand/button-wave.svg`. Ugyanaz a márka-eszköz, amit az élő oldal is használ.
- **Favicon/webclip**: bekötve a Next metaadatokba (`public/favico.png`, `public/webclip.png`), mindkét gyökér-layoutban (`[locale]` és `admin`).
- Ellenőrzés: production build + fejtelen Chrome screenshotok (mobil 390px, desktop 1440px) egy elkülönített worktree-ben — a `.next` nem keveredett a felhasználó saját dev szerverével.
