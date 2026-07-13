import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Payload {
  phone: string;
  content: string;
  clientId?: string;
}

const WA_API_VERSION = Deno.env.get("WHATSAPP_API_VERSION") ?? "v22.0";
const WA_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const WA_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  if (!WA_PHONE_ID || !WA_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "WhatsApp API not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  let payload: Payload;
  try { payload = await req.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  if (!payload.phone || !payload.content) {
    return new Response("Missing phone or content", { status: 400 });
  }

  const cleanPhone = payload.phone.replace(/\D/g, "");
  if (cleanPhone.length < 8) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid phone number" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: false, body: payload.content },
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      console.error("[send-whatsapp] API error:", body);
      return new Response(JSON.stringify({ ok: false, error: body.error?.message ?? `HTTP ${res.status}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const waId = body.messages?.[0]?.id ?? "";

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      await supabase.from("whatsapp_messages").insert({
        client_id: payload.clientId || null,
        phone: cleanPhone,
        direction: "sent",
        content: payload.content,
        status: "sent",
        wa_message_id: waId,
      });
    }

    return new Response(JSON.stringify({ ok: true, waId }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[send-whatsapp] error:", err);
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
