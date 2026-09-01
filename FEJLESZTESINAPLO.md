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
