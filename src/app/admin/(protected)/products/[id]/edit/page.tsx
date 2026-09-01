import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, productSeries } from "@/db/schema";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categoryList, seriesList] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, Number(id)) }),
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder)] }),
    db.query.productSeries.findMany({ orderBy: [asc(productSeries.sortOrder)] }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Termék szerkesztése</h1>
      <ProductForm
        categories={categoryList}
        seriesList={seriesList}
        values={product}
        action={updateWithId}
        submitLabel="Mentés"
      />
    </div>
  );
}
