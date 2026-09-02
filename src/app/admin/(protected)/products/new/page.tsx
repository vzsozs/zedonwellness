import { db } from "@/db";
import { categories, productSeries, extras } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getEurHufRate } from "@/lib/settings";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [categoryList, seriesList, extraList, eurHufRate] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder)] }),
    db.query.productSeries.findMany({ orderBy: [asc(productSeries.sortOrder)] }),
    db.query.extras.findMany({ orderBy: [asc(extras.sortOrder)] }),
    getEurHufRate(),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Új termék</h1>
      <ProductForm
        categories={categoryList}
        seriesList={seriesList}
        allExtras={extraList}
        selectedExtraIds={[]}
        action={createProduct}
        submitLabel="Létrehozás"
        eurHufRate={eurHufRate}
      />
    </div>
  );
}
