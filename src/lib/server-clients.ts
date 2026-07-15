import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { ChildInfo } from "@/lib/database-types";

export type ClientInput = {
  parent_name: string;
  child_name: string;
  child_age?: string;
  email?: string;
  email2?: string;
  phone?: string;
  phone2?: string;
  cin?: string;
  cin_mother?: string;
  father_name?: string;
  mother_name?: string;
  profession_father?: string;
  profession_mother?: string;
  address?: string;
  child_names?: ChildInfo[];
  subscribed_frais?: string[];
  dob?: string;
  level?: string;
  crm_stage?: "nouveau" | "converti";
  monthly_fee?: number;
  payment_day?: number;
  notes?: string;
  whatsapp_optin?: boolean;
  transport?: boolean;
  cantine?: boolean;
  garderie?: boolean;
  activites?: boolean;
  fratrie?: number;
  remise?: number;
  subscribed_services?: string[];
};

export const listClients = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getClient = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const createClient = createServerFn({ method: "POST" })
  .inputValidator((input: ClientInput) => input)
  .handler(async ({ data }) => {
    const { data: result, error } = await supabaseAdmin
      .from("clients")
      .insert({
        parent_name: data.parent_name,
        child_name: data.child_name,
        child_age: data.child_age ?? "",
        email: data.email ?? "",
        email2: data.email2 ?? "",
        phone: data.phone ?? "",
        phone2: data.phone2 ?? "",
        cin: data.cin ?? "",
        cin_mother: data.cin_mother ?? "",
        father_name: data.father_name ?? "",
        mother_name: data.mother_name ?? "",
        profession_father: data.profession_father ?? "",
        profession_mother: data.profession_mother ?? "",
        address: data.address ?? "",
        child_names: data.child_names ?? [],
        subscribed_frais: data.subscribed_frais ?? [],
        dob: data.dob ?? "",
        level: data.level ?? "",
        crm_stage: data.crm_stage ?? "nouveau",
        monthly_fee: data.monthly_fee ?? 0,
        payment_day: data.payment_day ?? 1,
        notes: data.notes ?? "",
        whatsapp_optin: data.whatsapp_optin ?? true,
        transport: data.transport ?? false,
        cantine: data.cantine ?? false,
        garderie: data.garderie ?? false,
        activites: data.activites ?? false,
        fratrie: data.fratrie ?? 1,
        remise: data.remise ?? 0,
        subscribed_services: data.subscribed_services ?? [],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateClient = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string } & Partial<ClientInput>) => input)
  .handler(async ({ data }) => {
    const { id, ...fields } = data;
    const { data: result, error } = await supabaseAdmin
      .from("clients")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteClient = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { error } = await supabaseAdmin
      .from("clients")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
