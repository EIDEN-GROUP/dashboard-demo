import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase-server";

const WA_API_VERSION = process.env.WHATSAPP_API_VERSION ?? "v22.0";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const WA_URL = `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_ID}/messages`;

export async function sendWhatsAppMessage(phone: string, content: string): Promise<{ ok: boolean; waId?: string; error?: string }> {
  if (!WA_PHONE_ID || !WA_TOKEN) {
    return { ok: false, error: "WhatsApp API non configurée" };
  }
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 8) {
    return { ok: false, error: "Numéro de téléphone invalide" };
  }

  try {
    const res = await fetch(WA_URL, {
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
        text: { preview_url: false, body: content },
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: body.error?.message ?? `Erreur ${res.status}` };
    }
    return { ok: true, waId: body.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" };
  }
}

export const sendClientMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { clientId: string; content: string }) => input)
  .handler(async ({ data }) => {
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("id, phone, parent_name, whatsapp_optin")
      .eq("id", data.clientId)
      .single();
    if (error || !client) return { ok: false, error: "Client introuvable" };
    if (!client.whatsapp_optin) return { ok: false, error: "Ce client n'a pas activé WhatsApp" };

    const result = await sendWhatsAppMessage(client.phone, data.content);

    await supabaseAdmin.from("whatsapp_messages").insert({
      client_id: client.id,
      phone: client.phone,
      direction: "sent",
      content: data.content,
      status: result.ok ? "sent" : "failed",
      wa_message_id: result.waId ?? "",
    });

    return result;
  });

export const sendBroadcast = createServerFn({ method: "POST" })
  .inputValidator((input: { content: string; filterOverdue?: boolean; filterStage?: string }) => input)
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("clients")
      .select("id, phone, parent_name, whatsapp_optin")
      .eq("whatsapp_optin", true)
      .neq("phone", "");

    if (data.filterOverdue) {
      query = query.eq("overdue", true);
    }
    if (data.filterStage && data.filterStage !== "tous") {
      query = query.eq("crm_stage", data.filterStage);
    }

    const { data: clients, error } = await query;
    if (error) return { ok: false, error: error.message };
    if (!clients || clients.length === 0) return { ok: false, error: "Aucun client éligible" };

    const broadcastId = crypto.randomUUID();
    const results: Array<{ phone: string; ok: boolean; error?: string }> = [];
    const logs: Array<{
      client_id: string | null;
      phone: string;
      direction: "sent";
      content: string;
      status: "pending" | "sent" | "failed";
      wa_message_id: string;
      broadcast_id: string;
    }> = [];

    for (const client of clients) {
      const res = await sendWhatsAppMessage(client.phone, data.content);
      results.push({ phone: client.phone, ok: res.ok, error: res.error });
      logs.push({
        client_id: client.id,
        phone: client.phone,
        direction: "sent",
        content: data.content,
        status: res.ok ? "sent" : "failed",
        wa_message_id: res.waId ?? "",
        broadcast_id: broadcastId,
      });
    }

    if (logs.length > 0) {
      await supabaseAdmin.from("whatsapp_messages").insert(logs);
    }

    const successCount = results.filter((r) => r.ok).length;
    return {
      ok: true,
      broadcastId,
      total: results.length,
      success: successCount,
      failed: results.length - successCount,
      results,
    };
  });

export const getMessageHistory = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("*, clients(parent_name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { error } = await supabaseAdmin
      .from("whatsapp_messages")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendEmailNotification = createServerFn({ method: "POST" })
  .inputValidator((input: { to: string; subject: string; html: string; text?: string }) => input)
  .handler(async ({ data }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
    const SUPABASE_ANON = process.env.SUPABASE_ANON ?? "";

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text ?? "",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Edge function: ${res.status} ${text}`);
      }

      await supabaseAdmin.from("email_logs").insert({
        recipient: data.to,
        subject: data.subject,
        type: "custom",
        status: "sent",
      });

      return { ok: true };
    } catch (err) {
      await supabaseAdmin.from("email_logs").insert({
        recipient: data.to,
        subject: data.subject,
        type: "custom",
        status: "failed",
        error_msg: err instanceof Error ? err.message : "Unknown error",
      });
      return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  });
