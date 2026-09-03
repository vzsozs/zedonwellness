"use client";

import { useState } from "react";
import type { ProductFeatureGroup, ProductFeature, Extra } from "@/db/schema";
import { deleteGroup } from "./actions";
import { FeatureCard } from "./feature-card";
import { NewFeatureForm } from "./new-feature-form";
import { ExtrasPane } from "../extras/extras-pane";

type GroupWithFeatures = ProductFeatureGroup & { features: ProductFeature[] };

export function HozzavalokTabs({
  groups,
  extras,
  eurHufRate,
}: {
  groups: GroupWithFeatures[];
  extras: Extra[];
  eurHufRate: number;
}) {
  const [activeTab, setActiveTab] = useState<"extrak" | number>("extrak");
  const activeGroup = typeof activeTab === "number" ? groups.find((g) => g.id === activeTab) : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab("extrak")}
          className={`px-4 py-2.5 text-sm font-semibold ${
            activeTab === "extrak" ? "border-b-2 border-ink text-ink" : "text-muted hover:text-ink"
          }`}
        >
          Jakuzzi extrák
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveTab(g.id)}
            className={`px-4 py-2.5 text-sm font-semibold ${
              activeTab === g.id ? "border-b-2 border-ink text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {g.nameHu}
          </button>
        ))}
      </div>

      {activeTab === "extrak" ? (
        <ExtrasPane extras={extras} eurHufRate={eurHufRate} />
      ) : activeGroup ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted">
              {activeGroup.features.length === 0
                ? "Ebben a csoportban még nincs jellemző."
                : `${activeGroup.features.length} jellemző ebben a csoportban.`}
            </p>
            <button
              type="button"
              onClick={() => deleteGroup(activeGroup.id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Csoport törlése
            </button>
          </div>

          <div className="mb-8 grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {activeGroup.features.map((f) => (
              <FeatureCard key={f.id} feature={f} />
            ))}
          </div>

          <NewFeatureForm groupId={activeGroup.id} />
        </div>
      ) : null}
    </div>
  );
}
