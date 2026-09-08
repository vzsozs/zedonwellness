# Teljeskörű kód-audit — 2026-09-07

> **Állapot (2026-09-08): mind a 42 tétel javítva.**
> A javítások leírása a dokumentum végén, a *„Javítási napló"* szakaszban —
> az alábbi feltárás változatlanul maradt, hogy visszakereshető legyen, mi
> volt az eredeti helyzet.
>
> Ellenőrzés a javítások után: `npx tsc --noEmit` tiszta · `npm run lint`
> 0 hiba (korábban egyáltalán nem futott le) · `npm test` 94 teszt zöld ·
> `npm run build` sikeres · minden útvonal élőben 200/404-et ad.

Ez a dokumentum a `zw_code` (Zedonwellness webshop) teljes kódbázisának átvizsgálásából
származik. Alapja a `FEJLESZTESINAPLO.md` végigolvasása + a `src/`, konfigurációs és
deploy fájlok soronkénti átnézése.

**Módszertani megjegyzés:** a `npx tsc --noEmit` **hibátlanul lefut** — típusszinten a
projekt rendben van. A lenti hibák nagy része olyan, amit a fordító nem lát: futásidejű
biztonsági rés, üzleti logika, SEO, teljesítmény és jogi megfelelés.

**Prioritás-jelölés:**
- 🔴 **P0** — élesítés előtt kötelező (biztonság, adatvesztés, jogi kockázat)
- 🟠 **P1** — fontos (rossz üzleti működés, elveszett forgalom)
- 🟡 **P2** — teljesítmény / UX
- 🔵 **P3** — karbantarthatóság, kódminőség
- 💡 **Ötlet** — "működik, de sokkal jobban is meg lehetne csinálni"

---

## 🔴 P0 — Kritikus

### P0-1. Az összes admin Server Action hitelesítés nélkül hívható (jogosultsági rés)

**Fájlok:** `src/app/admin/(protected)/products/actions.ts`,
`categories/actions.ts`, `categories/series-actions.ts`, `extras/actions.ts`,
`hozzavalok/actions.ts`, `settings/actions.ts`, `shipping/actions.ts`,
`products/import/actions.ts`

Az egész projektben **három** helyen hívunk `auth()`-t:

```
src/app/admin/login/page.tsx:26
src/app/admin/(protected)/layout.tsx:10
src/app/admin/(protected)/products/export/route.ts:12
```

A `(protected)/layout.tsx` **csak az oldalak renderelését** védi. A Server Actionök viszont
önálló, publikus HTTP-végpontok: a Next.js egy action-ID-vel azonosítja őket, és a POST
egyenesen a függvényhez megy — **a layout redirectje sosem fut le**. Vagyis bejelentkezés
nélkül, egy sima `fetch`-csel hívható:

- `deleteProduct(id)` — `products/actions.ts:387`, még csak zod-validáció sincs rajta,
  egy nyers `number` és töröl
- `deleteCategory(id)`, `deleteSeries(id)`, `deleteShippingRate(id)`
- `createProduct` / `updateProduct` — tetszőleges termék átírása, **fájlfeltöltéssel együtt**
  (a `saveUploadedImage`/`saveUploadedDocument` így nyilvános feltöltő végponttá válik → a
  szerver lemeze megtölthető)
- `updateExchangeRate` — az EUR/HUF árfolyam átírása, ami az **egész katalógus árazását**
  befolyásolja
- `importProductsCsv` — teljes katalógus felülírása egy CSV-vel

Az `export/route.ts` fejlécében szereplő komment (*"Route handlers aren't wrapped by the
(protected) layout's auth check"*) pontosan felismerte a problémát — csak a Server
Actionökre nem lett alkalmazva ugyanez a következtetés.

**Javasolt javítás:** egy `requireAdmin()` helper (`src/lib/require-admin.ts`), amit
**minden** exportált admin action első sorában meghívunk:

```ts
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Nincs jogosultság.");
  return session.user;
}
```

A `toActionError()` már kezelné a dobott hibát, tehát a UI-ban kulturált üzenet jelenne meg.
Kiegészítésként érdemes a `proxy.ts` matcheréből is kivenni az `admin` kizárást, és
middleware-szinten is elutasítani a be nem jelentkezett `/admin/*` kéréseket (védelem
mélységben) — de a Server Action védelmet ez **nem** váltja ki, azt akkor is meg kell írni.

---

### P0-2. Checkout: a variáns nincs a termékhez kötve → árcsalás lehetséges

**Fájl:** `src/app/[locale]/penztar/actions.ts:80–99`

A kosárból csak `{productId, variantId, quantity}` érkezik, a szerver ezt (helyesen) újra
lekérdezi. **De sosem ellenőrzi, hogy a `variantId` tényleg a `productId`-hoz tartozik-e:**

```ts
const variant = ci.variantId !== null ? variantById.get(ci.variantId) : undefined;
// ...
priceHuf: Number(variant?.priceHuf ?? p.priceHuf),
```

Így egy kézzel összeállított kérésben egy 8 000 000 Ft-os jakuzzi `productId`-ja mellé
odatehető egy 3 900 Ft-os illatolaj-variáns `variantId`-ja, és a rendelés **3 900 Ft-os
tételként** rögzül. A `nameHu` is a jakuzzi nevét kapja, tehát a rendelésen sem tűnik fel
azonnal.

**Javítás:** `if (variant.productId !== p.id) throw new Error(t("errorVariantUnavailable"))`.

---

### P0-3. Checkout: nincs készlet-, ár- és rendelhetőség-ellenőrzés a szerveren

**Fájl:** `src/app/[locale]/penztar/actions.ts:80–110`

A `ProductActions` kliens-komponens szépen letiltja a gombot, ha `!inStock`, ha a variáns
elfogyott, vagy ha `priceOnRequest` — **de a szerver oldalon egyik feltétel sincs
újraellenőrizve**. Egy közvetlen POST-tal (vagy egyszerűen egy régi, localStorage-ben
maradt kosárral) leadható:

- **elfogyott** termék rendelése,
- **"Hamarosan"** (`priceOnRequest = true`) termék rendelése — ezeknél a `priceHuf` az adatbázisban
  `"0"`, tehát **0 Ft összegű rendelés** keletkezik,
- olyan termék, ami időközben törlődött/kifogyott, miközben a kosárban volt.

**Javítás:** a `orderItems.map`-ben ellenőrizni: `p.inStock`, `variant.inStock`,
`!p.priceOnRequest`, és `priceHuf > 0`. Mindegyikre saját, lokalizált hibaüzenet.

### P0-4. Checkout: nincs felső korlát a darabszámon

**Fájl:** `src/app/[locale]/penztar/actions.ts:27`

`quantity: z.number().int().positive()` — bármekkora szám átmegy. Egy `quantity: 999999999`
a `totalHuf`-ot a `numeric(12,0)` oszlop tartományán túlra viszi → nyers Postgres-hiba,
a vevő pedig egy generikus hibaüzenetet kap. Javítás: `.max(999)` (vagy készlet-alapú limit),
és ugyanez a kosárban is.

---

### P0-5. Jogi megfelelés hiányzik (magyar webshop-kötelezettségek)

Ez nem "kód-hiba", de élesítés előtt blokkoló:

1. **A lábléc `/adatvedelem` és `/aszf` linkjei 404-re mutatnak.**
   `src/components/site-footer.tsx:75,78` — ilyen oldal nem létezik, a `[category]` route
   kapja el és `notFound()`-ol.
2. **Nincs ÁSZF/adatkezelési elfogadó checkbox a checkouton.** A `penztar/page.tsx` űrlapján
   nincs kötelező jelölőnégyzet, és a rendelés sem rögzíti, hogy a vevő elfogadta.
3. **A megrendelés gomb felirata nem felel meg az EU fogyasztóvédelmi irányelvnek** —
   "fizetési kötelezettséggel járó megrendelés" (vagy annak megfelelő) szöveg kell rá.
4. **Nincs elállási jog tájékoztatás, nincs Impresszum oldal, nincs cookie-tájékoztató/banner.**
5. **Nincs adatmegőrzési/GDPR-koncepció** a `orders` táblában tárolt vevőadatokra
   (név, e-mail, telefon, cím) — nincs törlési folyamat, nincs anonimizálás.

### P0-6. A lábléc kitalált elérhetőségeket mutat

`src/components/site-footer.tsx:65–66`: `+36 1 234 5678` és `info@zedonwellness.com` —
placeholder értékek, miközben a `contact-modal.tsx` már a valós adatokat tartalmazza.
Ha ez élesbe megy, a látogatók egy nem létező számot hívnak. **Egy forrásból** (közös
konstans vagy admin `settings`) kellene jönnie mindkét helyen.

---

### P0-7. Nincs `.dockerignore` → a `.env.local` bekerül a Docker image-be

**Fájl:** hiányzik (a repo gyökerében nincs `.dockerignore`)

A `Dockerfile` `builder` fázisa `COPY . .`-t csinál. `.dockerignore` nélkül ez bemásolja:

- **`.env.local`-t** — benne a `DATABASE_URL` jelszóval, az `AUTH_SECRET`-tel és a
  Stripe kulcsokkal. Ez **rajta marad a builder rétegen**, és bárki, aki az image-hez
  hozzáfér, kiolvashatja (`docker history` / réteg-kicsomagolás).
- `node_modules/` — **838 MB**
- `uploads/` — **136 MB**
- `.git/`, `.next/`, `Ideiglenes/`

Ez egyszerre biztonsági rés és egy erősen lassú, feleslegesen nagy build.

**Javítás:** `.dockerignore` a következőkkel: `node_modules`, `.next`, `.git`, `uploads`,
`Ideiglenes`, `.env*`, `design-mockups`, `*.md`, `tsconfig.tsbuildinfo`.

### P0-8. Gyenge alapértelmezett adatbázis-jelszó a compose fájlban

`docker-compose.yml`: `POSTGRES_PASSWORD: ${DB_PASSWORD:-zw_password}`. Ha a `DB_PASSWORD`
nincs beállítva a szerveren, az éles adatbázis a `zw_password` jelszóval fut. Javasolt a
fallback eltávolítása (`${DB_PASSWORD:?DB_PASSWORD kötelező}`), hogy hiányzó érték esetén
inkább **ne induljon el** a stack.

---

### P0-9. Nyers, ellenőrizetlen külső HTML kerül a DOM-ba a blogban

**Fájl:** `src/components/blog/blog-article.tsx:44` +
`src/lib/soro.ts:getSoroArticleContent`

A Soro CMS-től érkező cikk-HTML `dangerouslySetInnerHTML`-lel megy ki, **sanitizálás nélkül**.
A projektben már van `sanitize-html` és egy kész `sanitizeDescription()` helper — a
terméknél használjuk, itt nem. Ha a Soro fiók/szolgáltatás bármikor kompromittálódik (vagy
egy szerkesztő beilleszt egy `<script>`-et), az a **saját domainünkön** futó JS, ugyanazon
az origin-en, ahol az admin session sütije él.

**Javítás:** egy megengedőbb allowlist (h2/h3/ul/ol/li/img/figure/blockquote/table…) a blog
törzsére, és minden Soro-tartalmat ezen keresztül átengedni. A `soro.ts:1`-ben lévő
**hardcode-olt API tokent** is érdemes env változóba tenni.

---

## 🟠 P1 — Fontos

### P1-1. Árfolyamváltozáskor a katalógus HUF árai nem frissülnek — az EUR ár elcsúszik

**Fájlok:** `src/app/admin/(protected)/settings/actions.ts`,
`src/lib/currency-context.tsx`, `src/app/admin/(protected)/products/actions.ts:261`

A jelenlegi működés:
1. Termék felvitele EUR-ban → a szerver a **mentés pillanatában** kiszámolja és eltárolja a
   `priceHuf`-ot (`resolvePrice`).
2. Az admin később frissíti az árfolyamot (`updateExchangeRate`) → **egyetlen termék
   `priceHuf`-ja sem számolódik újra**.
3. A megjelenítéskor viszont a `Price` komponens az **aktuális** árfolyammal vált vissza
   HUF→EUR (`hufToEur`).

Következmény: egy 5 000 €-ra felvitt termék 400-as árfolyamnál 2 000 000 Ft. Ha az árfolyam
390-re változik, a HUF ár marad 2 000 000, de az angol oldalon **5 128,21 €** jelenik meg —
nem az az ár, amit az admin beírt. Ez minden árfolyam-frissítéssel tovább nő, és a
"Frissítés az MNB középárfolyamával" gomb pont ezt a helyzetet idézi elő.

Ehhez jön egy kisebb, de állandó **oda-vissza konverziós csúszás** is: az EUR→HUF-nál
`roundToTen()`-nel kerekítünk, majd megjelenítéskor visszaosztunk — így egy 1 234,56 €
termék "1 234,55 €"-ként jelenik meg.

**Javasolt javítás (kettő közül az egyik):**
- **(A) — egyszerű:** az `updateExchangeRate` / `fetchExchangeRateFromMnb` az árfolyam
  mentése után futtasson végig egy újraszámolást minden `priceHufManual = false` terméken,
  extrán és hozzávalón (egy `UPDATE ... FROM` elég). Az admin kapjon róla visszajelzést:
  "37 termék ára újraszámolva".
- **(B) — helyesebb:** a `Price` komponens kapja meg az `priceEur`-t is, és ha az létezik,
  **azt** írja ki EUR módban (ne visszaszámolt értéket). A HUF ár marad a HUF forrásigazság.
  Ez a kerekítési csúszást is megszünteti.

Én a **(B)-t javaslom fő megoldásnak, (A)-val kiegészítve** — így mindkét pénznemben az az
ár látszik, amit az admin ténylegesen szánt.

---

### P1-2. Az "1 M Ft feletti = csak megrendelhető" szabály nem veszi figyelembe a variánsokat

**Fájl:** `src/app/[locale]/termek/[slug]/page.tsx:68` + `src/components/product-actions.tsx`

Az `orderOnly` az `isOrderOnly(Number(product.priceHuf), ...)`-ból számolódik, tehát az
**alaptermék** árából — a kiválasztott SKU-variáns árából nem. Ha egy termék alapára
900 000 Ft, de van egy 1 400 000 Ft-os változata, a felület a drága változatnál is
"Kosárba"-t mutat, online fizetéssel — pont a szabály ellenében. A szerveren pedig ez a
szabály **egyáltalán nincs kikényszerítve** (`penztar/actions.ts` nem hivatkozik az
`ORDER_ONLY_THRESHOLD_HUF`-ra).

**Javítás:** az `orderOnly`-t a `ProductActions`-ben az `effectivePrice`-ból számolni, és a
`createOrder`-ben a végösszeg alapján `status`-t / `paymentMethod`-ot beállítani.

### P1-3. A kosár sosem frissül — elavult árakkal és törölt termékekkel

**Fájl:** `src/lib/cart-context.tsx`

A kosártétel a `localStorage`-be **belefagyasztja** a nevet, a képet, az árat és a súlyt.
Nincs semmilyen újraérvényesítés. Így:
- egy hetekkel korábbi kosár a régi árat mutatja a `/kosar` és `/penztar` oldalon, majd
  a szerver (helyesen) az aktuálissal számol → a vevő mást lát, mint amit rendel;
- egy időközben **törölt** termék örökre a kosárban marad, és a rendelés egy általános
  hibaüzenettel elhasal, anélkül hogy a vevő megtudná, melyik tétel a hibás.

**Javítás:** a `/kosar` és `/penztar` betöltésekor egy szerver-hívás, ami a `productId`-k
alapján visszaadja az aktuális árat/elérhetőséget, és a kliens frissíti/megjelöli az
eltérő tételeket ("Ennek a terméknek megváltozott az ára").

### P1-4. Hidratálási villanás: a kosár és a checkout üresnek látszik betöltéskor

**Fájlok:** `src/lib/cart-context.tsx:50`, `src/app/[locale]/kosar/page.tsx`,
`src/app/[locale]/penztar/page.tsx:36`

A `CartProvider` `hydrated` állapotot vezet, de **nem teszi elérhetővé** a contexten.
Emiatt a `/penztar` első renderje mindig lefut az `items.length === 0` ágon, és a felhasználó
egy pillanatra a **"A kosarad üres"** üzenetet látja, mielőtt megjelenne a rendelése. Ugyanez
a fejléc kosár-számlálóján is (0-ról ugrik).

**Javítás:** a `hydrated` publikálása a contexten, és amíg `false`, egy skeleton/üres állapot
helyett semleges betöltő nézet.

### P1-5. CSS-injekció lehetősége a kosár képeinél

`src/app/[locale]/kosar/page.tsx` — a tétel képe inline stílusba kerül:
`style={{ backgroundImage: \`url(${item.image})\` }}`. Az `item.image` **a `localStorage`-ból**
jön, ami a felhasználó által szabadon átírható. Nem magas kockázat (self-XSS jellegű), de
felesleges: `<img>`-gel kellene renderelni, ahogy máshol is.

---

### P1-6. SEO: hiányzik szinte minden, amit a projekt céljának jelöltünk

A napló nyitó bejegyzése szerint a cél *"a jelenlegi organikus eredmények megtartása +
javítása (meta, hreflang, sitemap, structured data)"*. Az aktuális állapot:

| Elvárás | Állapot |
|---|---|
| `sitemap.xml` | ❌ **Nincs** `src/app/sitemap.ts`. A `robots.ts` mégis rá hivatkozik → 404-es sitemapre mutatunk. |
| Termékoldali `<title>`/meta | ❌ Nincs `generateMetadata` a `termek/[slug]`-on → **minden** termékoldal címe "Zedonwellness", leírás nélkül. |
| Kategóriaoldali meta | ❌ Nincs `generateMetadata` a `[category]`-n. |
| `hreflang` (HU/EN) | ❌ Sehol nincs `alternates.languages`. |
| Canonical URL | ❌ Sehol nincs `alternates.canonical`. |
| `metadataBase` | ❌ Nincs → az OG képek relatív URL-jei rosszul oldódnak fel. |
| Structured data (JSON-LD) | ❌ Nincs `Product`/`Offer`/`BreadcrumbList`/`Organization` séma. |
| Open Graph / Twitter card | ❌ Csak a blogcikknél van (`blog/page.tsx:24`). |
| Régi Webflow URL-ek redirect-térképe | ❌ Nincs `redirects()` a `next.config.ts`-ben. |
| 404 oldal | ❌ Nincs `not-found.tsx` → a Next nyers, márkázatlan 404-e, fejléc/lábléc nélkül. |

Ezek együtt azt jelentik, hogy **élesítés napján a jelenlegi organikus forgalom nagy része
elveszne**. Ez a legnagyobb üzleti kockázatú tétel a listán a P0-k után.

### P1-7. A nyelvváltó mindig a főoldalra dob

`src/components/site-header.tsx:53–69` — a HU/EN kapcsoló `<Link href="/" locale="…">`.
Aki egy termékoldalon vált nyelvet, a **főoldalra kerül**, nem az adott termék angol
változatára. Ez UX-hiba és SEO-hiba is (a `hreflang` párokhoz úgyis oldalankénti URL kell).
Javítás: `usePathname()` + `router.replace(pathname, {locale})`.

### P1-8. A termékek neve/leírása sosem jelenik meg angolul

**Fájlok:** `src/components/product-card.tsx:53,57`, `src/components/product-actions.tsx:76`,
`src/app/[locale]/kosar/page.tsx`, `penztar/page.tsx`

A `ProductCard` mindig `product.nameHu`-t és `shortDescriptionHu`-t renderel (az `alt`
attribútum is), pedig a `localized()` helper és a `nameEn`/`shortDescriptionEn` oszlopok
megvannak. Ugyanez a kosárban és a checkout összegzőben (`item.nameHu`), és a rendelés is
`nameHu`-val rögzül. A napló ezt tudatos kimaradásként jelöli — de az EN oldal így
félkész, és minden más (menü, gombok, szűrők) már le van fordítva.

*(Az üzenetfájlok egyébként rendben: `messages/hu.json` és `en.json` — 254-254 kulcs,
nincs hiányzó fordítás.)*

### P1-9. A rendelésekkel gyakorlatilag nem lehet dolgozni

**Fájl:** `src/app/admin/(protected)/orders/page.tsx`

Az admin rendelés-oldal egy 5 oszlopos, **csak olvasható lista**: rendelésszám, vevő, összeg,
státusz, dátum. **Nincs részletnézet** — nem látszik, mit rendeltek, hova kell szállítani,
mi a vevő e-mail-címe/telefonja, mennyi volt a szállítási díj, kell-e egyedi ajánlat.
Nincs státuszváltás sem. Az adatok mind ott vannak az `orders.items` és
`orders.shippingAddress` JSONB-ben, csak nincsenek megjelenítve.

### P1-10. Rendelés leadásakor senki nem kap értesítést

Az egész kódbázisban **nincs e-mail küldés**. A vevő nem kap visszaigazolást (csak egy
köszönőoldalt lát, amit ha bezár, nyoma sem marad), a cég pedig nem kap értesítést az új
rendelésről — kézzel kell figyelni az admin listát. Egy webshopnál ez alapfunkció.
Javaslat: egy `src/lib/mail.ts` (Resend / Nodemailer SMTP), két sablonnal (vevői
visszaigazolás + belső értesítés), a `createOrder` végén hívva.

### P1-11. Nincs `not-found.tsx` és `error.tsx`

Sehol az `src/app` alatt nincs `not-found`, `error`, `global-error` vagy `loading` fájl.
Egy Webflow-ról költöző oldalnál rengeteg régi URL fog 404-re futni — ezek most a Next
csupasz, fejléc és lábléc nélküli hibaoldalára esnek, ahonnan nincs út vissza a shopba.
Egy futásidejű hiba ugyanígy.

---

## 🟡 P2 — Teljesítmény és UX

### P2-1. Nulla képoptimalizálás — a legnagyobb sebesség-probléma

**40 db nyers `<img>` tag a `src/` alatt, `next/image` használat: 0.**

Az `uploads/` mappa jelenlegi tartalma:

```
222 kép, 46,8 MB   (átlag 216 KB/kép)
legnagyobbak: 3,76 MB / 3,58 MB / 3,07 MB / 2,00 MB …
57 PDF, ebből több 4–5,6 MB
```

Egy kategórialista (pl. a Grillek, 27 termékkel) így **teljes felbontású eredeti fotókat**
tölt le, hogy aztán egy ~200 px-es kártyán jelenítse meg őket — több megabájt fölöslegesen,
minden egyes oldalbetöltésnél. Ehhez jön, hogy egyik `<img>`-en sincs `width`/`height`
(→ layout shift, rossz CLS) és nincs `loading="lazy"`.

**Javítás:** `next/image` bevezetése. A `/uploads/[...path]` route miatt kell egy
`images.remotePatterns` vagy egy egyszerű loader-konfiguráció a `next.config.ts`-ben, de
utána a Next automatikusan méretezett WebP/AVIF-et szolgál ki, `srcset`-tel és lazy
loadinggal. Ez egyetlen változtatással valószínűleg **több mint 80%-ot** vág a
kategóriaoldalak képforgalmából.

### P2-2. A teljes termékrekordok a kliensre mennek

**Fájlok:** `src/app/[locale]/[category]/page.tsx:32`,
`src/components/home/featured-products.tsx:17`

```ts
db.query.products.findMany({ where: eq(products.categoryId, category.id), with: { series: true } })
```

Ez **minden oszlopot** kiszed — a hosszú HTML `descriptionHu`/`descriptionEn`-t, a
`specs`, `variantOptions`, `documents` JSONB mezőket — és mivel a `CategoryBrowser` egy
`"use client"` komponens, mindez **beleszerializálódik az RSC payloadba** és leutazik a
böngészőbe, hogy ott sose használjuk. 27 grillnél ez könnyen több száz KB fölösleges JSON.

**Javítás:** `columns: { … }` projekció a kártyához ténylegesen kellő ~12 mezőre.

### P2-3. A keresés minden kérésnél az egész katalógust behúzza

`src/app/[locale]/kereses/page.tsx:24` — `db.query.products.findMany({ with: { series: true } })`
szűrés nélkül, majd JS-ben pontoz. A `src/lib/search.ts` kommentje ezt tudatos, kis
katalógusra szabott döntésként indokolja — ez rendben van, de két konkrét hiányossággal:
- **nincs ékezet-normalizálás** (a "szauna" ≠ "szaunák" részstring-alapon még jó, de a
  "hoszivattyu" nem találja meg a "hőszivattyú"-t),
- nem keres a `sku`-ban, a sorozat- és kategórianévben.

A keresési találati oldal ráadásul **indexelhető** — érdemes `robots: { index: false }`-t
tenni rá, hogy ne generáljon vékony tartalmú duplikált oldalakat.

### P2-4. A 2 másodperces grill-átmenet minden hover-effektet lelassít

**Fájl:** `src/app/globals.css:36–54`

```css
body, body .bg-white, body .text-ink, body .text-muted, body .text-accent, … {
  transition: background-color 2s ease, color 2s ease, border-color 2s ease;
}
```

Ez a szabály a Grillek sötét témára váltás lágy átmenetéhez készült, de **globális**: minden
`text-muted hover:text-accent` link (lábléc, morzsamenü, navigáció) és minden
`hover:bg-ink` gomb **2 másodperc alatt** veszi fel a hover-színt. A felhasználó számára ez
úgy néz ki, mintha az oldal nem reagálna a kurzorra.

**Javítás:** a hosszú átmenetet egy külön, csak a témaváltás idejére felrakott osztályhoz
kötni (`html.theme-transition { … }`, amit a `GrillThemeProvider` ~2 mp-re rátesz), a
hover-átmeneteket pedig a normál Tailwind `transition-colors` (150 ms) intézze.

### P2-5. A grill sötét téma villan betöltéskor

`src/lib/grill-theme-context.tsx:26` — a `dark-theme` osztály `useEffect`-ben kerül a
`<html>`-re, tehát **hidratálás után**. Aki közvetlenül nyit meg egy grill-termékoldalt,
előbb a világos oldalt látja, aztán (a fenti 2 mp-es átmenettel) átúszik sötétbe. A napló
korábban javított egy hasonló hibát (effekt-sorrend), de a villanás maga megmaradt.

**Javítás:** a témát szerver oldalon eldönteni (a route/kategória már ismert) és a
`<html>`-re `className`-ként kirakni a `[locale]/layout.tsx`-ben — így az első festés már
helyes. A `useGrillThemeActive` MutationObserver-es megoldása (`grill-theme-context.tsx:47`)
ezzel szintén kiváltható: a context úgyis tudja az `isDark` értéket, csak ki kell adnia.

### P2-6. Nincs egyetlen adatbázis-index sem

A 18 migrációban **nulla** `CREATE INDEX`. Nincs index a `products.category_id`-n,
`products.series_id`-n, a `product_variants.product_id`-n, a `shipping_rates.zone`-on vagy
az `orders.created_at`-en. Jelenlegi katalógusméretnél ez nem mérhető, de az idegen kulcsokra
mutató index alapszintű higiénia, és a `products.slug` melletti gyakori szűrések is ebből
élnének. Egy migrációval letudható.

### P2-7. Felöltött fájlok sosem törlődnek

Termék törlésekor, kép cseréjekor vagy extra törlésekor a lemezre írt fájl a helyén marad.
Az `uploads/` már most 136 MB. Nincs takarító folyamat. Legalább egy "árva fájlok" listázó
admin-nézet vagy egy időzített takarító szkript indokolt.

### P2-8. Az `/uploads` kiszolgáló apróságai

`src/app/uploads/[...path]/route.ts`:
- **Prefix-ellenőrzés hibája:** `filePath.startsWith(UPLOADS_ROOT)` — a `/app/uploads-barmi`
  útvonal is átmegy ezen az ellenőrzésen. Helyesen `UPLOADS_ROOT + path.sep`-pel kell
  összevetni (a Next ugyan normalizálja az URL-eket, tehát ez ma nem kihasználható, de a
  védelem így nem az, aminek látszik).
- A teljes fájlt memóriába olvassa (`readFile`) — egy 5,6 MB-os PDF-nél is. Stream + `Range`
  támogatás és `ETag`/`304` kezelés lenne a helyes (jelenleg minden kérés a teljes fájlt
  átküldi, `immutable` cache ide vagy oda).

### P2-9. Nincsenek biztonsági HTTP-fejlécek

A `next.config.ts` nem definiál `headers()`-t. Hiányzik: `Content-Security-Policy`,
`Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`,
`Permissions-Policy`. Egy webshopnál, ahol admin session süti is van, ez alapelvárás.

### P2-10. Nincs semmilyen brute-force védelem a bejelentkezésen

`src/auth.ts` — nincs próbálkozás-számláló, nincs késleltetés, nincs zárolás. Emellett a
`if (!user) return null;` ág a `bcrypt.compare` **előtt** tér vissza, tehát a válaszidőből
kiderül, létezik-e egy adott e-mail cím (felhasználó-felderítés). Utóbbi egy dummy hash
összehasonlításával orvosolható.

---

## 🔵 P3 — Kódminőség, karbantarthatóság

### P3-1. Az ESLint nem fut le — a projektnek nincs működő lintere

```
$ npx eslint src
TypeError: Converting circular structure to JSON
    at ConfigValidator.formatErrors (…/@eslint/eslintrc/lib/shared/config-validator.js:299)
```

Az `eslint.config.mjs` a `FlatCompat`-en keresztül tölti be a `next/core-web-vitals` +
`next/typescript` configokat, és ez az ESLint 9.39 / eslint-config-next 16.1.6 kombinációval
elszáll. Vagyis az `npm run lint` **soha nem futott le sikeresen** ebben a projektben —
a kódban lévő `eslint-disable` kommentek (pl. `image-lightbox.tsx:27`,
`currency-context.tsx:52`) így valójában semmit nem tiltanak le. Javítás: áttérés az
`eslint-config-next` natív flat config exportjára (`next/flat` / `defineConfig`), és
`npm run lint` beépítése a build/commit menetébe.

### P3-2. Nincs egyetlen automatizált teszt sem

Nincs teszt-futtató, nincs teszt-fájl, nincs CI. A napló minden bejegyzése kézi, egyszeri
ellenőrzésről szól (worktree + curl + böngésző), és több helyen kifejezetten rögzíti, hogy
egy javítást nem sikerült ellenőrizni. A kritikus, tisztán logikai részek viszont
könnyen tesztelhetők lennének, futó szerver nélkül is:

- `lib/shipping.ts` — súlysáv-választás, határesetek (0 / pontosan a határon / 40 fölött / ismeretlen súly)
- `lib/currency.ts` — `roundToTen`, EUR↔HUF oda-vissza
- `lib/config.ts` — `isOrderOnly` küszöb
- `lib/csv.ts` — RFC4180 round-trip
- `lib/search.ts` — pontozás
- `resolvePrice()` — a zárolt/feloldott ág (**ez az a függvény, ahol a napló szerint egyszer
  egy valós termék ára 0 Ft-ra íródott** — pont ide kellene egy regressziós teszt)

Egy `vitest` + ~40 unit teszt egy délután alatt megvan, és az összes fenti korábbi
hibaosztályt megfogná.

### P3-3. Nyolc használaton kívüli npm függőség

Egyik sincs importálva sehol a `src/` vagy `scripts/` alatt:

`stripe`, `react-hook-form`, `@hookform/resolvers`, `radix-ui`,
`class-variance-authority`, `clsx`, `tailwind-merge`, `@tailwindcss/typography`

A `radix-ui` és a `stripe` önmagában is jelentős méret. (A `stripe` értelemszerűen a tervezett
fizetéshez van előkészítve — az maradhat; a többi a shadcn-scaffold maradéka.)

### P3-4. Az admin írások nem tranzakcionálisak

`createProduct` / `updateProduct` (`products/actions.ts:295, 340`) egymás után 4 külön
írást végez: termék → `syncExtras` → `syncFeatures` → `syncProductVariants`. Ha bármelyik
elhasal, a termék félig frissített állapotban marad. Mindegyik `db.transaction(...)`-be
kellene kerülnie. Ugyanez a CSV-importra is igaz (soronkénti írás, nincs visszagörgetés).

### P3-5. A variánsok minden mentéskor törlődnek és újra létrejönnek

`syncProductVariants` (`products/actions.ts:249`) mindig `DELETE` + `INSERT`. Emiatt a
`product_variants.id` **minden termékmentésnél megváltozik**. A leadott rendelések
(`orders.items[].variantId`) így pár mentés után **nem létező variáns-ID-kra** mutatnak.
A tételek neve/ára szerencsére snapshotolva van, tehát adat nem vész el — de a hivatkozás
értelmét veszti. Javasolt kulcs alapján upsertelni (a szerkesztő már használ stabil `key`-t).

### P3-6. Elavult/holt séma-elem

`categories.parentId` (`src/db/schema/index.ts:31`) — deklarált oszlop, **sehol a kódban nem
használjuk**, és még idegen kulcs sincs rajta. Vagy legyen belőle valódi alkategória-támogatás,
vagy törölni kell.

### P3-7. Kategória törlésekor nyers adatbázis-hiba

`deleteCategory` (`categories/actions.ts`) nem ellenőrzi, van-e a kategóriában termék.
A `products.category_id` `notNull` + FK, tehát a törlés Postgres-hibával elszáll, amit
semmi nem kap el (ez az action nem használja a `toActionError`-t) → a napló szerint már
egyszer megoldott "lefagyás" élmény, csak most a kategóriáknál.

### P3-8. Nem lokalizált akadálymentességi feliratok

Néhány `aria-label` fixen magyar, angol oldalon is: `image-lightbox.tsx:41,54,75`
("Bezárás", "Előző kép", "Következő kép"), `product-gallery.tsx:30` ("Kép nagyítása"),
`site-header.tsx:165` ("Menü megnyitása/bezárása"). A `common` névtérbe kellenek.

### P3-9. A lightbox akadálymentességi hiányai

`src/components/image-lightbox.tsx` — nincs `role="dialog"`/`aria-modal`, nincs fókusz-csapda,
nincs fókusz-visszaállítás bezáráskor, és nincs `overflow: hidden` a `<body>`-n
(a háttér görgethető marad nyitott lightbox mellett).

### P3-10. Ismétlődő elrendezés-kód

A `px-16 max-lg:px-6` minta (és a `max-w-[1600px]` / `max-w-[1400px]` konténerszélességek)
kb. 20 helyen van kézzel ismételve. Egy `<Section>` / `<Container>` komponens egységesítené,
és a jövőbeli szélesség-igazításokat egy helyre vinné.

### P3-11. Törékeny React kulcsok

`termek/[slug]/page.tsx` — `key={spec.label}` (a specifikáció-táblában simán lehet két
azonos címke) és `key={group.nameHu}` a `variantOptions`-nél. A napló szerint már volt egy
duplikált-kulcs hiba a galériában; ugyanez a hibaosztály itt még nyitva van. Index-alapú
összetett kulcs kell (`${spec.label}-${i}`).

### P3-12. Nem tisztított `setTimeout`

`src/components/product-actions.tsx:83` — `setTimeout(() => setAdded(false), 1600)`
cleanup nélkül; ha a felhasználó elnavigál a "Kosárba" után, unmountolt komponensen fut le
a `setState`.

---

## 💡 Ötletek — "működik, de sokkal jobban is meg lehetne csinálni"

Ezek nem hibák, hanem olyan pontok, ahol a mostani megoldás elér a céljához, de
átalakítással érdemben jobb lenne. Mindegyiknél kérdés, hogy belevágjunk-e.

### 💡 1. A blog URL-szerkezete: `/blog?post=slug` → `/blog/[slug]`

**Ez a legfontosabb ötlet a listán.** A `/blog?post=hogyan-tisztitsd-a-jakuzzit` query
paraméteres megoldás működik, de:
- a keresők a query paraméteres URL-eket rosszabbul kezelik (canonical-problémák,
  gyengébb indexelés),
- nem oszthatók meg szépen, nem "beszélő" URL-ek,
- a `/blog` lista és a cikk **ugyanaz a route**, ezért mindkettő minden betöltéskor lehúzza
  a teljes cikk-listát,
- az egész blog kliens-oldali szűrése (`blog-list.tsx`) 20-as lapozással a teljes tömbön dolgozik.

Javaslat: `src/app/[locale]/blog/[slug]/page.tsx` külön route, `generateStaticParams`-szal
(vagy ISR-rel), oldalankénti `generateMetadata`-val és `Article` JSON-LD-vel. A régi
`?post=` formára tegyünk egy redirectet. Ez a blogot valódi SEO-eszközzé teszi — most
gyakorlatilag láthatatlan a keresőknek.

### 💡 2. A termékkártya 70%-os szélessége

`product-card.tsx:26` — `className="mx-auto block w-[70%]"`. A kártya egy 3 oszlopos grid
cellájában ül, és a cella 30%-át üresen hagyja. A vizuális eredmény jó (a user így kérte),
de a megvalósítás fordítva van: **a rácsot kellene keskenyebbre venni** (több oszlop, vagy
nagyobb `gap`, vagy `max-w` a cellán), nem a kártyát zsugorítani a cellán belül. Így a
hover-terület és a kattintható felület is a látható kártyához igazodna — most a kártya
körüli 30% "holt zóna". Egy `grid-cols-[repeat(auto-fill,minmax(240px,1fr))]` egyszerre
oldaná meg ezt és a reszponzivitást.

### 💡 3. Kategória-fotók: saját mező a "legdrágább termék képe" helyett

`category-grid.tsx` a kategória **legdrágább termékének** főképét használja a kártyán. A
kód kommentje maga is ideiglenesnek jelöli, és a napló is rögzíti, hogy a user egyedi
kategória-fotókat fog gyártani. Javaslat: `categories.imageUrl` oszlop + feltöltő az admin
kategória-szerkesztőbe, a mostani logika pedig maradjon fallbacknek. Kis munka, és
levesz egy meglepetést a kártyákról (ma egy új, drága termék felvitele átrajzolja a főoldalt).

### 💡 4. Az egész árrendszer: EUR legyen a forrásigazság

Ma a `priceHuf` a forrásigazság, az EUR pedig visszaszámolt érték — miközben az admin
**EUR-ban viszi fel** az árakat, és a HUF a származtatott. Ez a fordítottság okozza a
P1-1-es elcsúszást. Egy tisztább modell: `priceEur` a forrás, `priceHuf` egy tárolt,
kiszámított cache-mező (`priceHufManual`-lal mint felülbírálás), és a megjelenítés mindig
a saját pénznemének forrásmezőjéből olvas. Ez egy fél napos átalakítás, de utána az
árfolyam-kezelés végleg megszűnik hibaforrás lenni.

### 💡 5. `.dark-theme` helyett szemantikus színtokenek

A `globals.css` a grill-témát úgy oldja meg, hogy **Tailwind utility-osztályokat ír felül**
(`.dark-theme .bg-white { … }`), sőt konkrét hex-osztályokat is
(`.dark-theme .bg-\[\#f2f8fd\]`). Ez ügyes trükk, és a napló szerint gyorsan célba is ért —
de törékeny: minden új `bg-[#…]` arbitrary érték némán kimarad a sötét témából, és a
"háttérszín is jött a `border-line`-nal" típusú hibából (amit a user vett észre) pontosan
ez a minta termel többet.

Javaslat: szemantikus tokenek bevezetése (`--color-surface`, `--color-surface-raised`,
`--color-border`, `--color-text`, `--color-brand`), a komponensek ezekre álljanak át
(`bg-surface` a `bg-white` helyett), és akkor a témaváltás **csak a tokenek átdefiniálása**
lesz — nem osztályonkénti felülírás. Ez egyben a jövőbeli általános dark mode-ot is
ingyen adná.

### 💡 6. Kosár-nyugalom: szerver oldali kosár-érvényesítő végpont

A P1-3-hoz kapcsolódóan érdemes lenne egy `validateCart(items)` szerver-függvény, amit a
`/kosar`, a `/penztar` és a `createOrder` **ugyanúgy** használ. Egy helyen dőlne el, hogy
mi az érvényes ár, elérhető-e a termék, kell-e egyedi ajánlat — így a kliens és a szerver
soha nem tudna eltérni, és a P0-2/P0-3 javítása is természetes helyre kerülne.

### 💡 7. Migráció-futtatás a deployba

Ma a séma-migráció kézi lépés SSH-alagúton keresztül (`npm run db:migrate`). Ez azt
jelenti, hogy egy séma-változást tartalmazó image deployolható úgy, hogy a migráció
lemarad — az app pedig hibás oszlopokkal indul. Javaslat: egy `drizzle-kit migrate` lépés
a konténer indító szkriptjében (vagy külön egyszeri compose service-ként), plusz
healthcheck a `web` és `db` service-re, `depends_on: condition: service_healthy`-val.
A napló visszatérő fájdalmát (beragadt SSH-alagút) pedig egy `autossh` + systemd unit
oldaná meg véglegesen — a napló maga is felveti, csak eddig nem került sor rá.

### 💡 8. Naplózás és hibafigyelés

Jelenleg egy éles hibáról csak akkor tudunk, ha a user jelzi. Egy Sentry (vagy akár csak
strukturált `console` + a Docker log gyűjtése) néhány perc bekötés, és az olyan hibák,
mint a P0-2/P0-3, nem hónapokig lapulnának.

---

## Összefoglaló táblázat

| # | Prioritás | Terület | Cím |
|---|---|---|---|
| P0-1 | 🔴 | Biztonság | Admin Server Actionök hitelesítés nélkül hívhatók |
| P0-2 | 🔴 | Checkout | Variáns nincs a termékhez kötve → árcsalás |
| P0-3 | 🔴 | Checkout | Nincs készlet-/rendelhetőség-ellenőrzés a szerveren |
| P0-4 | 🔴 | Checkout | Nincs felső korlát a darabszámon |
| P0-5 | 🔴 | Jogi | ÁSZF/adatvédelem oldalak és elfogadás hiánya |
| P0-6 | 🔴 | Tartalom | Placeholder elérhetőségek a láblécben |
| P0-7 | 🔴 | Deploy | Nincs `.dockerignore` → `.env.local` az image-ben |
| P0-8 | 🔴 | Deploy | Gyenge alapértelmezett DB-jelszó |
| P0-9 | 🔴 | Biztonság | Sanitizálatlan külső HTML a blogban |
| P1-1 | 🟠 | Árazás | Árfolyamváltáskor nem frissül a katalógus |
| P1-2 | 🟠 | Üzleti logika | 1 M Ft-os szabály nem nézi a variáns árát |
| P1-3 | 🟠 | Kosár | Elavult árak/törölt termékek a kosárban |
| P1-4 | 🟠 | UX | "Üres kosár" villanás hidratálás előtt |
| P1-5 | 🟠 | Biztonság | CSS-injekció a kosár képeinél |
| P1-6 | 🟠 | SEO | Sitemap, meta, hreflang, canonical, JSON-LD — mind hiányzik |
| P1-7 | 🟠 | UX/SEO | Nyelvváltó mindig a főoldalra dob |
| P1-8 | 🟠 | i18n | Termékadatok sosem jelennek meg angolul |
| P1-9 | 🟠 | Admin | Rendeléseknél nincs részletnézet, nincs státuszkezelés |
| P1-10 | 🟠 | Üzleti | Rendelésről nincs e-mail értesítés |
| P1-11 | 🟠 | UX | Nincs `not-found.tsx` / `error.tsx` |
| P2-1 | 🟡 | Teljesítmény | Nulla képoptimalizálás (46,8 MB kép, 0 `next/image`) |
| P2-2 | 🟡 | Teljesítmény | Teljes termékrekordok utaznak a kliensre |
| P2-3 | 🟡 | Keresés | Teljes katalógus-beolvasás, nincs ékezet-normalizálás |
| P2-4 | 🟡 | UX | Globális 2 mp-es átmenet lelassít minden hovert |
| P2-5 | 🟡 | UX | Grill sötét téma villanása betöltéskor |
| P2-6 | 🟡 | Adatbázis | Egyetlen index sincs |
| P2-7 | 🟡 | Karbantartás | Feltöltött fájlok sosem törlődnek |
| P2-8 | 🟡 | Kiszolgálás | `/uploads` prefix-ellenőrzés + streaming/ETag hiánya |
| P2-9 | 🟡 | Biztonság | Nincsenek biztonsági HTTP-fejlécek |
| P2-10 | 🟡 | Biztonság | Nincs brute-force védelem a loginon |
| P3-1 | 🔵 | Tooling | Az ESLint nem fut le |
| P3-2 | 🔵 | Tooling | Nincs egyetlen automatizált teszt sem |
| P3-3 | 🔵 | Függőségek | 8 használaton kívüli npm csomag |
| P3-4 | 🔵 | Adatintegritás | Admin írások nem tranzakcionálisak |
| P3-5 | 🔵 | Adatintegritás | Variánsok újra-létrehozása minden mentéskor |
| P3-6 | 🔵 | Séma | Holt `categories.parentId` oszlop |
| P3-7 | 🔵 | Hibakezelés | Kategória törlésekor nyers DB-hiba |
| P3-8 | 🔵 | i18n/a11y | Nem lokalizált `aria-label`-ek |
| P3-9 | 🔵 | a11y | Lightbox: nincs fókusz-csapda, `role`, scroll-lock |
| P3-10 | 🔵 | Kódminőség | Ismétlődő elrendezés-kód |
| P3-11 | 🔵 | React | Törékeny kulcsok (`spec.label`, `group.nameHu`) |
| P3-12 | 🔵 | React | Nem tisztított `setTimeout` |

---

## Javasolt sorrend a javításokhoz

1. **Egy menet, gyorsan:** P0-1 (`requireAdmin` mindenhova), P0-2, P0-3, P0-4 — ezek
   együtt kb. egy fájlnyi munka, és a legnagyobb kockázatot veszik le.
2. **Deploy-higiénia:** P0-7 (`.dockerignore`), P0-8, P2-9 (fejlécek).
3. **SEO-csomag:** P1-6 teljes egészében (sitemap + metadata + hreflang + JSON-LD) +
   P1-11 (404 oldal) + 💡1 (blog URL-ek). Ez az élesítés előtti legfontosabb blokk.
4. **Árazás rendbetétele:** P1-1 + 💡4.
5. **Rendelés-folyamat használhatóvá tétele:** P1-9, P1-10, P1-3, P1-4.
6. **Teljesítmény:** P2-1 (`next/image`) — önmagában a legnagyobb mérhető nyereség, utána P2-2.
7. **Jogi tartalom:** P0-5, P0-6 — ehhez tőled kellenek a valós szövegek/adatok.
8. Végül a P3-as tisztogatás, kezdve a P3-1-gyel és P3-2-vel (linter + tesztek), mert
   ezek után minden további javítás biztonságosabb.

---
---

# Javítási napló — 2026-09-08

Mind a 42 tétel elkészült. Az alábbi lista tételenként rögzíti, **mi történt**, és ahol
a megvalósítás eltért a fenti javaslattól, **miért**.

## 🔴 P0

**P0-1 — Admin Server Actionök hitelesítése.** Új `src/lib/require-admin.ts`, amit
mind a **21** exportált admin action első sorában meghívunk (termékek, kategóriák,
sorozatok, extrák, hozzávalók, szállítás, beállítások, CSV-import, rendelés-státusz).
Két dolog került a javaslaton felül:
- Az id-vel dolgozó actionök (`deleteProduct(id)` stb.) most **zod-validálják** az
  id-t is — ezek bound argumentumként a hálózatról jönnek, nem lokális hívások.
- A `resolvePrice` átkerült a `products/actions.ts`-ből a `src/lib/pricing.ts`-be:
  egy `"use server"` fájl minden exportja önálló, hívható végpont lesz, tehát egy
  segédfüggvényt exportálni onnan maga is felület-növelés.

Regressziós védőháló: `src/app/admin/__tests__/action-auth.test.ts` — 23 teszt, ami
minden admin actiont session nélkül hív, és nemcsak a hibaüzenetet ellenőrzi, hanem
azt is, hogy **az adatbázishoz hozzá sem nyúlt** (bármilyen DB-hívás azonnal bukik).

**P0-2/P0-3/P0-4 — Checkout.** A javasolt pontonkénti ellenőrzések helyett egy közös
`src/lib/cart-validation.ts` (`resolveCart`) készült, ez a 💡6-os ötlet megvalósítása
is egyben. Ugyanez az egy függvény szolgálja ki a `/kosar`-t, a `/penztar`-t és a
`createOrder`-t, tehát a vevő által látott és a ténylegesen rögzített ár **nem tud
eltérni**. Ellenőrzi: variáns↔termék összetartozás, `inStock` (termék és variáns),
`priceOnRequest`, ár-eltérés a kosárhoz képest, és `max(99)` darabszám.
15 teszt fedi (`cart-validation.test.ts`), köztük külön az árcsalás-forgatókönyv.

**P0-5 — Jogi megfelelés.** Három új oldal: `/impresszum`, `/aszf`, `/adatvedelem`
(közös `LegalPage` keretben). A checkoutra kötelező ÁSZF+adatkezelés elfogadó
checkbox került, az elfogadás időpontja az `orders.terms_accepted_at` oszlopba
mentődik (migráció `0018`), és a rendelés-részletező meg is mutatja. A gomb felirata
„Megrendelés elküldése (fizetési kötelezettséggel)".
**⚠️ Rád vár:** az ÁSZF és az adatvédelmi tájékoztató sárgával kiemelt `TODO` mezői
(cégnév, székhely, cégjegyzékszám, adószám, tárhelyszolgáltató, szállítási határidő,
jótállási idő). A cég valós adatait nem találtam ki — a helyük megvan, ki kell tölteni,
és a szöveget jogásszal jóváhagyatni. Cookie-bannert **tudatosan nem** raktam be:
a projekt csak működéshez szükséges technikai tárolást használ (kosár, pénznem),
ehhez nem kell hozzájárulás — ezt az adatvédelmi tájékoztató 3. pontja ki is mondja.

**P0-6 — Elérhetőségek.** Új `src/lib/company.ts` az egyetlen forrás; a lábléc, a
kapcsolat-modal, a felső sáv és az Impresszum mind innen olvas. A kitalált
`+36 1 234 5678` eltűnt.

**P0-7 — `.dockerignore`.** Elkészült; kizárja a `.env*`-ot, a `node_modules`-t,
`.next`-et, `.git`-et, `uploads`-ot, `Ideiglenes`-t. A build context ~1 GB-ról
néhány MB-ra esik, és a titkok nem kerülnek image-rétegbe.

**P0-8 — DB-jelszó.** `${DB_PASSWORD:?...}` — hiányzó jelszó esetén a stack
**nem indul el**, nem pedig a `zw_password` alapértelmezettel fut.

**P0-9 — Blog HTML.** Új `sanitizeArticleHtml()` (megengedőbb allowlist a cikkekhez:
címsorok, listák, képek, táblázatok — de se `script`, se `iframe`, se `style`, se
esemény-attribútum). Élőben ellenőrizve: a 8356 karakteres cikktörzsben 0 db
`<script>`, `<iframe>`, `onerror=`, `onclick=`. A Soro token env-változóba került
(`SORO_EMBED_TOKEN`), a régi érték maradt fallbacknek.

## 🟠 P1

**P1-1 + 💡4 — Árazás.** Két rétegben oldottam meg, ahogy javasoltam:
- `src/lib/reprice.ts` — az árfolyam mentése **újraszámolja** a teljes katalógust
  (termékek `priceHufManual=false`-szal, extrák, hozzávalók), három halmaz-alapú
  `UPDATE`-tel, tranzakcióban. Az admin visszajelzést kap: „Újraszámolva: 37 termék,
  5 extra, 18 hozzávaló".
- A `<Price>` komponens mostantól **a beírt EUR értéket** írja ki EUR módban, ha van
  ilyen — nem a forintból visszaosztottat. Ezzel a kerekítési csúszás is megszűnt.
- Az MNB-gomb már csak *lekéri* az árfolyamot, nem menti — a mentés (és az
  újraszámolás) tudatos, gombnyomásos lépés maradt.

**P1-2 — 1 M Ft-os szabály variánsoknál.** Az `orderOnly` a kiválasztott variáns
**tényleges** árából számolódik (`ProductActions`), és a szerver is kikényszeríti:
a `createOrder` a végösszeg alapján `order_only` státusszal rögzíti a rendelést.

**P1-3 — Elavult kosár.** Új `useCartSync` hook: a `/kosar` és `/penztar` betöltéskor
újraárazza a kosarat a szerver ellen. Ártól eltérésnél figyelmeztet, törölt terméket
eltávolít és megnevezi, elfogyott/„Hamarosan" tételnél letiltja a továbblépést.

**P1-4 — Hidratálási villanás.** A `CartProvider` publikálja a `hydrated` állapotot;
mindkét oldal skeletont mutat, amíg a localStorage be nem olvasódott. Nincs többé
„üres a kosarad" felvillanás.

**P1-5 — CSS-injekció.** A kosárkép `background-image` helyett `<img>` (illetve
`SafeImage`).

**P1-6 — SEO.** A teljes csomag:
- `src/app/sitemap.ts` — 250 URL, kategóriák + termékek + blogcikkek, mindegyik
  hreflang-alternatívákkal. (Kérésre generálódik, nem build-időben: a Docker build
  fázisában nincs DB-kapcsolat.)
- `generateMetadata` a termék-, kategória- és blogcikk-oldalakon.
- `metadataBase`, canonical és hreflang (`hu`/`en`/`x-default`) mindenhol —
  új `src/lib/seo.ts`.
- JSON-LD: `Product` + `Offer` + `BreadcrumbList` a termékoldalon, `BreadcrumbList`
  a kategórián, `BlogPosting` a cikkeken.
- Open Graph + Twitter card.
- A keresési találati oldal `noindex` lett.
- **Ami tudatosan kimaradt:** a régi Webflow URL-ek redirect-térképe. Ehhez a régi
  sitemap és az új slugok kézi párosítása kell — élesítés előtt, veled együtt.

**P1-7 — Nyelvváltó.** Az aktuális oldalon marad (`router.replace(pathname, {locale})`),
nem dob a főoldalra.

**P1-8 — Termékadatok angolul.** A `ProductCard`, a kosár, a checkout-összegző és a
rendelés-visszaigazoló mind a `localized()` helperen keresztül megy; a kosártétel
tárolja a `nameEn`/`variantLabelEn` mezőt is.

**P1-9 — Rendeléskezelés.** Új `/admin/orders/[id]` részletező: tételek, egységár,
súly, szállítás, végösszeg, vevő (kattintható e-mail/telefon), szállítási cím,
ÁSZF-elfogadás időpontja. Státuszváltó 6 állapottal (`order-status.ts`), a listán
színes állapot-jelvény.

**P1-10 — Rendelés-értesítők.** `src/lib/mail.ts` + `order-mail.ts`: vevői
visszaigazoló és belső értesítő e-mail. **Függőség nélkül**, a Resend REST API-ját
hívja `fetch`-csel — a szolgáltató egyetlen függvény mögé van zárva, SMTP-re váltani
egy fájl átírása. Ha nincs beállítva (`RESEND_API_KEY`/`MAIL_FROM`), csak naplóz:
egy levélküldési hiba **nem** buktathat el egy már rögzített rendelést.
**⚠️ Rád vár:** Resend-fiók (vagy szólj, és átírom SMTP-re) + a három env-változó.

**P1-11 — Hibaoldalak.** `[locale]/not-found.tsx` (márkás 404 fejléccel, lábléccel és
népszerű oldalakkal), `[locale]/error.tsx` és `app/global-error.tsx`.

## 🟡 P2

**P2-1 — Képoptimalizálás.** 39 `<img>`-ből mind átállt. Mért eredmény egy valós
termékfotón (`webflow-import/photos`, 3,94 MB JPEG):

| megjelenítés | méret | megtakarítás |
|---|---|---|
| 256 px kártya | **24 KB** AVIF | −99,4 % |
| 640 px | **122 KB** AVIF | −96,9 % |
| 1200 px | **334 KB** AVIF | −91,5 % |

Menet közben új komponens kellett: `SafeImage`. A `next/image` **kivételt dob** egy
nem konfigurált távoli hosztra, ami az egész oldalt 500-ra viszi — és az adatbázisban
**még mindig vannak Webflow CDN-linkek** (`cdn.prod.website-files.com`) a két korai
placeholder terméken. A `SafeImage` a saját `/uploads/...` képeket optimalizálja, a
külső URL-eket sima `<img>`-ként rendereli. **⚠️ Rád vár:** ezekre a termékekre fel
kell tölteni a képet az adminban — a Webflow-oldal megszűnésekor ezek eltűnnek.
(A blog képei egyébként Supabase-en vannak, nem a trysoro.com-on — ezt is csak az
élő 500-as hiba mutatta meg.)

**P2-2 — RSC payload.** A kategória-, kereső- és kiemelt-termék lekérdezések
`columns:` projekcióval csak a kártyához kellő ~16 mezőt húzzák le. A hosszú HTML
leírások, `specs`, `variantOptions`, `documents` jsonb mezők nem utaznak a kliensre.

**P2-3 — Keresés.** Ékezet-normalizálás (`fold()`), így a „hoszivattyu" megtalálja a
„hőszivattyú"-t; keres a cikkszámban és a sorozatnévben is; mindkét nyelv mezőit
nézi, mert a katalógus csak részben fordított.

**P2-4 — 2 mp-es átmenet.** A hosszú cross-fade `.theme-transition` osztályhoz kötve,
amit a `GrillThemeProvider` **csak a témaváltás 2 másodpercére** tesz az `<html>`-re.
A hover-effektek visszakapták a normál sebességüket.

**P2-5 — Téma-villanás.** A `dark-theme` osztály már **az első festés előtt** felkerül:
a `/grillek` útvonalakra a layout `<head>`-jében lévő inline szkript, a grill
termékoldalakra a `GrillTheme` által kiírt inline szkript teszi fel (a szerver
tudja a kategóriát, nincs miért megvárni a hidratálást). A `useGrillThemeActive`
MutationObserver-e kikerült — a context úgyis tudja az értéket.

**P2-6 — Indexek.** Migráció `0018`: `products.category_id`, `products.series_id`,
`products.is_featured`, `product_series.category_id`, `product_variants.product_id`,
`product_features.group_id`, `shipping_rates.zone`, `orders.created_at`.

**P2-7 — Árva fájlok.** `src/lib/uploads-gc.ts` + admin felület a Beállítások alatt:
kilistázza a fájlokat, amikre semmi nem hivatkozik, mérettel együtt, és egy gombbal
törli őket. Törlés előtt **újra ellenőrzi** az adatbázist, hogy egy elavult lista ne
törölhessen időközben használatba vett fájlt. Szándékosan nem törlünk mentéskor:
ugyanaz az URL több mezőben is szerepelhet (`images`/`mainImage`/`cardImage`).

**P2-8 — `/uploads` route.** A prefix-ellenőrzés javítva (`path.sep`-pel, így a
`/app/uploads-barmi` már nem megy át), streamelés `readFile` helyett, `ETag` + `304`,
és csak az ismert MIME-típusok szolgálódnak ki.

**P2-9 — Biztonsági fejlécek.** `next.config.ts` → CSP-n kívül a teljes alap:
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, `Strict-Transport-Security`.

**P2-10 — Login.** 15 perces ablakban 8 sikertelen próbálkozás után zárolás
e-mail-cím szerint, és **dummy bcrypt-összehasonlítás** nem létező felhasználónál,
hogy a válaszidőből ne lehessen felhasználót felderíteni. Megjegyzés: a számláló
process-memóriában él, ami egy konténernél pontosan jó; több példánynál Postgresbe
vagy Redisbe kell tenni (a kód kommentje ezt rögzíti).

## 🔵 P3

**P3-1 — ESLint.** A `FlatCompat` kikerült, a natív flat configokat importáljuk
(`eslint-config-next/core-web-vitals`, `/typescript`). Az `npm run lint` **először
fut le ebben a projektben**. Az első futás 65 problémát talált — mind javítva, a
`no-img-element` az admin alatt tudatosan kikapcsolva (blob: URL-eket a `next/image`
nem tud kezelni, és ott nincs SEO/LCP tét). Jelenleg **0 hiba, 0 figyelmeztetés**.

**P3-2 — Tesztek.** `vitest` + **94 teszt** 12 fájlban: `currency`, `config`,
`pricing`, `csv`, `search`, `shipping`, `sanitize-description`, `ar-url`, `seo`,
`localized`, `cart-validation`, `action-auth`. Futtatás: `npm test`.
A tesztek írás közben **két valódi hibát találtak**:
1. A `localeUrl("/")` záró perjel nélküli canonicalt adott (`https://host` vs
   `https://host/` — a keresők két külön URL-nek látják). Javítva.
2. A `resolvePrice` üres EUR-mezős ága (a napló szerint egyszer egy valós termék árát
   0 Ft-ra írta) — most regressziós teszt őrzi.

**P3-3 — Függőségek.** Eltávolítva: `react-hook-form`, `@hookform/resolvers`,
`radix-ui`, `class-variance-authority`, `tailwind-merge`, `@tailwindcss/typography`,
`clsx`. A `stripe` maradt (a tervezett fizetéshez). A `@types/node` 20 → 22-re
frissült, hogy megegyezzen a Docker futtatókörnyezettel (`node:22-alpine`).

**P3-4 — Tranzakciók.** A `createProduct`/`updateProduct` négy írása egyetlen
`db.transaction`-ben fut; a CSV-import **soronként** tranzakcionális (a riport
soronkénti, egy rossz sor nem vonhatja vissza a jókat, de egy sor nem is
alkalmazódhat félig).

**P3-5 — Variáns-ID-k.** A szerkesztő átadja a DB-id-t, a szinkron pedig upsertel
(`DELETE ... NOT IN` + `UPDATE`/`INSERT`), tehát a `product_variants.id` már nem
változik minden mentéskor, és a rendelések hivatkozásai érvényben maradnak. Az
`UPDATE` `productId`-re is szűr, hogy egy hamisított id ne írhassa át más termék
variánsát.

**P3-6 — `categories.parentId`.** Törölve (migráció `0019`). Helyette a
`categories.imageUrl` került be — ld. 💡3.

**P3-7 — Kategória törlése.** Előbb megszámolja a benne lévő termékeket, és
kulturált üzenetet ad („Ez a kategória 12 terméket tartalmaz — előbb helyezd át vagy
töröld őket."). Ugyanez a sorozatoknál is. Az összes admin törlés megerősítést kér.

**P3-8 — `aria-label`-ek.** A `common` névtérbe kerültek, HU/EN egyaránt
(lightbox, galéria, hamburger menü, igen/nem specifikáció-ikonok).

**P3-9 — Lightbox.** `role="dialog"` + `aria-modal`, fókusz-csapda Tab/Shift+Tab-ra,
fókusz-visszaállítás bezáráskor, háttér-görgetés tiltása, `aria-live` a számlálón.

**P3-10 — Elrendezés.** Új `Container` komponens (`px-16 max-lg:px-6` egy helyen);
a most írt oldalak már ezt használják. A régi oldalak fokozatosan átállíthatók —
egyben átírni őket felesleges vizuális kockázat lett volna.

**P3-11 — React kulcsok.** `${spec.label}-${i}` és `${group.nameHu}-${i}`.

**P3-12 — `setTimeout`.** `useRef` + cleanup a `ProductActions`-ben.

## 💡 Ötletek

**💡1 — Blog URL-ek.** Új `/blog/[slug]` route saját `generateMetadata`-val és
`BlogPosting` JSON-LD-vel; a régi `/blog?post=<slug>` **307-tel átirányít** rá, tehát
egyetlen megosztott link sem törik el. A lista- és a cikkoldal külön route, így a
cikk már nem húzza le a teljes cikklistát.

**💡2 — Termékkártya 70%.** A kártya kitölti a celláját (nincs több 30%-nyi
kattinthatatlan holt zóna); a keskeny megjelenést a rács adja:
`grid-cols-[repeat(auto-fill,minmax(230px,1fr))]`. Vizuálisan gyakorlatilag ugyanaz,
csak reszponzívabb — **ezt érdemes ránézned, mert a kártyaszélességet te hangoltad be.**

**💡3 — Kategória-fotó.** Új `categories.image_url` + feltöltő az admin kategória-
űrlapokon. A főoldali kártya ezt használja; a „legdrágább termék fotója" logika
fallback maradt. Így egy új, drága termék felvitele nem rajzolja át a főoldalt.

**💡4 — EUR forrásigazság.** Ld. P1-1. A teljes séma-fordítást (EUR legyen az oszlop,
HUF a cache) **nem** csináltam meg: a `priceHuf` ellen fut minden szűrés, rendezés és
rendelés-számítás, azt egy körben átforgatni aránytalan kockázat lett volna. A
gyakorlati tünet (elcsúszó EUR ár) így is megszűnt.

**💡5 — Szemantikus tokenek.** **Nem csináltam meg** — ez az egyetlen ötlet, amit
tudatosan kihagytam. A `.dark-theme` felülírásokat szemantikus tokenekre cserélni
(`bg-surface` a `bg-white` helyett) gyakorlatilag minden komponenst érint, tisztán
vizuális kockázattal és nulla funkcionális nyereséggel — egy ilyen átállás a saját
körét érdemli, screenshot-összehasonlítással. A P2-4-es javítás közben a struktúra
viszont áttekinthetőbb lett. **Szólj, ha nekiálljunk.**

**💡6 — Kosár-érvényesítő.** Megvan, ld. P0-2/P0-3 (`resolveCart`).

**💡7 — Deploy.** A `Dockerfile` kapott egy `migrator` stage-et; a compose-ban a
`migrate` service lefuttatja a migrációkat és kilép, a `web` pedig
`service_completed_successfully` feltétellel indul utána. Healthcheck a `db`-n
(`pg_isready`) és a `web`-en (új `/api/health` végpont, ami az adatbázist is
megpingeli). Így nem indulhat el az app migrálatlan sémára.
Az `autossh`-alagút **nem** készült el — az a fejlesztői gép beállítása, nem a repóé;
szólj, ha kéred, és megírom a systemd unitot.

**💡8 — Naplózás.** Sentry-t nem húztam be (új külső függőség és fiók). Helyette a
`/api/health` végpont ad kívülről ellenőrizhető állapotot, és a levélküldés hibái
strukturáltan naplózódnak. **Szólj, ha kéred a Sentry-t.**

---

## Playwright MCP

`.mcp.json` létrejött a repo gyökerében (izolált, headless Chromium). A beállítás
lépései a `.mcp.json.README.md`-ben: jóváhagyás induláskor, majd egyszer
`npx -y playwright install chromium`. Ettől kezdve saját böngészőben tudom
végigkattintani a Server Action / űrlap folyamatokat — pontosan azt, amit a napló
szerint eddig többször nem sikerült böngésző nélkül reprodukálni.

---

## Ami rád vár

1. **ÁSZF / Adatvédelem / Impresszum** — a sárga `TODO` mezők kitöltése
   (cégnév, székhely, cégjegyzékszám, adószám, tárhelyszolgáltató, szállítási
   határidő, jótállási idő), majd jogi jóváhagyás.
2. **E-mail** — Resend-fiók + `RESEND_API_KEY`, `MAIL_FROM`,
   `ORDER_NOTIFICATION_EMAIL`. (Vagy szólj, és SMTP-re írom át.)
3. **Két placeholder termék képe** — `bull-beepitett-grill` és `hanscraft-hordo`
   még Webflow CDN-linkre mutat.
4. **Szerver env-változók** — `DB_PASSWORD` (kötelező lett), és élesítéskor
   `NEXT_PUBLIC_STAGING_NOINDEX=false` + a valós `NEXT_PUBLIC_APP_URL`
   (ebből épül minden canonical, hreflang és sitemap URL).
5. **Vizuális átnézés** — főleg a termékkártya-rács (💡2) és a grill sötét téma
   váltása (P2-4, P2-5).
6. **Redirect-térkép** a régi Webflow URL-ekről — élesítés előtt, közösen.
