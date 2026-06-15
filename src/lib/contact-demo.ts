import { createServerFn } from "@tanstack/react-start";

import {
  renderVisitorConfirmationEmail,
  renderAdminNotificationEmail,
  type DemoRequest,
} from "@/lib/email-templates";

const ADMIN_EMAIL = "contact@eiden-group.com";
const FROM_EMAIL = "Gestio <no-reply@eiden-group.com>";

export type DemoRequestResult = { ok: true } | { ok: false; error: string };

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validate(input: unknown): DemoRequest {
  const data = (input ?? {}) as Record<string, unknown>;
  const center = clean(data.center);
  const email = clean(data.email);
  const phone = clean(data.phone);
  const preferredDate = clean(data.preferredDate);
  const message = clean(data.message);

  if (!center) throw new Error("Le nom du centre est requis.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Adresse email invalide.");
  if (phone.replace(/\D/g, "").length < 8) throw new Error("Numéro de téléphone invalide.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) throw new Error("Date souhaitée invalide.");

  return {
    center: center.slice(0, 160),
    email: email.slice(0, 160),
    phone: phone.slice(0, 40),
    preferredDate,
    message: message ? message.slice(0, 2000) : undefined,
  };
}

/**
 * Handles a demo request: builds the visitor confirmation + admin
 * notification emails and sends them.
 *
 * ⚠️ EMAIL SENDING IS STUBBED (per "build UI now, wire later").
 * The emails are fully rendered and logged server-side. To go live, set
 * RESEND_API_KEY in the environment and uncomment the `deliver()` block
 * below (or swap in your provider of choice).
 */
export const submitDemoRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => validate(input))
  .handler(async ({ data }): Promise<DemoRequestResult> => {
    const visitor = renderVisitorConfirmationEmail(data);
    const admin = renderAdminNotificationEmail(data);

    try {
      await deliver(data, visitor, admin);
      return { ok: true };
    } catch (error) {
      console.error("[demo-request] delivery failed:", error);
      return { ok: false, error: "Envoi impossible pour le moment. Merci de réessayer." };
    }
  });

type Rendered = { subject: string; html: string; text: string };

async function deliver(data: DemoRequest, visitor: Rendered, admin: Rendered): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  // ── STUB: no provider configured yet ──────────────────────────────
  if (!apiKey) {
    console.info("[demo-request] (stub — no RESEND_API_KEY) new request:", {
      center: data.center,
      email: data.email,
      phone: data.phone,
      preferredDate: data.preferredDate,
      hasMessage: Boolean(data.message),
    });
    console.info(`[demo-request] would send to visitor <${data.email}>: ${visitor.subject}`);
    console.info(`[demo-request] would send to admin <${ADMIN_EMAIL}>: ${admin.subject}`);
    return;
  }

  // ── LIVE: Resend HTTP API (no SDK needed). Verify eiden-group.com first. ──
  const send = (to: string, email: Rendered, replyTo?: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    });

  await Promise.all([
    send(data.email, visitor),
    send(ADMIN_EMAIL, admin, data.email),
  ]);
}
