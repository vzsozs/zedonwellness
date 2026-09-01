import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categoryList = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder)],
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Új termék</h1>
      <ProductForm
        categories={categoryList}
        action={createProduct}
        submitLabel="Létrehozás"
      />
    </div>
  );
}
