import type { Order } from "@/db/schema";
import { formatHuf } from "@/lib/config";
import { escapeHtml, sendMail } from "@/lib/mail";

const BRAND = "Zedonwellness";

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5df">
            ${escapeHtml(i.nameHu)} × ${i.quantity}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5df;text-align:right;white-space:nowrap">
            ${escapeHtml(formatHuf(i.priceHuf * i.quantity))}
          </td>
        </tr>`,
    )
    .join("");

  const addr = order.shippingAddress;
  const shippingLine = addr.shippingRequiresQuote
    ? "Egyedi ajánlat alapján"
    : formatHuf(addr.shippingHuf ?? 0);

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr>
        <td style="padding:8px 0">Szállítás</td>
        <td style="padding:8px 0;text-align:right">${escapeHtml(shippingLine)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-weight:700;border-top:2px solid #17201e">Összesen</td>
        <td style="padding:12px 0;text-align:right;font-weight:700;border-top:2px solid #17201e">
          ${escapeHtml(formatHuf(Number(order.totalHuf)))}${addr.shippingRequiresQuote ? " + szállítás" : ""}
        </td>
      </tr>
    </table>`;
}

function addressBlock(order: Order): string {
  const a = order.shippingAddress;
  return `
    <p style="font-size:14px;line-height:1.6;color:#63706d;margin:0">
      ${escapeHtml(order.customerName)}<br>
      ${escapeHtml(a.zip)} ${escapeHtml(a.city)}, ${escapeHtml(a.street)}<br>
      ${escapeHtml(a.country)}<br>
      ${escapeHtml(order.customerEmail)}${order.customerPhone ? ` · ${escapeHtml(order.customerPhone)}` : ""}
    </p>`;
}

function shell(title: string, body: string): string {
  return `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#17201e">
      <h1 style="font-size:20px;margin:0 0 20px">${escapeHtml(title)}</h1>
      ${body}
      <p style="margin-top:32px;font-size:12px;color:#63706d">${BRAND}</p>
    </div>`;
}

/** Confirmation to the customer. Best-effort: never let a mail failure
 * roll back an order that was already written. */
export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  const quoteNote = order.shippingAddress.shippingRequiresQuote
    ? `<p style="font-size:14px;line-height:1.6;color:#63706d">
         A szállítási díjat a csomag súlya/mérete miatt egyedileg számoljuk ki —
         hamarosan keresünk a pontos ajánlattal.
       </p>`
    : "";

  return sendMail({
    to: order.customerEmail,
    subject: `${BRAND} — rendelés visszaigazolása (${order.orderNumber})`,
    html: shell(
      `Köszönjük a rendelésed!`,
      `<p style="font-size:14px;line-height:1.6;color:#63706d">
         Rendelésszám: <strong style="color:#17201e">${escapeHtml(order.orderNumber)}</strong><br>
         Rendelésedet rögzítettük, munkatársunk hamarosan felveszi veled a kapcsolatot.
       </p>
       ${quoteNote}
       <h2 style="font-size:15px;margin:28px 0 8px">Tételek</h2>
       ${itemsTable(order)}
       <h2 style="font-size:15px;margin:28px 0 8px">Szállítási adatok</h2>
       ${addressBlock(order)}`,
    ),
  });
}

/** Internal notification so a new order doesn't depend on someone
 * remembering to refresh the admin list. */
export async function sendOrderNotification(order: Order): Promise<boolean> {
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!to) return false;

  return sendMail({
    to,
    replyTo: order.customerEmail,
    subject: `Új rendelés: ${order.orderNumber} — ${formatHuf(Number(order.totalHuf))}`,
    html: shell(
      `Új rendelés érkezett`,
      `<p style="font-size:14px;line-height:1.6;color:#63706d">
         <strong style="color:#17201e">${escapeHtml(order.orderNumber)}</strong> ·
         ${escapeHtml(order.status)}
       </p>
       ${itemsTable(order)}
       <h2 style="font-size:15px;margin:28px 0 8px">Vevő</h2>
       ${addressBlock(order)}
       ${order.shippingAddress.note ? `<p style="font-size:14px;color:#63706d"><strong>Megjegyzés:</strong> ${escapeHtml(order.shippingAddress.note)}</p>` : ""}
       <p style="margin-top:24px;font-size:13px">
         <a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL ?? "")}/admin/orders">Megnyitás az adminban →</a>
       </p>`,
    ),
  });
}
