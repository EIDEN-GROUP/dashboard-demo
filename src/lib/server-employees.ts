import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase-server";

export type EmployeeInput = {
  full_name: string;
  position?: string;
  department?: string;
  email?: string;
  personal_email?: string;
  phone?: string;
  phone2?: string;
  cin?: string;
  birth_date?: string;
  hire_date?: string;
  address?: string;
  contract_type?: string;
  status?: "actif" | "inactif";
};

export const listEmployees = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createEmployee = createServerFn({ method: "POST" })
  .inputValidator((input: EmployeeInput) => input)
  .handler(async ({ data }) => {
    const { data: result, error } = await supabaseAdmin
      .from("employees")
      .insert({
        full_name: data.full_name,
        position: data.position ?? "",
        department: data.department ?? "",
        email: data.email ?? "",
        personal_email: data.personal_email ?? "",
        phone: data.phone ?? "",
        phone2: data.phone2 ?? "",
        cin: data.cin ?? "",
        birth_date: data.birth_date ?? "",
        hire_date: data.hire_date ?? "",
        address: data.address ?? "",
        contract_type: data.contract_type ?? "",
        status: data.status ?? "actif",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateEmployee = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string } & Partial<EmployeeInput>) => input)
  .handler(async ({ data }) => {
    const { id, ...fields } = data;
    const { data: result, error } = await supabaseAdmin
      .from("employees")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteEmployee = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { error } = await supabaseAdmin
      .from("employees")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
