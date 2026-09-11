# Zedonwellness webshop — hol tartunk

*Készült: 2026-09-11. Ez egy átadó-összefoglaló: mi a projekt, mi történt eddig,
és mit kell tudni a folytatáshoz.*

---

## A projekt egy mondatban

A `zedonwellness.com` ~7 éves Webflow-oldalának leváltása saját kódú webshopra:
prémium jakuzzik, szaunák, grillek és kiegészítők, HU/EN nyelven, saját admin
felülettel.

**Új helye a költözés után:**

```
/home/zsozs/MUNKA/Zedonwellness/zw_code/
```

Ellenőriztem: a kódban nincs beégetett régi elérési út, és minden ellenőrzés
lefut az új helyről is.

---

## Hol tartunk most

| | |
|---|---|
| Ág | `master` (minden beolvasztva és feltolva) |
| Utolsó commit | `cdf5014` — *style: kosár és pénztár egységesítése* |
| Repó | `git@github.com:vzsozs/zedonwellness.git` |
| Típusellenőrzés | tiszta |
| Linter | 0 hiba, 0 figyelmeztetés |
| Tesztek | **94 teszt, 11 fájl** — mind zöld |
| Build | sikeres |
| Migrációk | 21 |
| i18n kulcsok | 300–300 (HU/EN paritás rendben) |

**Készen van:** a teljes főoldal, a listaoldalak, a blog, „A cég", a jogi oldalak,
a kosár és a pénztár, az admin felület, valamint a kód-audit összes javítása.

**Nincs kész:** a termékoldal (`/termek/[slug]`) redesignja a mockup alapján —
ez az egyetlen nagyobb vizuális blokk, ami hátravan.

---

## Két nagy munkafázis volt

### 1. Teljeskörű kód-audit és 42 hiba javítása

A repóban: **`hibaista260907.md`** (1075 sor) — a feltárás és tételes javítási
napló. A négy legsúlyosabb találat, amit érdemes fejben tartani:

- **Az összes (21) admin Server Action hitelesítés nélkül volt hívható.** A
  `(protected)/layout.tsx` `auth()` hívása csak az *oldalak renderelését* védi —
  a Server Actionök önálló, action-ID-vel címzett HTTP-végpontok, oda a layout
  redirectje sosem fut le. Ez a projekt legfontosabb visszatérő tanulsága.
- **Checkout árcsalás:** a `variantId` nem volt a `productId`-hoz kötve, tehát
  egy drága termék mellé odatehető volt egy olcsó variáns azonosítója.
- **Nem volt `.dockerignore`,** így a `.env.local` (DB-jelszó, `AUTH_SECRET`,
  Stripe kulcsok) beleégett a builder image rétegébe.
- **Az árfolyam-frissítés nem számolta újra a katalógust** — az EUR ár minden
  frissítéssel távolodott attól, amit az admin beírt.

Emellett: teljes SEO-csomag (sitemap, metaadatok, hreflang, JSON-LD), jogi
oldalak, képoptimalizálás, működő linter és a 94 teszt mind ebben a körben
született.

### 2. Főoldal- és aloldal-redesign a „Clude" mockup alapján

A mockup: `Ideiglenes/webflow_database/Clude/` (`index.html`, `szaunak.html`,
`hc-1.html`, `styles.css`).

**A legfontosabb döntés:** a mockup meleg terrakotta palettáját és serif
tipográfiáját **nem** vettük át — a türkiz/coprBlue színvilág és az Inter/Manrope
páros maradt. Csak az **elrendezések** jöttek át. A mockup tehát referencia, nem
forrás.

---

## Konvenciók, amiket követni kell

Ezek nélkül a következő kör szét fogja csúsztatni az oldalt.

**Rács.** Minden szekció a `Container` komponensen ül:
`max-w-[1480px]` + **5%** oldalbehúzás (mobilon fix 24px). Háttérrel rendelkező
szekciónál a háttér faltól falig fut, csak a *tartalom* kerül a rácsra. Ez a
főoldalon és minden aloldalon azonos — lemérve 220–1700 px 1920-as nézetben.

**Lekerekítés.** Két token a `globals.css` `@theme` blokkjában:
`--radius-control` (8px — gombok, űrlapmezők) és `--radius-card` (12px —
kártyák, panelek). A base rétegben egy szabály minden
`<button>/<input>/<select>/<textarea>` elemre érvényes, tehát **nem kell
komponensenként ismételni**. Gomb-kinézetű `<Link>`-eknél viszont igen, mert
azokra az elem-szintű szabály nem hat.

**Szekció-fejléc.** Eyebrow pill (`rounded-full`, coprBlue 10% háttér) + 42px-es
cím. Középre zárva vagy balra, jobbra egy „összes…" gombbal.

**Kártya-hover.** 3px emelkedés + accent keret + erősebb árnyék, 300ms. Nagy
médiakártyáknál (kategória) 5px, és a háttérkép 1,05-re nagyít.

**`SafeImage`, ne közvetlen `next/image`** — ha a kép adminból jön. A
`next/image` *kivételt dob* nem konfigurált távoli hosztra, és ezzel az egész
oldalt 500-ra viszi; az adatbázisban pedig még mindig vannak Webflow CDN-linkek.

**`requireAdmin()` minden admin Server Action első sorában.** Regressziós
védőháló: `src/app/admin/__tests__/action-auth.test.ts` (23 teszt).

**Magázódás** a teljes publikus felületen. Az admin marad tegező (belső eszköz).

**Egyetlen termékkártya** van: `src/components/product-card.tsx`. A kategórialista,
a kereső, a főoldali kiemelt szekció és a termékoldali „hasonló termékek" mind ezt
használja.

---

## Buktatók, amikbe már belefutottunk

- **A `.dark-theme` csak ismert utility-osztályokat ír felül.** A `.text-ink`
  világosra vált, a `bg-white/90` viszont nem (csak a `.bg-white` szerepel a
  felülírások közt) — így lett fehér alapon fehér a „Raktáron" plecsni a grill
  oldalon. Fotón ülő elemnél ezért nem-token színt kell használni
  (`text-neutral-900`).
- **Vízszintes túlnyúlást nem lehet elemek `getBoundingClientRect()`-jével
  megtalálni**, ha szövegcsomó lóg túl (pl. szóköz nélküli e-mail cím). A
  `document.documentElement.scrollWidth` viszont megmutatja.
- **Egy tördelt bekezdés doboza a `max-width` szerint széles, nem a leghosszabb
  soráé.** Emiatt látszott egyenetlennek a hero TÜV-kártyájának jobb margója,
  pedig a padding végig szimmetrikus volt.
- **Az SSH-alagút tud úgy „beragadni", hogy a TCP-port nyitva marad, de a
  Postgres-kézfogás sosem fut le.** Ilyenkor hálózati hibát látsz, és könnyű
  kódhibára gyanakodni. Mindig valódi lekérdezéssel ellenőrizd.
- **A `tsc` nem fog ki mindent, amit a build igen** — például azt, hogy egy
  `"use server"` fájl csak async függvényeket exportálhat. Nagyobb kör után
  `npm run build` is kell.
- **Mérj, ne becsülj.** A Playwright Chromium telepítve van
  (`~/.cache/ms-playwright`); képernyőképhez és **pontos doboz-méréshez** is.
  Kétszer is félremértem képernyőképről, mielőtt ténylegesen lemértem.

---

## Indulás egy új munkamenetben

```bash
cd /home/zsozs/MUNKA/Zedonwellness/zw_code

# 1) SSH-alagút a távoli dev adatbázishoz (ezt kell először gyanúba venni,
#    ha az oldal "lefagy" vagy hálózati hibát ír)
ssh -i ~/.ssh/hhm_shop_deploy_key -f -N -L 127.0.0.1:5434:127.0.0.1:5434 root@185.208.227.129

# beragadt alagút esetén előbb:
pgrep -af "ssh.*-L.*5434"   # majd: kill <pid>

# 2) dev szerver
npm run dev                  # http://localhost:3000

# 3) ellenőrzési rutin minden kör után
npx tsc --noEmit -p .
npm run lint
npm test
npm run build                # nagyobb kör után
```

**Séma-változtatás menete:** `src/db/schema/index.ts` szerkesztése →
`npm run db:generate` → `npm run db:migrate`. Ha a drizzle-kit interaktív
promptot kérne (átnevezés-detektálás), bontsd két migrációra: előbb hozzáadás,
utána külön törlés.

**Egyszeri adatmódosító szkriptek helye:** `scripts/migrate-webflow/`. Minta: a
`dotenv` betöltése a fájl tetején, a `db` importja **dinamikus importtal** a
`config()` hívások UTÁN.

---

## Ami még nyitva van

### Rád vár (nem kódolási feladat)

1. **Cégjegyzékszám (IČO)** és **tárhelyszolgáltató** — a két utolsó `TODO` az
   Impresszumon (`src/lib/company.ts`). Sehol nincs publikálva, ezért nem
   találtam ki.
2. **E-mail küldés élesítése** — Resend-fiók és a `RESEND_API_KEY`, `MAIL_FROM`,
   `ORDER_NOTIFICATION_EMAIL` változók. A kód enélkül is működik, csak naplóz:
   egy levélküldési hiba **nem** buktathat el egy már rögzített rendelést.
3. **Két placeholder termék képe** (`bull-beepitett-grill`, `hanscraft-hordo`)
   még Webflow CDN-re mutat — a régi oldal megszűnésekor eltűnnek.
4. **Élesítéskor:** `NEXT_PUBLIC_STAGING_NOINDEX=false` és a valós
   `NEXT_PUBLIC_APP_URL` (ebből épül minden canonical, hreflang és sitemap URL),
   plusz a `DB_PASSWORD` (kötelező lett, nincs alapértelmezése).

### Üzleti döntést igényel

Az élő ÁSZF és a megépített webshop **három ponton eltér**:

- **Szállítási díjak.** Az ÁSZF fix, kategóriánkénti díjakat sorol (szauna
  60–90e Ft, jakuzzi távolság szerint 120–200e, swim spa 250e, úszómedence
  350 Ft/km) — a webshop viszont **GLS súlysávos** díjat számol.
- **50% előleg.** Az ÁSZF szerint a rendelés csak az előleg beérkezésekor
  érvényes; a checkoutban ilyen lépés nincs.
- **Jogi átnézés.** Az üzemeltető **szlovák cég** (Zedonwellness s.r.o.,
  Štúrovo, SK2121666118, 23% áfa) — az elállási és panaszkezelési szakaszokat én
  tettem hozzá, mert az élő dokumentumból hiányoznak, fogyasztói webshopnál
  viszont kötelezőek.

### Fejlesztési feladat

- ~~**Termékoldal redesign**~~ — a user 2026-09-11-én úgy döntött, hogy a
  termékoldal jó úgy, ahogy van. Nem kell hozzányúlni.
- **Mentési szkript** (2026-09-11-én megbeszélve, később csináljuk meg). Egy
  parancs, ami az adatbázist **és** az `uploads/` mappát egy csomagba menti —
  a kettő külön mit sem ér, mert a DB csak útvonalakat tárol, a ~136 MB kép a
  lemezen él. Érdemes időzítve is futtatni a szerveren. Kézi minta addig:
  `docker exec zw-shop-db pg_dump -U zw_user -d zw_shop -Fc`, l. a
  `database/backups/` mappát.
- **CSV export/import kibővítése** (2026-09-11, később). A CSV **marad tömeges
  szerkesztő eszköz**, nem lesz mentés — de a hiányzó termék-mezőket fel kell
  venni. Ma 22 lapos oszlop megy ki; hiányzik a hosszú leírás (HU/EN), a
  galéria, a főkép/kártyakép, a specifikáció, a variáns-opciók, a dokumentumok,
  az „ár kérésre" és a specifikáció-pozíció. Az oszlopszerződés egy helyen van:
  `src/app/admin/(protected)/products/csv-columns.ts`.
  **Két csapda, amit a bővítéskor kezelni kell:** (1) egy üresen hagyott
  jelölőnégyzet-cella ma *nem*-et jelent, tehát egy hiányzó oszlop csendben
  kikapcsolja a „Raktáron"/„Kiemelt" jelölőket; (2) a párosítás **szlug**
  szerint megy, az `id` oszlopot a beolvasás nem használja, így egy átírt szlug
  nem átnevez, hanem új terméket hoz létre a régi mellé.
- **Webflow redirect-térkép** élesítés előtt — kézi slug-párosítást igényel.
- **Szemantikus színtokenek** (💡5 a hibalistában): a `.dark-theme` ma
  utility-osztályokat ír felül, ami törékeny. Tudatosan halasztva, mert minden
  komponenst érint.

### Commitolatlan fájlok

Tíz új kép/ikon van a `public/` mappában (Hanscraft, Quadra X, BULL, szauna
ikonok). Ezek még nincsenek se commitolva, se bekötve sehova — gondolom a
termékfelvitelhez vagy a termékoldalhoz szánod őket.

---

## Hol olvass tovább

| Fájl | Mit tartalmaz |
|---|---|
| `FEJLESZTESINAPLO.md` | A projekt teljes története naponta, döntésekkel és indoklással. A végén **„Munkamódszer-jegyzetek"** szakasz — új munkamenet elején ezt érdemes elolvasni. |
| `hibaista260907.md` | A kód-audit 42 tétele prioritás szerint, fájl- és sorszám-hivatkozásokkal, alatta a tételes javítási napló. |
| `.mcp.json.README.md` | A Playwright MCP beállítása böngészős teszteléshez. |
| `Ideiglenes/webflow_database/Clude/` | A design mockup (referencia, nem forrás). |

---

## Együttműködési szokások, amik bejöttek

- **Egyben, listában küldöd a visszajelzéseket** — egy 15–20 pontos lista egy
  üzenetben teljesen jó, egy menetben végigmegyek rajta.
- **Git: csak akkor commitolok/pusholok, ha kéred.**
- **Az élő zedonwellness.com a saját tartalmad** — ha referenciaként adod meg,
  a szöveg és az elrendezés szó szerint átvehető.
- **Ha valamit nem tudok ellenőrizni** (cégadat, garanciaidő, darabszám), nem
  találom ki, hanem jelzem és üresen/`TODO`-val hagyom.
