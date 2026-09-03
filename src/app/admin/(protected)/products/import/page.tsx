import Link from "next/link";
import { ImportForm } from "./import-form";

export default function ImportProductsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Termékek importálása CSV-ből</h1>
        <Link href="/admin/products" className="text-sm font-semibold text-accent hover:text-accent-dark">
          ← Vissza a termékekhez
        </Link>
      </div>

      <div className="mb-6 max-w-2xl border border-line bg-paper-muted p-5 text-sm text-muted">
        <p>
          A sorok a <span className="font-mono">szlug</span> oszlop alapján párosulnak: ha a
          szlug már létező terméké, azt frissíti, egyébként új terméket hoz létre.
        </p>
        <p className="mt-2">
          A <span className="font-mono">kategoria</span> oszlopba a kategória szlugja kell (pl.{" "}
          <span className="font-mono">grillek</span>), a <span className="font-mono">sorozat</span>{" "}
          a sorozat pontos neve — ha nem található, a mező üresen marad a terméken.
        </p>
        <p className="mt-2">
          A leírások, képek, konfigurációs opciók, termékváltozatok és extrák nem részei a
          CSV-nek — ezeket importálás után a termék szerkesztőjében kell beállítani.
        </p>
        <p className="mt-2">
          Legegyszerűbb, ha a{" "}
          <a href="/admin/products/export" className="font-semibold text-accent hover:text-accent-dark">
            CSV exportot
          </a>{" "}
          töltöd le kiindulásnak, és azt szerkeszted tovább.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
