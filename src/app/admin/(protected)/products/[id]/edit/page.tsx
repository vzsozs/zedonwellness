import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, productSeries, extras } from "@/db/schema";
import { getEurHufRate } from "@/lib/settings";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  const [product, categoryList, seriesList, extraList, eurHufRate] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { extras: true, variants: { orderBy: (v, { asc }) => [asc(v.sortOrder)] } },
    }),
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder)] }),
    db.query.productSeries.findMany({ orderBy: [asc(productSeries.sortOrder)] }),
    db.query.extras.findMany({ orderBy: [asc(extras.sortOrder)] }),
    getEurHufRate(),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);
  const selectedExtraIds = product.extras.map((e) => e.extraId);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Termék szerkesztése</h1>
      <ProductForm
        categories={categoryList}
        seriesList={seriesList}
        allExtras={extraList}
        selectedExtraIds={selectedExtraIds}
        values={product}
        action={updateWithId}
        submitLabel="Mentés"
        eurHufRate={eurHufRate}
      />
    </div>
  );
}
