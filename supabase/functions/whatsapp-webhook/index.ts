import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN") ?? "gestio_webhook_2026";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // Webhook verification (GET)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[whatsapp-webhook] verified");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Incoming message/delivery receipt (POST)
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body: any;
  try { body = await req.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  console.log("[whatsapp-webhook] received:", JSON.stringify(body));

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response("OK", { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const entries = body?.entry ?? [];
  for (const entry of entries) {
    const changes = entry?.changes ?? [];
    for (const change of changes) {
      const messages = change?.value?.messages ?? [];
      const statuses = change?.value?.statuses ?? [];

      // Update delivery status
      for (const s of statuses) {
        const waId = s.id;
        const status = s.status;
        if (waId && status) {
          const dbStatus = status === "sent" ? "sent" : status === "delivered" ? "delivered" : status === "read" ? "read" : "failed";
          await supabase.from("whatsapp_messages").update({ status: dbStatus }).eq("wa_message_id", waId);
        }
      }

      // Store incoming messages
      for (const msg of messages) {
        const waId = msg.id;
        const from = msg.from;
        const content = msg.text?.body ?? "";
        const timestamp = msg.timestamp ? new Date(Number(timestamp) * 1000).toISOString() : new Date().toISOString();

        if (content) {
          await supabase.from("whatsapp_messages").insert({
            phone: from,
            direction: "received",
            content,
            status: "delivered",
            wa_message_id: waId,
            created_at: timestamp,
          });
        }
      }
    }
  }

  return new Response("OK", { status: 200 });
});
