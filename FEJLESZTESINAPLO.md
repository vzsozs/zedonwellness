# Zedonwellness — Fejlesztési Napló

Ez a fájl végigvezeti a zedonwellness.com új, kód szintű webshop-fejlesztésének menetét: döntéseket, mérföldköveket, nyitott kérdéseket.

## 2026-09-01 — Projekt indítás, tervezés

### Kiindulási helyzet
- Jelenlegi élő oldal: https://www.zedonwellness.com/ — Webflow-ban épült, ~7 éves.
- Menüszerkezet: Termékek (Masszázsmedence, Szauna, Jakuzzi vízkezelés, Kiegészítők), Szaniter (Zuhanykabin, Zuhanytálca, Kád, Kádparaván), Grillek (Beépített BBQ, Grillkocsik, Kemencék, Akció), céginfó (A cég, A gyár, Szerviz, Kapcsolat), Blog, EN nyelvi verzió.
- ~20+ termékkategória, sok modellváltozat (jakuzzik: HC Design, Celtic SPAS, SWIM SPA, OKA Design, Plug&Play, Cool Pool; szaunák 15+ variáció; szaniter; grillek; vegyszerek/kiegészítők 20+).
- Blog: Webflow CMS-ben, jelenleg 2 poszt.
- Sitemap felmérve — alapja lesz a redirect-tervnek élesítéskor.

### Döntések
- **Stack:** Next.js (TypeScript) + Prisma/Postgres + Stripe. Monolit app (nem külön frontend/backend repo).
- **Nyelvek:** HU (alapértelmezett) + EN, jövőben bővíthető architektúrával.
- **Blog:** marad Webflow CMS-ben, az új oldal API-n keresztül olvassa ki és jeleníti meg — nem duplikáljuk a szerkesztőfelületet.
- **Termékadatok:** nincs automata migráció — admin felületen kézzel visszük fel újra, alkalom a leírások/SEO szövegek tisztítására.
- **Szállítás:** fix/sávos szállítási díjtábla adminból kezelve (nem külső futár API). Nagyméretű termékeknél (jakuzzi, szauna) várhatóan egyedi ajánlat/kapcsolatfelvétel a folyamat.
- **Fizetés:** Stripe, EUR és HUF. 1.000.000 Ft (bruttó) felett a fizetés le van tiltva, csak megrendelés adható le.
- **Számlázás:** egyelőre nincs automata integráció (NAV/Számlazz.hu/Billingo) — külső rendszerben, kézzel történik. Későbbi bővítési pont.
- **Design:** előbb vizuális mockup készül és kerül jóváhagyásra, csak utána kódolás.
- **SEO:**
  - Tesztdomain: zw.formagyar.hu — a kezdetektől `noindex` + robots.txt tiltás, élesítéskor kapcsoljuk vissza a jelenlegi élő domainen.
  - A jelenlegi URL-struktúrát ahol logikus, követjük; ahol nem, redirect-térképet készítünk élesítéskor.
  - Cél: a jelenlegi organikus eredmények megtartása + javítása (meta, hreflang, sitemap, structured data).
- **Admin felület:** saját, a projekten belüli admin (termékek, kategóriák, rendelések, szállítási díjtábla, blog-kapcsolat).
- **Szerver/hosting:** saját VPS, Linux, több oldal Nginx + PM2 (feltehetően PM2 process manager) alatt. SSH hozzáférést a user adja, a szerver-oldali beállítást (Nginx vhost, PM2, SSL/certbot) Claude végzi, minden lépés egyeztetve/jóváhagyva.

### Nyitott / későbbi kérdések
- SSH hozzáférés részletei a VPS-hez (még nincs megadva).
- zw.formagyar.hu DNS/subdomain beállítása a tesztkörnyezethez.
- Webflow CMS API hozzáférés a bloghoz (API kulcs, site ID).
- Stripe fiók adatai (élő/teszt kulcsok).
- Pontos szállítási díjsávok (régiók/kategóriák szerint).
- Jövőbeli bővítés: NAV számlázó integráció, több nyelv.

### Következő lépés
Design mockupok készítése: főoldal, terméklista, termék részletező oldal.
