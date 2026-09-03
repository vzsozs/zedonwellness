import Link from "next/link";
import type { ProductFeatureGroup, ProductFeature } from "@/db/schema";

type GroupWithFeatures = ProductFeatureGroup & { features: ProductFeature[] };

export function FeaturesPicker({
  groups,
  selectedIds,
}: {
  groups: GroupWithFeatures[];
  selectedIds: number[];
}) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted">
        Még nincs egy hozzávaló sem.{" "}
        <Link
          href="/admin/hozzavalok"
          className="font-semibold text-accent hover:text-accent-dark"
        >
          Hozzávalók kezelése →
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) =>
        group.features.length > 0 ? (
          <div key={group.id}>
            <div className="mb-2 text-xs font-semibold text-muted uppercase">
              {group.nameHu}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {group.features.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="featureIds"
                    value={f.id}
                    defaultChecked={selectedIds.includes(f.id)}
                    className="accent-accent"
                  />
                  {f.iconUrl ? (
                    <img src={f.iconUrl} alt="" className="size-4 shrink-0" />
                  ) : null}
                  <span className="truncate">{f.nameHu}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null,
      )}
      <Link
        href="/admin/hozzavalok"
        className="text-xs font-semibold text-accent hover:text-accent-dark"
      >
        Hozzávalók szerkesztése →
      </Link>
    </div>
  );
}
