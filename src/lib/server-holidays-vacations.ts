import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase-server";

export type Holiday = {
  id: string;
  date: string;
  label: string;
};

export type SchoolVacation = {
  id: string;
  start_date: string;
  end_date: string;
  label: string;
};

// ── Holidays ──

export const listHolidays = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("holidays")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Holiday[];
  });

export const createHoliday = createServerFn({ method: "POST" })
  .inputValidator((input: { date: string; label: string }) => input)
  .handler(async ({ data }) => {
    const { data: result, error } = await supabaseAdmin
      .from("holidays")
      .insert({ date: data.date, label: data.label })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result as Holiday;
  });

export const deleteHoliday = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { error } = await supabaseAdmin
      .from("holidays")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── School Vacations ──

export const listSchoolVacations = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("school_vacations")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as SchoolVacation[];
  });

export const createSchoolVacation = createServerFn({ method: "POST" })
  .inputValidator((input: { start_date: string; end_date: string; label: string }) => input)
  .handler(async ({ data }) => {
    const { data: result, error } = await supabaseAdmin
      .from("school_vacations")
      .insert({ start_date: data.start_date, end_date: data.end_date, label: data.label })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result as SchoolVacation;
  });

export const deleteSchoolVacation = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { error } = await supabaseAdmin
      .from("school_vacations")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
