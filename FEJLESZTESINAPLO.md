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

## 2026-09-01 — GitHub repó + szűrő/ár finomítás

- Projekt feltöltve GitHubra: `git@github.com:vzsozs/zedonwellness.git`, `origin/master` követve. Mostantól minden commit után `git push`.
- **Terméklista szűrők**: desktopon (`lg+`) visszaállt az eredeti bal oldali checkbox-lista; mobilon marad a vízszintes chip-sor, most már teljes szélességben (`flex-1`, `min-w-35`, mobilon tördelődik).
- **Termékkártyák** (lista nézet): nagyobb név (`text-lg`) és ár (`text-xl`), az ár mindenhol `font-extrabold` (kártyák, kiemelt termékek, részletező).
- **Mobil hamburger menü**: kereső beviteli mező a menü alján.

## 2026-09-01 — Nyilvános oldal bekötve a valós adatbázisra

Eddig az admin a valós DB-be írt, de a nyilvános oldal (főoldal, terméklista, termékrészletező) még mindig a `src/lib/catalog.ts` statikus placeholder-fájlból olvasott — ez a rés most be lett zárva, **innentől amit az adminban felviszel, az azonnal megjelenik az élő oldalon** (max ~60 mp-es cache miatt, ld. lentebb).

- **Séma-bővítés** (migráció `0001`): `products.series` (sorozat, pl. "HC Design" — ez adja a szűrőchipeket is), `products.subtitleHu`/`subtitleEn` (rövid alcím a kártyákon, pl. "6 fő · 220×220 cm"), `categories.descriptionHu`/`descriptionEn` (a kategória oldal fejlécében megjelenő leírás). Admin formok frissítve ezekkel.
- **`src/lib/catalog.ts` törölve** — helyette valós Drizzle-lekérdezések a `CategoryGrid`, `FeaturedProducts`, `/[category]` és `/termek/[slug]` oldalakon.
- **Vizuális fallback-ek** (`src/lib/visuals.ts`): a 4 ismert kategóriaslug (jakuzzik, szaunak, grillek, kiegeszitok) megtartja a mockup-beli egyedi gradienst/ikont; bármilyen új, adminban létrehozott kategória egy alapértelmezett vizuált kap. Termékeknél, ha nincs feltöltött kép, egy determinisztikus (ID alapú) gradiens-placeholder jelenik meg — amint van kép a `images` mezőben, azt mutatja.
- **Badge-logika**: a "ÚJDONSÁG"/"AKCIÓ" jelölés mostantól az admin `isNew`/`isOnSale` kapcsolóiból származik, nem hardcode-olt adatból.
- **Build-idejű DB-függőség megszüntetve**: a `generateStaticParams` eltávolítva a locale layoutból és a kategória/termék oldalakról — enélkül a `next build` (és így a Docker image build is) nem igényel élő DB-kapcsolatot, ami fontos, mert a Docker build fázisban a `db` konténer még nem feltétlenül érhető el. Az oldalak helyette kérésre renderelődnek, `revalidate = 60` (ISR-szerű cache) — ezért van a fenti ~60 mp-es késleltetés az admin-módosítások megjelenésében.
- Végig tesztelve egy elkülönített worktree-ben: production build DB-kapcsolat nélkül lefut, majd valós kategória+termék rekord a dev DB-be seedelve, és ellenőrizve, hogy a főoldal, terméklista és termékrészletező helyesen jeleníti meg (1M Ft-os szabály, badge, specifikáció, sorozat-szűrő) — utána a teszt adatok törölve.

### Következő lépések
- Kosár és checkout folyamat (Stripe EUR/HUF + megrendelés-only ág).
- Szerverre telepítés: Nginx Proxy Manager proxy host a `zw.formagyar.hu`-ra, teljes app konténer build+deploy.

## 2026-09-01 — 3 minta termék felvitele

A user kérésére a fejlesztő közvetlenül (script útján) felvitte a 3 korábban javasolt minta terméket + a hozzájuk tartozó 3 kategóriát a valós DB-be (jakuzzik/HC Design 5, szaunak/Hanscraft hordószauna, grillek/BULL grill), az élő Webflow-oldal saját CDN-jéről származó valós termékfotókkal. Ellenőrizve mind a fejlesztői worktree-ben, mind a user saját dev szerverén — mindkettő megjeleníti.

## 2026-09-01 — Admin felület nagy bővítése (feltöltés, sorozat-kezelés, konfigurációs opciók)

A user átnézte a jelenleg is élő `zedonwellness.com/termekek/hc-1` terméket, és ez alapján bővítettük az admint — a Webflow-oldal hamarosan megszűnik, ezért **onnantól semmilyen külső (Webflow CDN) linket nem szabad használni**, mindennek saját feltöltésből kell jönnie.

- **Valódi képfeltöltés** (URL-lista helyett): főkép + galéria (egyéb képek), fájlválasztóval. **Fontos technikai buktató, amit menet közben találtunk és javítottunk**: a Next.js `standalone` szerver a `public/` mappa tartalmát csak **indításkor** olvassa be — egy futás közben odaírt fájl 404-et adott volna egészen a konténer újraindításáig. Megoldás: a feltöltött fájlok mostantól a `public/`-on **kívül**, egy `uploads/` mappában tárolódnak (Docker volume, gitignore-olva), és egy dedikált route handler (`src/app/uploads/[...path]/route.ts`) szolgálja ki őket — ez minden kérésnél frissen olvas a lemezről, tehát azonnal működik újraindítás nélkül is. Ezt éles `standalone` szerverrel (nem `next start`-tal, ami nem támogatott ezzel a configgal) le is teszteltem: a hiba reprodukálva, majd a javítás igazoltan működik.
- **Sorozatok (Series) valós táblává alakítva** (`product_series`, kategóriánként): a termék felviteli formon mostantól legördülő menü, ami a választott kategóriától függően szűri a listát — nem lehet elgépelni. A sorozatokat az **admin/kategóriák** oldalon (a kategória szerkesztésekor) lehet felvenni/törölni, ahogy kérted. A meglévő szöveges `series` mezők adatai átmigrálva az új táblába, a régi oszlop törölve.
- **Slug mező alapból zárolva** (lakat ikon oldja fel), és **automatikusan generálódik a HU névből** gépelés közben — véletlen felülírás ellen.
- **Új mezők**: `sku` (cikkszám), rövid leírás (HU/EN, kártyákhoz) a meglévő hosszú leírás mellett, `threeDArUrl` (3D/AR link), **konfigurációs opciók** (ingyenes választási csoportok, pl. "Héj színe: Fehér, Szürke, Fekete" — a `hc-1` oldalon látott Keret/Sarok/Héj/Tető színválasztók mintájára) és **rendelhető extrák** (saját árral, pl. "Lépcső: 59990" — a `hc-1` oldal árazott kiegészítő listája alapján). Mindkettő egyelőre strukturált szöveges mezőként (ugyanaz a minta, mint a már bevált `specs` mezőnél) — **a vásárlói oldali kiválasztó felület (ár-újraszámolással) még nincs megépítve, ez explicit később jön, amikor odaérünk.** A termékoldal egyelőre csak megjeleníti ezeket (nem interaktív).
- **Admin elrendezés szélesítve**: a kategória/termék form korábban `max-w-md`/`max-w-2xl`-re volt korlátozva, ami üres helyet hagyott az oldalsáv mellett — most kitölti a rendelkezésre álló szélességet (pl. a kategória szerkesztő 2 hasábos: form + sorozat-kezelő egymás mellett).
- **Fontos infra-felfedezés**: a next-auth `AUTH_TRUST_HOST=true` env változó nélkül **"UntrustedHost" hibával elutasítja a bejelentkezést**, amint nem a legalapértelmezettebb host/port konfiguráción fut (reverse proxy, egyedi port) — ez éles környezetben (Nginx Proxy Manager mögött) mindenképp kellett volna, jó, hogy most derült ki. Hozzáadva a `.env.example`-hez és a helyi `.env.local`-hoz is.
- Migráció: a `series` szöveges mező → `seriesId` FK átállás két lépcsőben történt (előbb csak hozzáadás, majd a régi oszlop külön migrációban törölve), mert a `drizzle-kit generate` az átnevezés-detektáláshoz interaktív terminál promptot igényelt volna, ami a nem-interaktív környezetben nem futtatható.
- Végig tesztelve egy elkülönített worktree-ben, **a tényleges `node .next/standalone/server.js` induló paranccsal** (nem `next start`, mert az nem támogatja a standalone configot) — admin bejelentkezés, sorozat-kezelés, termék szerkesztő form (minden új mező jelen van, slug írásvédett, meglévő kép megjelenik), és a feltöltési route valóban kiszolgál egy indítás után hozzáadott fájlt.

### Következő lépések
- Kosár és checkout folyamat (Stripe EUR/HUF + megrendelés-only ág).
- Vásárlói oldali konfigurációs opció-választó (a `variantOptions`/`extras` adatokra épülve, ár-újraszámolással).
- Szerverre telepítés: Nginx Proxy Manager proxy host a `zw.formagyar.hu`-ra, teljes app konténer build+deploy — ekkor kell majd az `uploads/` mappát is perzisztens volume-ként bekötni (`docker-compose.yml`-ben már megvan).

## 2026-09-01 — GitHub repó feltöltve

Létrejött a projekt GitHub repója: `git@github.com:vzsozs/zedonwellness.git`. `origin/master` beállítva, minden eddigi és jövőbeli commit ide pusholva.

## 2026-09-01 — Admin "kreativitási kör": valódi widgetek a szöveges trükkök helyett

A user visszajelzése szerint az előző admin-bővítés még "fapados" volt (textarea-alapú, sor-parse-olós mezők) — ez a kör ezeket lecseréli valódi, interaktív felületre.

- **Képgaléria**: feltöltéskor azonnali előnézet (böngésző-oldali object URL, nem kell megvárni a mentést), **csillag ikonnal** kijelölhető a főkép, **fel/le nyilakkal** állítható a sorrend — egy egységes listában (nincs többé külön főkép/galéria mező). Technikai megoldás: a kliens-komponens minden képet stabil kulccsal azonosít (nem tömbindexszel), hogy törlés/átrendezés közben ne csúszhasson el, melyik kép a főkép; az újonnan választott fájlokat egy `DataTransfer`-rel szinkronban tartott valódi `<input type="file">` viszi a submitba.
- **Specifikáció**: két beviteli mezős, dinamikusan bővíthető sorok (Címke | Érték, "Sor hozzáadása" gombbal) — a korábbi "Címke: érték soronként" textarea helyett. Adatszerkezet `Record<string,string>` → rendezett `{label, value}[]` tömbre változott, a meglévő 3 termék adatai át lettek konvertálva.
- **Konfigurációs opciók** (Héj színe / Sarok elem / Oldalborítás, a `hc-1` minta alapján): csoportok, mindegyik választásnál **fotó-feltöltés + név** — nem csak szöveg, mert az élő oldalon is fotós színválasztó van.
- **Extrák valódi, globális katalógussá alakítva**: új `extras` tábla + `product_extras` kapcsolótábla, saját **"Extrák" oldalsáv-menüpont** alatt szerkeszthető (ahogy kérted) — a termék szerkesztésénél már csak pipálni kell a listából, nem kell újra begépelni a nevet/árat minden termékhez.
- **Fontos hiba, amit tesztelés közben találtunk és javítottunk élesítés előtt**: a "melyik kép a főkép" azonosítás tömbindex alapján történt volna, ami átrendezés/törlés után rossz képet jelölt volna ki főképnek. Csak azért derült ki, mert nem csak a felületet, hanem a **teljes mentési logikát is végigteszteltem** (nem csak azt, hogy megjelenik-e a form) — a kliens JSON payloadba és a szerver oldali feldolgozásba is bekötöttük a stabil kulcsot, a hiba nem jutott ki éles kódba.
- **Tesztelési módszer**: mivel a böngésző Server Action HTTP-protokollját kézzel szimulálni korábban ebben a projektben megbízhatatlannak bizonyult, ezúttal közvetlenül meghívtam a `createProduct`/`updateProduct` függvényeket egy a valós formhoz pontosan hasonló `FormData`-val (**valódi fájlfeltöltéssel** is — egy galéria-kép és egy variáns-fotó), majd visszaolvastam az adatbázisból az eredményt (`mainImage`, `images`, `specs`, `variantOptions`, `extras` mind helyesen landolt), és lekértem a feltöltött fájlokat a `/uploads` route-on is.
- **Fontos**: ez a teszt a megosztott dev-adatbázis ellen futott (ugyanaz, amit a te dev szervered is használ), így a `hc-design-5` termék átmenetileg teszt-nevet és törött képet kapott — ezt azonnal helyreállítottam az eredeti valós adatokra, a teszt-extrákat és a teszt admin fiókot is töröltem.

### Következő lépések
- Néhány valós termék felvitele az adminon keresztül (a user viszi fel a maradék terméket, most már valódi képfeltöltéssel, sorozat-választóval, extrákkal).
- Kosár és checkout folyamat (Stripe EUR/HUF + megrendelés-only ág).
- Vásárlói oldali konfigurációs opció-választó (a `variantOptions`/`extras` adatokra épülve, ár-újraszámolással).
- Szerverre telepítés: Nginx Proxy Manager proxy host a `zw.formagyar.hu`-ra, teljes app konténer build+deploy — ekkor kell majd az `uploads/` mappát is perzisztens volume-ként bekötni (`docker-compose.yml`-ben már megvan).

## 2026-09-01 — Hibajavítás: képfeltöltés összeomlás + extrák kép/kártya

- **Hiba javítva**: a termék-adminban a Héj színe (variáns) opcióhoz kép feltöltésekor a mentés "An unexpected response was received from the server" hibával elszállt. Ok: a Next.js Server Actionök alapértelmezett **1 MB-os** kérésméret-korlátja — egy valódi fotó simán túllépi. Megoldás: `next.config.ts`-ben `experimental.serverActions.bodySizeLimit` felemelve `20mb`-ra (illeszkedik a `src/lib/upload.ts` 8 MB-os fájlonkénti korlátjához, több fájlos submitokra is elég hellyel). **Megjegyzés**: ezt a konkrét javítást nem tudtam böngésző nélkül, HTTP-szinten végigtesztelni — a Next.js `bind()`-olt Server Actionök kérés-kódolását kézzel (curl-lal) nem sikerült megbízhatóan reprodukálni (ismét, ahogy korábban a projektben már tapasztaltuk), úgyhogy ez a dokumentált, tünetre pontosan illő szabványos javítás, de a user böngészőjében kér végső megerősítést.
- **Extrák**: kép mező hozzáadva (`extras.imageUrl`, migráció `0006`), az admin "Extrák" oldal kártyás elrendezésre váltva (kép + név + ár + sorrend, mentés/törlés soronként).
- **Extrák a főoldalon**: új szekció (`ExtrasSection`) a Kiemelt termékek alatt, kártyaként jeleníti meg az extrákat (kép, név, ár) — ahogy kérted.
- Végig tesztelve egy elkülönített worktree-ben (build, majd az extrák kép-feltöltés + főoldali megjelenítés end-to-end ellenőrizve) — a teszt adatok törölve.

### Nyitott kérdés a userhez
A user felvetett egy nagyobb jövőbeli funkciót: a termékoldalon interaktív konfigurátor (opciók/extrák kattintással kiválaszthatók, validáció, ha valami hiányzik), plusz egy mindig látható, felfelé "kitapadó" ár+kosár sáv mobilon és desktopon is. Ez a `variantOptions`/`extras` adatokra épülne, de a tényleges kosár/checkout rendszer (Stripe) még nincs megépítve — ennek időzítéséről/terjedelméről a fejlesztő visszakérdezett a usernél, mielőtt nekilátna. **Válasz**: a user egyelőre elhalasztja, előbb a termékfelvitel és az alapozás fejeződjön be.

## 2026-09-01 — Hibajavítás: SVG feltöltés + kulturált hibaüzenet (nem lefagyás)

A user egy SVG-fájlt próbált feltölteni egy extra ikonjaként, és az admin oldal lefagyott ("An unexpected response was received from the server").

- **Gyökérok**: az SVG nem szerepelt az engedélyezett képformátumok között (`src/lib/upload.ts`), a `saveUploadedImage()` ilyenkor egy sima `Error`-t dobott — ezt viszont semelyik form nem kezelte (egyik sem használt `useActionState`-et), így a dobott hiba egyenesen a Next.js generikus hibakezeléséig jutott, ami a felhasználó szemszögéből "lefagyásnak" tűnt.
- **SVG mostantól feltölthető** (kép-feltöltő mezők mindegyikén: termék galéria, konfigurációs opció fotó, extra kép). Mivel az egész projektben minden feltöltött képet kizárólag `<img src>`-en keresztül jelenítünk meg (soha `<iframe>`/`<object>`/közvetlen linkként), a böngészők nem futtatják le az esetlegesen beágyazott `<script>` tag-eket SVG-ben — extra védelemként mégis hozzáadva `X-Content-Type-Options: nosniff` és `Content-Security-Policy: script-src 'none'` fejléc a `/uploads` route válaszához.
- **Kulturált hibakezelés bevezetve mindenhol, ahol képfeltöltés történik** (termék létrehozás/szerkesztés, extra létrehozás/szerkesztés): új közös minta (`src/lib/action-state.ts` + `src/components/admin/error-modal.tsx`) — a szerver action mostantól soha nem dob nyers hibát, hanem `{error: "..."}` állapotot ad vissza, amit a form `useActionState`-tel fogad és egy bezárható modal ablakban jelenít meg ("Hiba történt" cím + a tényleges üzenet + "Rendben" gomb). Az oldal többi része érintetlen marad, nincs több lefagyás.
- Az Extrák admin oldal emiatt kliens-komponensekre lett bontva (`ExtraCard`, `NewExtraForm`), mert a `useActionState` ezt megköveteli.
- Végig tesztelve egy elkülönített worktree-ben: a user saját, valódi `ico_audio.svg` fájljával (nem szintetikus teszt-fájllal) — a feltöltés, DB-mentés, kiszolgálás (helyes `image/svg+xml` content-type-pal és az új biztonsági fejlécekkel) és a főoldali megjelenítés mind működik. Egy túl nagy (9 MB) fájllal is teszteltem — helyes hibaüzenetet ad, nem ír hibás rekordot az adatbázisba.
- **Módszertani tanulság magamnak**: ez a teszt egy valós, megtartásra érdemes extrát hozott létre ("Audio rendszer", az élő `hc-1` oldal áraival) — de mivel a worktree-t a teszt után törlöm, a hozzá tartozó feltöltött fájl a `/tmp/zw-preview/uploads/`-ban veszett volna, miközben az adatbázis (megosztott, távoli) már rá mutatott. Kézzel kellett pótolnom a fájlt a fő projekt `uploads/` mappájába. Legközelebb, ha egy worktree-teszt olyan feltöltést hoz létre, amit érdemes megtartani, a fájlt a worktree törlése előtt át kell másolni.

## 2026-09-01 — Duplikált kép, lightbox galéria, kártyás extrák a termékoldalon

A user kipróbálta a javított feltöltést, és három visszajelzést hozott: (1) egy feltöltött kép duplikáltan jelent meg, (2) a termékoldali galéria képei nem kattinthatók, ide egy lightbox kellene, (3) az admin Extrák kártyáin a képek kilógnak, és a termékoldalon (a "Rendelhető extrák" alatt) is kártyás megjelenést szeretne, az élő `hc-1` oldal mintájára.

- **Duplikált kép — valódi hiba, megtalálva és javítva**: az `ImageGalleryField.addFiles()` egy `setSlots(...)` hívást ágyazott be egy `setNewFiles(...)` frissítő-függvényébe — ez klasszikus React-tisztasági szabálysértés. A React (Strict Mode-ban, amit a Next dev szervere alapból bekapcsol) szándékosan kétszer hívhatja meg az ilyen frissítő-függvényeket, hogy pont az ilyen hibákat kiszúrja — itt ez azt jelentette, hogy a beágyazott `setSlots` hívás ténylegesen kétszer futott le, duplán hozzáadva a frissen feltöltött képet. Javítva: mindkét állapotfrissítés a hívás előtti állapotból számolva, egymástól függetlenül, beágyazás nélkül.
- **Lightbox galéria a termékoldalon**: új kliens-komponens (`src/components/product-gallery.tsx`) — miniatűrre kattintva vált a nagy kép, a nagy képre (vagy nagyító ikonra) kattintva teljes képernyős lightbox nyílik (előző/következő nyilak, számláló, ESC/kattintás-kívülre/X bezárás, nyíl billentyűkkel navigálás).
- **Extrák kártyaként a termékoldalon is**: megosztott `src/components/extra-card.tsx` komponens, amit most már a főoldal ÉS a termékoldal "Rendelhető extrák" szekciója is használ — ugyanaz a kártyastílus mindkét helyen.
- **Kilógó képek javítva**: minden `object-cover`-es `<img>` köré explicit `overflow-hidden` konténer került (admin galéria-miniatűrök, konfigurációs opció fotók, extra-kártyák, terméklista-miniatűr) — védőháló arra az esetre, ha egy kép (főleg SVG, aminek szokatlan lehet a natív mérete) valamiért nem férne bele tisztán az `object-fit`-tel.
- Végig tesztelve egy elkülönített worktree-ben: build, majd screenshot a termékoldalról a **user saját, valós feltöltött tartalmával** (Héj színe / Sarok elem swatch-ok, Audio rendszer extra-kártya) — minden kilógás nélkül, helyesen jelenik meg. A duplikált kép hiba maga kliens-oldali React állapotkezelési hiba volt, ezt csak kód-szinten (helyes, jól ismert React-mintával) tudtam javítani és ellenőrizni — böngésző nélkül nem reprodukálható/futtatható újra ebben a környezetben.
- Eközben a user több valós termékfotót és variáns-swatchot (keret/héj/sarok szín) is berakott a `public/` mappába (HC Design 5-höz) — ezek most a repóban vannak, de még nincsenek felöltve/hozzárendelve a termékhez az adminon keresztül.

## 2026-09-01 — Termékoldal: kétoszlopos elrendezés a régi oldal mintájára

A user egy screenshotot küldött a régi `zedonwellness.com/termekek/hc-1` oldalról, és kérte, hogy az új termékoldal kövesse ezt az elrendezést: bal oldalt szöveg (cím, leírás, ár, gomb, paraméter-táblázat), jobb oldalt egymás alatt a vizuális blokkok (fő kép/galéria, 3D/AR, opció-csoportok kép-választóként, rendelhető extrák kártyaként).

- **`src/app/[locale]/termek/[slug]/page.tsx` átstrukturálva**: a korábbi "kép balra, szöveg jobbra" elrendezés helyett most `flex-row-reverse` konténer — DOM-sorrendben a vizuális oszlop van elöl (`ProductGallery` → 3D/AR link-kártya, ha van `threeDArUrl` → minden `variantOptions` csoport saját címmel és swatch-ráccsal → "Rendelhető extrák" kártyarács), utána a szöveges info-oszlop (sorozat eyebrow, cím, rövid+hosszú leírás, TÜV Rheinland embléma, ár, megrendelés/kosár gomb, "Paraméterek" táblázat). A `flex-row-reverse` trükk miatt asztali nézetben a szöveg jelenik meg balra / kép jobbra (a screenshot szerint), mobilon (`max-lg:flex-col`) viszont a normál DOM-sorrend érvényesül, tehát a kép marad felül, szöveg alul — így a mobil UX nem romlott.
- A korábban külön "Konfigurációs opciók" gyűjtő-blokk megszűnt: minden `variantOptions` csoport (pl. "Héj színe", "Sarok elem") most saját önálló szekció, saját coprBlue eyebrow-címmel — pontosan úgy, ahogy a régi oldalon az "OLDALBORÍTÁS" / "SAROK ELEM" / "HÉJ OPCIÓK" külön blokkok voltak.
- A "Rendelhető extrák" szekció bekerült a jobb oszlop aljára (korábban külön, teljes szélességű fehér háttérrel volt); most a megosztott `ExtraCard`-dal, 2 oszlopos rácsban.
- A `ProductGallery` gyökér `div`-jéről levéve a fix `w-165` szélesség (`w-full`-ra cserélve), mert most már a jobb oszlop `flex-1`-je adja a szélességét, nem önálló flex-testvérként ül a régi elrendezésben.
- A "Kapcsolat" szekció (korábban a specifikáció mellett volt) önálló, teljes szélességű blokká vált a két oszlop alatt.
- **Tesztelés**: elkülönített `git worktree` (`/home/zsozs/Asztal/MUNKA/Zedonwellness/zw-preview`, nem `/tmp` — a Turbopack build symlinkelt `node_modules`-t nem fogadott el a `/tmp`-be mutató worktree-ből, ezért btrfs reflink-kel valódi másolat készült a `node_modules`-ról). Fontos hiba, amit itt találtam és javítottam: a standalone szerver induláskor `process.chdir()`-el átvált a `.next/standalone` mappára, így a projekt gyökerében lévő `.env.local` nem töltődött be — emiatt a DB-kapcsolat `ECONNREFUSED`-dal elszállt. Megoldás (csak a teszthez): a `.env.local` bemásolása a `.next/standalone` mappába is. (Ez éles Docker-deploynál nem probléma, ott a compose/env-fájlok külön vannak kezelve.) Build sikeres, a standalone szerver valós DB-adatokkal (`hc-design-5`, a user saját Héj színe/Sarok elem/Audio extra adataival) helyesen szolgálta ki az oldalt — HTML-válaszban ellenőrizve, hogy minden szekció (Paraméterek, Rendelhető extrák, TÜV embléma, variáns-csoportok) a megfelelő helyen és sorrendben jelenik meg. Böngészős vizuális ellenőrzés ezúttal nem volt elérhető (a Chrome-bővítmény nem csatlakozott), ezért a userrel is meg kell erősíttetni a végeredményt élőben.

## 2026-09-01 — Extrák kártya: torz ikonkép javítva

A user screenshotot küldött az élő (frissített) termékoldalról: a "Rendelhető extrák" kártyán az "Audio rendszer" ikon egy csúnya, kinyújtott kék hullámmintaként jelent meg a kártya teljes szélességében, ahelyett hogy egy tiszta, kis ikon lenne — ez rontotta az egyébként már jól álló kétoszlopos elrendezést.

- **Gyökérok**: az `ExtraCard` (mind a publikus, mind az admin változat) a kép konténerét `object-cover`-rel jelenítette meg — ez egy kis, natív méretű ikon-SVG-t (mint az "Audio rendszer" korábban feltöltött `ico_audio.svg`-je) drasztikusan felnagyítva, kivágva tölti ki a teljes kártyaszélességet, torz, felismerhetetlen foltot eredményezve.
- **Javítás**: a kép terület `object-contain`-re váltva, középre igazítva, belső paddinggel, világos háttéren — így egy kis ikon szépen, arányosan, keretben jelenik meg (ez egyébként jobban is illeszkedik az eredeti `hc-1` referencia-oldal stílusához, ahol az extrák is kis, keretezett ikonok voltak, nem teljes kitöltésű fotók). Javítva mindkét helyen: `src/components/extra-card.tsx` (publikus, főoldal + termékoldal) és `src/app/admin/(protected)/extras/extra-card.tsx` (admin lista).
- **Termékoldali extrák rács is javítva**: a korábbi `grid-cols-2` helyett `flex flex-wrap` fix szélességű (`w-52`) kártyákkal — így egyetlen extránál nem marad egy furcsa, félig üres oszlop, hanem a kártya csak annyi helyet foglal, amennyi kell, és igény szerint tördelődik.
- **Tesztelés**: ismét elkülönített worktree-ben (`preview-extras-fix` branch). Ezúttal a Chrome-bővítmény sem csatlakozott, de a gépen elérhető `google-chrome --headless=new --screenshot=...` paranccsal sikerült valódi vizuális screenshotot készíteni a futó standalone szerverről — ez új, hasznos módszer, ha a bővítmény nem elérhető. Közben egy második, korábban nem dokumentált gotcha is előjött: a standalone szerver `process.chdir()`-je miatt nemcsak az `.env.local`, hanem a feltöltött fájlokat kiszolgáló `/uploads` route `UPLOADS_ROOT`-ja is a `.next/standalone` mappához relatív (`process.cwd()`-ből számolva) — a teszthez a valós `uploads/` mappát ide kellett másolni (`.next/standalone/uploads/`), nem a worktree gyökerébe. Ellenőrizve asztali és mobil nézetben is: a torz kép eltűnt, tiszta, keretezett ikon látszik, a kártya mérete arányos, mobilon teljes szélességet foglal el.

## 2026-09-01 — Termékoldal finomhangolás: React kulcs-hiba, 50/50 oszlopok, külön lightbox

A user egy React konzolhibát (`Encountered two children with the same key`) és több vizuális/UX finomítást kért a termékoldalon.

- **Duplikált kulcs hiba — gyökérok megtalálva**: a `products.mainImage` mező ugyanazt az URL-t tárolja, ami a `products.images` tömbben is szerepel (a főkép csak "kijelölés", nem külön fájl) — a `[product.mainImage, ...product.images]` összefűzés emiatt ugyanazt a képet kétszer adta hozzá a galéria-tömbhöz, a React pedig ezen a duplikált URL-en akadt ki kulcsként. Javítás: `[...new Set(...)]` az `allImages` összeállításánál (`termek/[slug]/page.tsx`), plusz védőháló gyanánt a galéria és a szerkeszthető listák mindenhol `${src}-${i}` összetett kulcsot használnak index-szel, sima URL helyett.
- **Kétoszlopos elrendezés valódi 50/50-re állítva**: a korábbi fix szélességű (`w-105`) szöveg-oszlop + `flex-1` kép-oszlop helyett most `grid grid-cols-2 gap-14` — mindkét oszlop pontosan a rendelkezésre álló hely felét kapja. A "kép elöl mobilon" viselkedést a korábbi `flex-row-reverse` trükk helyett `order-1`/`order-2` (asztali) és `max-lg:order-2`/`max-lg:order-1` (mobil) párossal oldottam meg — ugyanaz a hatás, tisztább CSS.
- **Főkép mérete és vágása javítva**: a főkép doboza fix magasságú marad (asztalin nagyobb, mobilon kisebb), de a kép most `object-contain`-nel jelenik meg `object-cover` helyett — így soha nem vágódik le, akárhogy is arányos az eredeti fotó, és nem nőhet a doboz méretén túlra sem.
- **Galéria és lightbox szétválasztva**: eddig a bélyegképre kattintva a FŐKÉP cserélődött ki — mostantól a főkép fix marad, és a bélyegképre (vagy magára a főképre) kattintva egy önálló, teljes képernyős lightbox nyílik (előző/következő nyilak, ESC, számláló). Új, megosztott komponens: `src/components/image-lightbox.tsx` (a korábban a `ProductGallery`-be zárt lightbox-logika ebbe lett kiemelve).
- **Héj színe / Sarok elem swatch-ok is kattinthatók lettek**: új kliens-komponens (`src/components/variant-option-group.tsx`) — minden opció-csoport (pl. "Héj színe") saját lightbox-példányt kap, ami csak az adott csoport képei között lapoz. A swatch-kép nélküli választásokat (nincs kép) nem lehet rákattintani.
- **Rendelhető extrák kártya**: keret most `border-coprBlue` (kék), a kártya tartalma (név, ár) középre igazítva, az ikon/kép körüli szürke háttérdoboz eltávolítva (SVG-knek nincs többé látható háttere) — mind a publikus (`extra-card.tsx`), mind az admin (`admin/extras/extra-card.tsx`) kártyán.
- **Termék neve**: nagyobb (40px), félkövér helyett extra vastag, és coprBlue színű lett (korábban fekete, kisebb betűméret).
- Végig tesztelve egy elkülönített worktree-ben: build sikeres, a valós `uploads/` mappa bemásolva a standalone szerver alá, `google-chrome --headless` screenshot asztali (1400px) és mobil (420px) nézetben is — az elrendezés, a főkép mérete/vágása, a swatch-ok, az extra-kártya stílusa és a cím mind a kérésnek megfelelően jelenik meg. A lightbox interakciót (kattintás → nyílás, nyilak, bezárás) böngésző-automatizálás nélkül nem tudtam élőben kipróbálni, ez kódszinten van csak ellenőrizve — érdemes a userrel megerősíttetni.

## 2026-09-02 — Infrastruktúra: elakadt SSH-alagút a dev DB-hez (kétszer)

A user kétszer is jelezte, hogy a `localhost:3000` nem válaszol.

- **Első alkalom, összetett, három rétegű hiba**, amit részben magam okoztam: (1) egy korábbi `npm run build` futtatás véletlenül a user élő fejlesztői mappájában (nem elkülönített worktree-ben) történt, ami összekavarta a megosztott `.next` mappát — ezt azonnal jeleztem és helyrehoztam; (2) korábbi worktree-teszt szerverpéldányok árván maradtak (nem álltak le rendesen), és lefoglalva tartottak DB-kapcsolatokat a megosztott SSH-alagúton keresztül; (3) a `src/db/index.ts`-ben a `pg.Pool` nem volt HMR-biztos — minden Next.js Fast Refresh újra példányosíthatta, szivárogtatva a kapcsolatokat. Mindhármat javítottam: leölt árva folyamatok, `globalThis`-alapú pool-singleton bevezetve (túléli a Fast Refresh-t), `.next` törölve és a szerver újraindítva.
- **Második alkalom**: ugyanez a tünet, de más ok — maga a helyi SSH-alagút (`ssh -L 127.0.0.1:5434:127.0.0.1:5434 ...`) állt le protokoll-szinten (a TCP-port helyben válaszolt, de a Postgres-handshake sosem futott le rajta), miközben a távoli Postgres-konténer teljesen egészséges volt. Megoldás: az elakadt alagút-folyamat leállítása és egy friss újraindítása. **Tanulság**: ez a manuális SSH-alagút nem öngyógyuló — ha megint leáll, ugyanez a lépés (kill + újraindítás) oldja meg; hosszabb távon egy `autossh`-alapú, systemd által felügyelt alagút megszüntetné ezt a visszatérő súrlódást (a user egyelőre nem kérte, hogy építsem meg).

## 2026-09-02 — Termékkártya-redesign, kategória-szűrők, kosár+checkout (Stripe nélkül), SKU-változatok, raktárkészlet, kétnyelvűsítés

Egy hosszabb, több lépésben bővülő munkamenet: a termékkártyák új designja, a kategória-szűrők tényleges bekötése, majd — a user kifejezett kérésére — a teljes kosár/checkout folyamat felépítése (Stripe nélkül), egy új "igazi SKU-változat" funkció (ár/súly/SKU is eltérhet változatonként, pl. illatok), raktárkészlet-kezelés, és végül az összes új oldal kétnyelvűsítése.

### Termékkártya (kategória- és kapcsolódó termék-listák)
- Több iterációban finomítva a user visszajelzései alapján: világoskék (`#f2f8fd`) → végül **fehér** alapszín; a kép `object-cover`+`aspect-square`-re állítva (a termékfotók jellemzően 1:1 arányúak, így nem vágódnak csúnyán); a kártya szélessége fokozatosan **70%-ra** csökkentve (kifejezett kérésre, "jóval keskenyebb"); az ár színe `text-accent`-ről **coprBlue**-ra váltva; a szöveges rész sorrendje kép → ár → név → rövid leírás (a korábbi sorozat-felirat/alcím helyett).
- Admin oldalon új, a főképtől független **"kártyakép" választó** (`products.cardImage`, migráció `0007`) — a képgalériában egy második ikon (rács) jelöli ki, melyik kép jelenjen meg a listákon; ha nincs külön kijelölve, a főképre esik vissza.

### Kategória-szűrők ténylegesen bekötve
- **Sorozat**: checkbox-ok most valóban `seriesId` szerint szűrnek (korábban csak vizuális volt).
- **Férőhely**: új strukturált `products.capacity` mező (migráció `0008`) — a user kérésére *nem* a szöveges alcímből próbáljuk kitalálni, hanem az adminban külön szám mezőként adható meg; a checkbox-lista a kategóriában ténylegesen előforduló értékekből generálódik.
- **Ár**: a korábbi két beviteli mező helyett valódi **kettős csúszka** (`price-range-slider.tsx`, saját CSS a `globals.css`-ben, natív, overlappelő `<input type="range">` páros) — a kategória tényleges ár-tartományából számolt határokkal, csak akkor jelenik meg, ha van legalább két különböző árú termék.
- A szűrő doboz háttere mindenhol (asztali + mobil) `#f2f8fd`.

### Kosár + Checkout (Stripe nélkül)
A user kérése: a kosár/checkout folyamatot addig a pontig kell megépíteni, ameddig lehet Stripe nélkül; a szállítás kizárólag GLS, bel- és külföldre egyaránt, súly szerint sávosan, 40 kg felett mindig egyedi ajánlattal.
- **Kosár**: `src/lib/cart-context.tsx` — React Context + `localStorage`, bejelentkezés nélküli (guest) kosár. Kosártétel: termék + darabszám (+ opcionális SKU-változat, ld. lentebb) — a korábban elhalasztott ár-újraszámoló konfigurátor (opciók/extrák) ezúttal sem része, ahogy a user korábban kérte.
- **`/kosar`** és **`/penztar`** oldalak, valamint **`/rendeles-visszaigazolva`** köszönő/visszaigazoló oldal — a rendelés a meglévő `orders` táblába kerül `pending` státusszal, fizetés (Stripe) nélkül.
- **Szállítási díj (GLS)**: a `shipping_rates` tábla átalakítva a korábbi szabad szöveges "sáv" mezőről **zóna (belföld/külföld) + súlytól-súlyig** szerkezetre (migráció `0009`+`0010`), admin oldal (`/admin/shipping`) újraírva ehhez. Új `products.weightKg` mező (kg, opcionális) — ha egy terméknek nincs kitöltve a súlya, a rendszer **sosem tippel**: automatikusan egyedi ajánlatot jelez, nem számol (esetleg téves) díjat. Placeholder GLS-árak lettek feltöltve tesztelésre — **ezeket a valós árakra kell majd cserélni** az admin felületen.
- A rendelés végső összegét, súlyát és a szállítási díjat **mindig a szerver számolja újra** a kosárból kapott termék-/darabszám-adatokból (sosem bízik a kliens által küldött árban) — direkt szerver-akció hívásokkal (a projektben már bevált módszer) végigtesztelve több határesetre (5/15/35/45 kg, ismeretlen súly, külföldi cím).

### Termék SKU-változatok (pl. illatok) — új funkció
A user egy új terméket akart felvinni (Aqua Excellent Illataroma), aminél 12 illatváltozat van, mindegyiknek saját ára/SKU-ja/súlya/képe lehet — ez alapvetően más, mint a meglévő, ár nélküli "konfigurációs opció" (szín-swatch) funkció.
- Új `product_variants` tábla (migráció `0011`, majd `0012` a `inStock`-kal) — **külön** a meglévő, díszítő `variantOptions`-tól: név, SKU, ár, súly, kép, "alapértelmezett" jelölő változatonként; üresen hagyott ár/súly az anyatermékétől örököl.
- Admin: új "Termékváltozatok (SKU-k)" szerkesztő (`variant-skus-editor.tsx`) — soronként kép-feltöltés, név, SKU, ár, súly, "Alapértelmezett" rádiógomb.
- Termékoldal: ha egy terméknek van SKU-változata, megjelenik egy választó (kép+név), az ár és a "Kosárba" ez alapján frissül; a kosár/rendelés változatonként külön tételként kezeli, a végső ár/súly mindig szerver-oldalon, a kiválasztott variáns adatai alapján, újra lekérdezve.
- **Aqua Excellent Illataroma** felvitt, 12 illattal, új "Kiegészítők" kategória alatt (ez korábban nem létezett az adatbázisban, csak a menüben). Fontos korlát, amit tisztáztam a userrel: az élő oldalon valójában csak a Levendulához van saját fotó, a többi 11 illathoz nincs — ezeket a képeket a userének kell majd feltöltenie az admin új szerkesztőjében.

### Raktárkészlet (On/Off)
- **Termékszinten**: a korábban eldugott, alul lévő "Készleten" checkbox helyett egy jól látható **kapcsoló (toggle switch)** került a termék admin-űrlap tetejére (`toggle-switch.tsx`, saját, natív checkbox-ra épülő, `peer-checked` CSS-sel animált csúszka).
- **Változat-szinten** is: minden SKU-változatnak saját "Készleten" jelölője van — ha egy adott illat kifogy, csak az tiltható le, a többi rendelhető marad.
- Frontend hatás: kifogyott változat gombja letiltva, "(elfogyott)" jelzéssel; ha maga a termék nincs raktáron, az egész "Kosárba" gomb letiltva, magyarázó szöveggel; a terméklista-kártyákon "ELFOGYOTT" jelvény jelenik meg.

### Checkout: zóna automatikus felismerése + ország legördülő
A user kérése: a checkoutból vegyük ki a kézi zóna-választót (a cím alapján állapítsa meg automatikusan), és az elgépelés elkerülése végett az ország mező legördülő legyen, ne szabad szöveg.
- Új `src/lib/countries.ts` — ~30 ország (EU + néhány szomszédos piac, amerre a GLS ténylegesen szállít Magyarországról; nem a teljes ISO-lista), HU/EN névvel és kóddal.
- `zoneFromCountryCode()` — a zóna most az ország **kódjából** (nem szabad szövegből) dől el: `HU` = belföld, minden más = külföld. A checkout ország mezője `<select>`-té alakítva, a kiválasztott zóna felirat formájában látszik ("Szállítási zóna: Belföld/Külföld — automatikusan").

### Kétnyelvűsítés (HU/EN)
A user észrevette, hogy a ma épített új oldalak (kategória-szűrők, termékoldal vásárlási sávja, kosár, checkout, visszaigazolás) csak magyarul voltak — a főoldal mintája alapján (`next-intl`, `useTranslations`/`getTranslations`, `messages/hu.json` + `messages/en.json`) az összes új szöveg lefordítva, öt új namespace-szel (`common`, `category`, `product`, `cart`, `checkout`, `orderConfirmation`). A checkout szerver-oldali validációs hibaüzenetei is lokalizáltak (`getTranslations` a Server Actionön belül, kérésenként épített Zod-sémával). A termékek/kategóriák saját tartalma (név, leírás) továbbra sem lokalizált — ez már a főoldalon is így működött korábban is (`nameEn`/`descriptionEn` mezők megvannak az adatbázisban, de a kártyák/listák jelenleg mindig a HU mezőt mutatják) — ezt nem ez a kör bővítette, kimaradt a scope-ból.

**Tesztelés**: a teljes munkamenet alatt élesben, a futó dev szerveren ellenőrizve (curl + közvetlen szerver-akció hívások FormData-val) — kártya-redesign, szűrők (sorozat/férőhely/ár, minden határeset), rendelés leadása (belföld/külföld, súly-sávok, ismeretlen súly, kifogyott termék/változat), admin variáns-mentés (kép-feltöltéssel is), és a HU/EN oldalpárok tartalmi eltérése. **Egy dolgot nem tudtam ellenőrizni**: a checkout Server Action lokalizált hibaüzeneteit (a `getTranslations` Server Actionön belüli működését) nem lehetett a megszokott közvetlen-FormData-hívásos módszerrel tesztelni, mert ez a hívásmód nem fut valódi Next.js kérés-kontextusban, így a next-intl ottani, kérés-alapú locale-felismerése hibát dob — ez a projektben már korábban is tapasztalt, dokumentált korlátja ennek a teszt-módszernek (l. `revalidatePath` a korábbi bejegyzésekben), nem a kódban lévő hiba; ezt a userrel a böngészőben kell megerősíttetni.

## 2026-09-02 — Többnyelvű konfigurációs opciók/változatok, EUR-alapú extra- és termékárazás, MNB árfolyam-lekérés

A user négy dolgot kért egy körben: (1) a konfigurációs opciók és a SKU-változatok (illatok) is legyenek felvihetők angolul is, (2) az extrák ára euróban legyen megadható, forintban kiírva, (3) a termékeknél az euró legyen az alap bevitel, a forint ár "lakat alá" kerüljön (automatikusan számolva, de felülírható), (4) egy gombbal lekérhető legyen az MNB jegybanki középárfolyam, és minden számolt forint-érték kerekedjen a legközelebbi 10 Ft-ra.

- **Konfigurációs opciók (`variantOptions`) és SKU-változatok (`productVariants`) angol névvel**: mindkét admin szerkesztő (`variant-options-editor.tsx`, `variant-skus-editor.tsx`) kapott Név (EN) mezőt csoportonként/választásonként/változatonként — korábban a kód mindig üres string-et mentett EN névként, most valódi adat kerül bele. A frontend (`variant-option-group.tsx`, `product-actions.tsx`) is bekötve: a `localized()` helperrel a megfelelő nyelvet mutatja HU/EN termékoldalon.
- **Új admin "Beállítások" oldal** (`/admin/settings`, `src/lib/settings.ts` — általános kulcs-érték `settings` tábla, migráció `0013`) — itt tárolódik az EUR/HUF árfolyam, amit minden EUR→HUF átváltás felhasznál.
- **Kerekítési szabály mindenhol, ahol EUR-ból HUF-ot számolunk**: `src/lib/currency.ts` → `roundToTen()` a legközelebbi 10 Ft-ra kerekít (pl. 189 432,21 → 189 430, a user által adott példa szerint — ez matematikai kerekítés a legközelebbi tízesre, nem mindig felfelé, annak ellenére hogy "felkerekítés" hangzott el, mert a példa ezt mutatta). Alkalmazva mind az extráknál, mind a termékeknél.
- **Extrák EUR-ban**: `extras.priceEur` új mező (migráció `0013`) — az admin extra-űrlapon (új és szerkesztés) az ár EUR-ban adható meg, alatta élő "≈ X Ft" előnézettel; mentéskor a szerver (nem a kliens!) számolja ki és tárolja a `priceHuf`-ot az aktuális árfolyamon, kerekítve. A frontend (kártyák, termékoldali extra-választó) változtatás nélkül továbbra is `priceHuf`-ot mutatja.
- **Termékek: EUR az alap, HUF lakat alatt**: `products.priceEur` + `products.priceHufManual` új mezők (migráció `0014`+`0015`, a korábbi, sosem ténylegesen használt `eurPriceOverride` mező törölve — helyette ez az új, valóban bekötött mechanizmus). Új `PriceField` admin komponens: EUR mező mindig szerkeszthető, mellette a HUF mező alapból **zárolva** (szürke, csak-olvasható, élőben az aktuális árfolyamon számolt érték látszik) — egy lakat-ikonra kattintva feloldható, ekkor a HUF kézzel felülírható, és ez az érték változatlanul mentődik (nem íródik felül a következő automatikus számításnál, amíg a user vissza nem zárja). A szerver oldali `resolvePrice()` sosem bízik a kliens által számolt/beküldött HUF értékben zárolt állapotban — mindig újraszámol az aktuális árfolyamból.
- **MNB árfolyam-lekérés gombbal**: `src/lib/mnb.ts` — SOAP-hívás az MNB hivatalos `arfolyamok.asmx` webszolgáltatásának `GetCurrentExchangeRates` metódusára (a WSDL-ből kiolvasott pontos endpoint/SOAPAction/névtér alapján), az EUR-sor kiolvasása reguláris kifejezéssel a beágyazott XML-válaszból. A Beállítások oldalon egy "Frissítés az MNB középárfolyamával" gomb hívja meg, sikeres válasz esetén automatikusan kitölti (de nem menti el azonnal — a user még jóváhagyja a "Mentés" gombbal) az árfolyam mezőt.
  - **Fontos, tesztelés közben feltárt korlát**: az MNB webszolgáltatása egy F5/WAF-védelem mögött fut, ami a fejlesztői környezetemből minden POST-kérést (a tényleges adatlekérést) `404`-gyel elutasított, miközben a sima GET (pl. a WSDL leírás) simán működött — ez erős jele annak, hogy a szolgáltatás bot-védelme blokkolja a szerver-szerver POST-kéréseket bizonyos forrásokból. **Ezt éles szerverről (a projekt VPS-éről) kell majd kipróbálni** — lehet, hogy onnan működik, lehet, hogy nem (ha az MNB IP-cím vagy egyéb fingerprint alapján szűr). A kód robusztusan kezeli a hibát (kulturált magyar hibaüzenet, nem összeomlás), és a kézi beírás mindig működő tartalék marad.
- **Éles hiba, amit tesztelés közben találtam és azonnal javítottam**: a `priceEur` Zod-séma union sorrendje (`z.union([z.coerce.number().nonnegative(), z.literal("")])`) miatt egy **üresen hagyott** EUR mező `0`-ra konvertálódott levágás helyett null-ra (mert a `Number("")` értéke `0`, ami átment a `.nonnegative()` ellenőrzésen még mielőtt a séma elérte volna az üres string ágat) — ez egy valós terméknél (`aqua-excellent-illataroma`) ideiglenesen **0 Ft-ra írta az árat**, amíg a hibát a saját tesztem közben észre nem vettem és ki nem javítottam (az union sorrendjének megcserélésével: előbb az üres string esetet vizsgálja). Az érintett termék árát visszaállítottam, és egy kontroll-teszttel megerősítettem, hogy a hiba többé nem áll fenn.
- **Tesztelés**: a kerekítési szabály (189 432,21 → 189 430), az extra EUR→HUF mentés, a termék ár zárolt/feloldott mindkét ága (automatikus számítás + kézi felülírás, beleértve azt is, hogy zárolt állapotban a szerver figyelmen kívül hagyja a beküldött HUF-ot), és az MNB-hívás hibakezelése is közvetlenül, élesben tesztelve, a szokásos módszerrel (direkt szerver-akció hívás FormData-val). A `revalidatePath`-artefaktum (l. korábbi bejegyzések) itt is jelentkezett, de a tényleges adatbázis-írás minden esetben a hiba előtt lefutott és ellenőrizhető volt.

## 2026-09-02 — Admin felület redesign (mobilra is), fejléc pénznemválasztó (HUF/EUR)

A user szerint a termék szerkesztő admin oldal "be volt ömlesztve", és az egész admin felület nem volt mobilbarát — utána egy teljesen más témát is kért: pénznemválasztó a nyelvválasztó mellé, ami mindenhol átváltja a kiírt árakat.

### Admin felület redesign
- **Termék szerkesztő űrlap**: a korábbi egyoszlopos, `max-w-4xl`-re korlátozott, ömlesztett mezőlista helyett kétoszlopos elrendezés lett, ami a teljes rendelkezésre álló szélességet kihasználja — bal oldalt (széles) a tartalmi blokkok (Alapadatok, Állapot, Leírások, Egyéb adatok, Extrák, Képek, Specifikáció, Konfigurációs opciók, Termékváltozatok), jobb oldalt egy keskeny, **sticky** (görgetéskor a helyén maradó) sáv (Mentés gomb, Ár, Kategorizálás). Minden blokk saját kártyában, kulturált elválasztással. A pontos sorrendet és az "Állapot" panel vízszintes elrendezését a user két kör visszajelzés alapján finomítottuk.
- Az összes be/ki jellegű mező (Készleten, Csak megrendelhető, Kiemelt, Újdonság, Akciós) egységesen az új kapcsoló-csúszka (`toggle-switch.tsx`) stílust kapta, egy helyen csoportosítva.
- **Mobilra optimalizálva az egész admin felület**: az oldalsáv navigáció mobilon hamburger-menüs felső sávvá alakul (`admin-sidebar.tsx`, kliens-komponensre kiemelve a szerver layoutból), az aktív menüpont kiemelve látszik; a termék űrlap és a hozzá tartozó al-komponensek (kategória/sorozat választó, ár mező, extrák lista, SKU-változat szerkesztő, konfigurációs opció szerkesztő) minden belső mezőpárja `sm:grid-cols-2`-re vált keskeny nézetben egyoszlopossá; a táblázatos admin listák (termékek, kategóriák, szállítás, rendelések) vízszintesen görgethetők lettek, hogy ne törjenek szét kis képernyőn.
- **Két apró hiba, amit a user visszajelzése alapján javítottunk**: a Konfigurációs opciók csoportnév (EN) mezője mobilon kilógott az ablakból (a HU/EN mezők egy sorban voltak `flex`-ben) — a HU mező alá került mobilon, nagy képernyőn változatlan; a Férőhely/Súly mezők külön sorba kerültek az "Egyéb adatok" panelen, most egymás mellett vannak.

### Fejléc pénznemválasztó (HUF/EUR)
- A user kérése: nyelvválasztó mellé pénznemválasztó, ami minden kiírt árat átvált; nyelvváltásnál automatikusan illeszkedjen (HU→HUF, EN→EUR), de külön is állítható legyen.
- Új `src/lib/currency-context.tsx` — `CurrencyProvider` (a `[locale]/layout.tsx`-ben az admin Beállításokban tárolt EUR/HUF árfolyammal inicializálva), `useCurrency()` hook, és egy `<Price hufAmount={...}>` kliens-komponens, ami a mindenkori kiválasztott pénznemben formázza a (mindig HUF-ban tárolt, forrás-igazságú) árat. A pénznem-választás `localStorage`-ban perzisztál; nyelvváltó linkre kattintva a `setCurrency(currencyForLocale(...))` hívás automatikusan átállítja a pénznemet is a nyelv alapértelmezettjére, de a fejléc HUF/EUR gombjaival ettől függetlenül bármikor felülírható.
- **Minden ár-megjelenítés lecserélve** `formatHuf(...)`-ról a pénznem-tudatos megoldásra: terméklisták/kártyák, termékoldal ár és a "csak megrendelhető" küszöbszöveg (ehhez külön kis kliens-komponens kellett, `order-only-note.tsx`, mert az eredeti egy szerver-komponensben volt, a pénznem viszont csak kliens-oldali állapot), kosár, checkout (tételek/részösszeg/szállítás/végösszeg), rendelés-visszaigazolás, extrák (admin és publikus kártya is).
- **Kategóriaoldal ár-szűrő csúszka is EUR-osítva** (a user külön rákérdezett, miután elsőre szándékosan kihagytam, jelezve a kockázatot): a csúszka most a mindenkori pénznem egységeiben mutatja magát és abban is húzható (kisebb, kerekebb lépésekkel EUR-ban), de a ténylegesen elküldött szűrő-érték a háttérben mindig HUF-ra van visszaváltva egy rejtett mezőn keresztül — a szerver-oldali szűrés-logika (adatbázis-lekérdezés `products.priceHuf` ellen) egyáltalán nem változott, így ez egy alacsony kockázatú, tisztán megjelenítési szintű módosítás maradt.
- **Tudatosan HUF-ban maradt, nem konvertált tétel**: a kategória-szűrő "Ár" felirata pénznem-semlegesre egyszerűsödött ("Ár (Ft)" → "Ár"), mert a tényleges egységet úgyis a csúszka saját, élő felirata mutatja.
- **Tesztelés**: élesben, curl-lel ellenőrizve mindkét nyelven/pénznemben — HU oldalon alapból HUF aktív és minden ár forintban (beleértve a szűrő-feliratokat is), EN oldalon alapból EUR aktív és a termékek ára euróban jelenik meg a fejléc gombjának helyes vizuális állapotával együtt (HUF/EUR közül melyik van kiemelve). A tényleges csúszka-húzás interaktív viselkedését böngésző nélkül nem lehetett kipróbálni, ez kódszinten van csak ellenőrizve.
