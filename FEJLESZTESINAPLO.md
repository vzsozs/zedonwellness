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
