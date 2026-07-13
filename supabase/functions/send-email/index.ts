import nodemailer from "npm:nodemailer@6.9.15";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "587");
const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Gestio <no-reply@eiden-group.com>";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let payload: EmailPayload;
  try { payload = await req.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  if (!payload.to || !payload.subject || !payload.html) {
    return new Response("Missing required fields: to, subject, html", { status: 400 });
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || "",
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
    });
    await transport.close();
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[send-email] failed:", err);
    await transport.close();
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
