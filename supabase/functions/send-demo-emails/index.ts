import nodemailer from "npm:nodemailer@6.9.15";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

interface FunctionPayload {
  visitor: EmailPayload;
  admin: EmailPayload;
}

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "587");
const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Gestio <no-reply@eiden-group.com>";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: FunctionPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!payload.visitor?.to || !payload.admin?.to) {
    return new Response("Missing visitor or admin recipient", { status: 400 });
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const errors: string[] = [];

  const send = async (to: string, msg: EmailPayload) => {
    try {
      await transport.sendMail({
        from: FROM_EMAIL,
        to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
      });
    } catch (err) {
      errors.push(`Failed to send to ${to}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  await Promise.all([
    send(payload.visitor.to, payload.visitor),
    send(payload.admin.to, payload.admin),
  ]);

  await transport.close();

  if (errors.length > 0) {
    console.error("[send-demo-emails]", errors.join("; "));
    return new Response(JSON.stringify({ ok: false, errors }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
