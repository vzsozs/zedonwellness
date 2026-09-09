import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatHuf } from "@/lib/config";
import { StatusBadge } from "../status-badge";
import { StatusForm } from "./status-form";
import type { OrderStatus } from "../order-status";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) notFound();

  const address = order.shippingAddress;
  const subtotal = order.items.reduce((sum, i) => sum + i.priceHuf * i.quantity, 0);
  const totalWeight = order.items.every((i) => i.weightKg !== null)
    ? order.items.reduce((sum, i) => sum + (i.weightKg ?? 0) * i.quantity, 0)
    : null;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        Vissza a rendelésekhez
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            {new Date(order.createdAt).toLocaleString("hu-HU")}
          </p>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        <div className="col-span-2 flex flex-col gap-6 max-lg:col-span-1">
          <Panel title="Tételek">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
                    <th className="py-2 pr-4">Termék</th>
                    <th className="py-2 pr-4">Egységár</th>
                    <th className="py-2 pr-4">Db</th>
                    <th className="py-2 pr-4">Súly</th>
                    <th className="py-2 text-right">Összesen</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={`${item.productId}-${item.variantId ?? ""}-${i}`} className="border-b border-line last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/termek/${item.slug}`}
                          target="_blank"
                          className="font-semibold text-accent hover:underline"
                        >
                          {item.nameHu}
                        </Link>
                        {item.variantId ? (
                          <div className="text-xs text-muted">Változat #{item.variantId}</div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">{formatHuf(item.priceHuf)}</td>
                      <td className="py-3 pr-4">{item.quantity}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted">
                        {item.weightKg !== null ? `${item.weightKg} kg` : "—"}
                      </td>
                      <td className="py-3 text-right font-semibold whitespace-nowrap">
                        {formatHuf(item.priceHuf * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <Line label="Részösszeg" value={formatHuf(subtotal)} />
              <Line
                label="Szállítás"
                value={
                  address.shippingRequiresQuote
                    ? "Egyedi ajánlat — még nincs beárazva"
                    : formatHuf(address.shippingHuf ?? 0)
                }
              />
              {totalWeight !== null ? (
                <Line label="Össztömeg" value={`${totalWeight.toFixed(2)} kg`} />
              ) : (
                <Line label="Össztömeg" value="Ismeretlen (hiányzó súly a terméken)" />
              )}
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-bold">
                <span>Végösszeg</span>
                <span>
                  {formatHuf(Number(order.totalHuf))}
                  {address.shippingRequiresQuote ? " + szállítás" : ""}
                </span>
              </div>
            </div>
          </Panel>

          {address.note ? (
            <Panel title="Vevő megjegyzése">
              <p className="text-sm whitespace-pre-line text-muted">{address.note}</p>
            </Panel>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Állapot">
            <StatusForm orderId={order.id} current={order.status as OrderStatus} />
          </Panel>

          <Panel title="Vevő">
            <div className="flex flex-col gap-2 text-sm">
              <div className="font-semibold">{order.customerName}</div>
              <a
                href={`mailto:${order.customerEmail}`}
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <Mail className="size-4 shrink-0" strokeWidth={1.8} />
                {order.customerEmail}
              </a>
              {order.customerPhone ? (
                <a
                  href={`tel:${order.customerPhone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-accent hover:underline"
                >
                  <Phone className="size-4 shrink-0" strokeWidth={1.8} />
                  {order.customerPhone}
                </a>
              ) : null}
            </div>
          </Panel>

          <Panel title="Szállítási cím">
            <p className="text-sm leading-relaxed text-muted">
              {address.zip} {address.city}
              <br />
              {address.street}
              <br />
              {address.country}
              {address.countryCode ? ` (${address.countryCode})` : ""}
            </p>
            <p className="mt-3 text-xs text-muted">
              Zóna: {address.zone === "domestic" ? "Belföld" : "Külföld"}
            </p>
          </Panel>

          <Panel title="Jogi">
            <p className="text-sm text-muted">
              {order.termsAcceptedAt
                ? `ÁSZF elfogadva: ${new Date(order.termsAcceptedAt).toLocaleString("hu-HU")}`
                : "Nincs rögzített ÁSZF-elfogadás (a checkout-elfogadás bevezetése előtti rendelés)."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-6">
      <h2 className="mb-4 text-sm font-bold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
