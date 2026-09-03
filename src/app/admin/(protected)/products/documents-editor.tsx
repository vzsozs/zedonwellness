"use client";

import { useState } from "react";
import { Plus, X, FileText } from "lucide-react";

type Doc = { key: string; label: string; url: string | null; fileName?: string };

let keySeq = 0;
const nextKey = () => `doc-${++keySeq}`;

export function DocumentsEditor({
  defaultDocuments,
}: {
  defaultDocuments: { label: string; url: string }[];
}) {
  const [docs, setDocs] = useState<Doc[]>(() =>
    defaultDocuments.map((d) => ({ key: nextKey(), label: d.label, url: d.url })),
  );

  function addDoc() {
    setDocs((d) => [...d, { key: nextKey(), label: "", url: null }]);
  }
  function removeDoc(key: string) {
    setDocs((d) => d.filter((x) => x.key !== key));
  }
  function update(key: string, patch: Partial<Doc>) {
    setDocs((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }

  const payload = JSON.stringify(
    docs.map((d) => ({ key: d.key, label: d.label, url: d.url })),
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Letölthető PDF dokumentumok (pl. Adatlap, Összeszerelési útmutató) —
        saját címkével, tetszőleges számban.
      </label>
      <input type="hidden" name="documentsData" value={payload} />

      <div className="flex flex-col gap-2.5">
        {docs.map((doc) => (
          <div key={doc.key} className="flex items-center gap-2.5 border border-line p-3">
            <FileText className="size-5 shrink-0 text-muted" strokeWidth={1.6} />
            <input
              value={doc.label}
              onChange={(e) => update(doc.key, { label: e.target.value })}
              placeholder="Címke — pl. Adatlap"
              className="min-w-0 flex-1 border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <label className="shrink-0 cursor-pointer text-xs font-semibold text-accent hover:text-accent-dark">
              {doc.url ? "Csere" : "Fájl"}
              <input
                type="file"
                name={`documentFile_${doc.key}`}
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) update(doc.key, { fileName: file.name });
                }}
              />
            </label>
            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden shrink-0 text-xs text-muted underline sm:inline"
              >
                megnyitás
              </a>
            ) : doc.fileName ? (
              <span className="hidden max-w-32 shrink-0 truncate text-xs text-muted sm:inline">
                {doc.fileName}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => removeDoc(doc.key)}
              aria-label="Dokumentum törlése"
              className="shrink-0 text-muted hover:text-red-600"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDoc}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
      >
        <Plus className="size-4" /> Dokumentum hozzáadása
      </button>
    </div>
  );
}
