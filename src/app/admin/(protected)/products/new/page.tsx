import { db } from "@/db";
import { categories, productSeries } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [categoryList, seriesList] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder)] }),
    db.query.productSeries.findMany({ orderBy: [asc(productSeries.sortOrder)] }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Új termék</h1>
      <ProductForm
        categories={categoryList}
        seriesList={seriesList}
        action={createProduct}
        submitLabel="Létrehozás"
      />
    </div>
  );
}
