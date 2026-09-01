"use client";

import { useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";

type Choice = {
  key: string;
  nameHu: string;
  imageUrl: string | null;
  previewUrl?: string;
};
type Group = { key: string; nameHu: string; choices: Choice[] };

let keySeq = 0;
const nextKey = (prefix: string) => `${prefix}-${++keySeq}`;

export function VariantOptionsEditor({
  defaultGroups,
}: {
  defaultGroups: {
    nameHu: string;
    nameEn: string;
    choices: { nameHu: string; nameEn: string; imageUrl: string | null }[];
  }[];
}) {
  const [groups, setGroups] = useState<Group[]>(() =>
    defaultGroups.map((g) => ({
      key: nextKey("group"),
      nameHu: g.nameHu,
      choices: g.choices.map((c) => ({
        key: nextKey("choice"),
        nameHu: c.nameHu,
        imageUrl: c.imageUrl,
      })),
    })),
  );

  function addGroup() {
    setGroups((gs) => [...gs, { key: nextKey("group"), nameHu: "", choices: [] }]);
  }

  function removeGroup(groupKey: string) {
    setGroups((gs) => gs.filter((g) => g.key !== groupKey));
  }

  function renameGroup(groupKey: string, nameHu: string) {
    setGroups((gs) => gs.map((g) => (g.key === groupKey ? { ...g, nameHu } : g)));
  }

  function addChoice(groupKey: string) {
    setGroups((gs) =>
      gs.map((g) =>
        g.key === groupKey
          ? {
              ...g,
              choices: [
                ...g.choices,
                { key: nextKey("choice"), nameHu: "", imageUrl: null },
              ],
            }
          : g,
      ),
    );
  }

  function removeChoice(groupKey: string, choiceKey: string) {
    setGroups((gs) =>
      gs.map((g) =>
        g.key === groupKey
          ? { ...g, choices: g.choices.filter((c) => c.key !== choiceKey) }
          : g,
      ),
    );
  }

  function updateChoice(groupKey: string, choiceKey: string, patch: Partial<Choice>) {
    setGroups((gs) =>
      gs.map((g) =>
        g.key === groupKey
          ? {
              ...g,
              choices: g.choices.map((c) =>
                c.key === choiceKey ? { ...c, ...patch } : c,
              ),
            }
          : g,
      ),
    );
  }

  const payload = JSON.stringify(
    groups.map((g) => ({
      key: g.key,
      nameHu: g.nameHu,
      choices: g.choices.map((c) => ({
        key: c.key,
        nameHu: c.nameHu,
        imageUrl: c.imageUrl,
      })),
    })),
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Konfigurációs opciók (extra költség nélkül) — pl. Héj színe, Sarok
        elem, Oldalborítás
      </label>
      <input type="hidden" name="variantOptionsData" value={payload} />

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.key} className="border border-line p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <input
                value={group.nameHu}
                onChange={(e) => renameGroup(group.key, e.target.value)}
                placeholder="Csoport neve — pl. Héj színe"
                className="flex-1 border border-line px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeGroup(group.key)}
                aria-label="Csoport törlése"
                className="flex size-9 shrink-0 items-center justify-center border border-line text-muted hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {group.choices.map((choice) => (
                <div key={choice.key} className="w-28">
                  <label className="relative block h-20 w-28 cursor-pointer border border-line">
                    {choice.previewUrl || choice.imageUrl ? (
                      <img
                        src={choice.previewUrl ?? choice.imageUrl ?? ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <ImagePlus className="size-5" strokeWidth={1.6} />
                      </div>
                    )}
                    <input
                      type="file"
                      name={`variantFile_${choice.key}`}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateChoice(group.key, choice.key, {
                            previewUrl: URL.createObjectURL(file),
                          });
                        }
                      }}
                    />
                  </label>
                  <input
                    value={choice.nameHu}
                    onChange={(e) =>
                      updateChoice(group.key, choice.key, { nameHu: e.target.value })
                    }
                    placeholder="Név — pl. Fehér"
                    className="mt-1.5 w-full border border-line px-2 py-1.5 text-xs outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => removeChoice(group.key, choice.key)}
                    className="mt-1 w-full text-[11px] text-muted hover:text-red-600"
                  >
                    Törlés
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addChoice(group.key)}
                className="flex h-20 w-28 flex-col items-center justify-center gap-1.5 border border-dashed border-line text-muted hover:border-ink hover:text-ink"
              >
                <Plus className="size-5" strokeWidth={1.6} />
                <span className="text-[11px] font-medium">Választás</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
      >
        <Plus className="size-4" /> Csoport hozzáadása
      </button>
    </div>
  );
}
