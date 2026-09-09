/**
 * Outgoing transactional mail (order confirmation to the customer, order
 * notification to the shop).
 *
 * Deliberately dependency-free: it talks to Resend's REST API over `fetch`,
 * so nothing new has to be installed or kept up to date. The provider is
 * isolated behind `sendMail()` — swapping in SMTP/nodemailer later means
 * rewriting one function, not every call site.
 *
 * When RESEND_API_KEY is unset (local dev, or before the account exists) it
 * logs what it *would* have sent and reports failure, so a missing mail
 * setup can never take an order down with it — see the callers, which
 * always treat mail as best-effort.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendMail(message: MailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[mail] RESEND_API_KEY/MAIL_FROM nincs beállítva — kimaradt levél: "${message.subject}" → ${message.to}`,
    );
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      console.error(`[mail] ${res.status} — ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] küldés sikertelen:", err);
    return false;
  }
}

/** Minimal HTML escaping for values interpolated into mail templates. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
