import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { interpolate, useDashboardI18n } from "@/lib/landing-i18n";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/lib/server-employees";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/affiches")({
  head: () => ({ meta: [{ title: "Affiches — Équipe" }] }),
  component: AffichesPage,
});

const dialogSurface = "gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none max-h-[min(90vh,720px)] w-[min(100vw-1.5rem,560px)] max-w-[min(100vw-1.5rem,560px)] [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0";
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-muted-foreground";
const inputClass = "rounded-none border-border bg-card shadow-none focus-visible:border-primary focus-visible:ring-0";
const selectTriggerClass = "h-10 rounded-none border-border bg-card shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/70";

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClass}>{label}</Label>
      {children}
    </div>
  );
}

function Badge({ children, variant }: { children: ReactNode; variant: "neutral" | "dark" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      variant === "dark" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-foreground/90")}>
      <span className="h-1 w-1 shrink-0 bg-current" aria-hidden />
      {children}
    </span>
  );
}

function StatutTag({ actif }: { actif: boolean }) {
  const { t } = useDashboardI18n();
  return (
    <span role="status" className={cn("inline-flex w-fit border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider",
      actif ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground")}>
      {actif ? t.status.actif : t.status.inactif}
    </span>
  );
}

function dash(v: string) { return v.trim() === "" ? "—" : v; }

function DetailEmployeDialog({ employe, open, onOpenChange }: { employe: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const a = t.affiches;
  if (!employe) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface}>
        <DialogDescription className="sr-only">{interpolate(a.detailModal.srDesc, { name: employe.full_name })}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.team}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">{a.detailModal.title}</DialogTitle>
          </div>
          <div className="grid max-h-[60vh] grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto scroll-touch px-6 py-5 sm:grid-cols-2">
            <Field id="emp-nom" label={f.fullName}><p className="text-sm font-semibold text-foreground">{employe.full_name}</p></Field>
            <div className="flex items-end justify-start sm:justify-end"><StatutTag actif={employe.status === "actif"} /></div>
            <Field id="emp-naissance" label={f.birthDate}><p className="text-sm font-semibold text-foreground">{dash(employe.birth_date)}</p></Field>
            <Field id="emp-embauche" label={f.hireDate}><p className="text-sm font-semibold text-foreground">{dash(employe.hire_date)}</p></Field>
            <Field id="emp-cin" label={f.cinPassport}><p className="text-sm font-semibold text-foreground">{dash(employe.cin)}</p></Field>
            <Field id="emp-contrat" label={f.contractType}><p className="text-sm font-semibold text-foreground">{dash(employe.contract_type)}</p></Field>
            <Field id="emp-email" label={f.workEmail}><p className="text-sm font-semibold text-foreground">{dash(employe.email)}</p></Field>
            <Field id="emp-email-perso" label={f.personalEmail}><p className="text-sm font-semibold text-foreground">{dash(employe.personal_email)}</p></Field>
            <Field id="emp-tel1" label={f.phone1}><p className="text-sm font-semibold text-foreground">{dash(employe.phone)}</p></Field>
            <Field id="emp-tel2" label={f.phone2}><p className="text-sm font-semibold text-foreground">{dash(employe.phone2)}</p></Field>
            <Field id="emp-poste" label={t.common.position}><p className="text-sm font-semibold text-foreground">{employe.position}</p></Field>
            <Field id="emp-dept" label={t.common.department}><p className="text-sm font-semibold text-foreground">{employe.department}</p></Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="emp-adresse" className={labelClass}>{t.common.address}</Label>
              <p id="emp-adresse" className="text-sm font-semibold text-foreground">{dash(employe.address)}</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap justify-end border-t border-border px-6 py-4">
            <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.close}</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditEmployeDialog({ employe, open, onOpenChange, onSave }: { employe: any; open: boolean; onOpenChange: (open: boolean) => void; onSave: (next: any) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const a = t.affiches;
  const [statut, setStatut] = useState("actif");
  useEffect(() => { if (employe) setStatut(employe.status); }, [employe?.id, employe?.status]);
  if (!employe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[560px]")}>
        <DialogDescription className="sr-only">{interpolate(a.editModal.srDesc, { name: employe.full_name })}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.editModal.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">{a.editModal.title}</DialogTitle>
          </div>
          <form className="max-h-[65vh] space-y-4 overflow-y-auto scroll-touch px-6 py-5" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            onSave({
              ...employe, full_name: String(fd.get("nomComplet") ?? employe.full_name), position: String(fd.get("poste") ?? employe.position),
              department: String(fd.get("departement") ?? employe.department), email: String(fd.get("email") ?? employe.email),
              personal_email: String(fd.get("emailPerso") ?? employe.personal_email), phone: String(fd.get("tel") ?? employe.phone),
              phone2: String(fd.get("tel2") ?? employe.phone2), cin: String(fd.get("cin") ?? employe.cin),
              birth_date: String(fd.get("dateNaissance") ?? employe.birth_date), hire_date: String(fd.get("dateEmbauche") ?? employe.hire_date),
              address: String(fd.get("adresse") ?? employe.address), contract_type: String(fd.get("contrat") ?? employe.contract_type), status: statut,
            });
          }}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="ed-nom" label={f.fullName}><Input id="ed-nom" name="nomComplet" defaultValue={employe.full_name} required className={inputClass} /></Field>
              <Field id="ed-statut" label={t.common.status}>
                <Select value={statut} onValueChange={(v) => setStatut(v)}>
                  <SelectTrigger id="ed-statut" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    <SelectItem value="actif">{t.status.actif}</SelectItem>
                    <SelectItem value="inactif">{t.status.inactif}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="ed-poste" label={t.common.position}><Input id="ed-poste" name="poste" defaultValue={employe.position} className={inputClass} /></Field>
              <Field id="ed-dept" label={t.common.department}><Input id="ed-dept" name="departement" defaultValue={employe.department} className={inputClass} /></Field>
              <Field id="ed-email" label={f.workEmail}><Input id="ed-email" name="email" type="email" defaultValue={employe.email} className={inputClass} /></Field>
              <Field id="ed-email-perso" label={f.personalEmail}><Input id="ed-email-perso" name="emailPerso" type="email" defaultValue={employe.personal_email} className={inputClass} /></Field>
              <Field id="ed-tel" label={f.phone1}><Input id="ed-tel" name="tel" type="tel" defaultValue={employe.phone} className={inputClass} /></Field>
              <Field id="ed-tel2" label={f.phone2}><Input id="ed-tel2" name="tel2" type="tel" defaultValue={employe.phone2} className={inputClass} /></Field>
              <Field id="ed-naissance" label={f.birthDate}><Input id="ed-naissance" name="dateNaissance" defaultValue={employe.birth_date} className={inputClass} /></Field>
              <Field id="ed-embauche" label={f.hireDate}><Input id="ed-embauche" name="dateEmbauche" defaultValue={employe.hire_date} className={inputClass} /></Field>
              <Field id="ed-cin" label={f.cinPassport}><Input id="ed-cin" name="cin" defaultValue={employe.cin} className={inputClass} /></Field>
              <Field id="ed-contrat" label={f.contractType}><Input id="ed-contrat" name="contrat" defaultValue={employe.contract_type} className={inputClass} /></Field>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="ed-adresse" className={labelClass}>{t.common.address}</Label>
                <Input id="ed-adresse" name="adresse" defaultValue={employe.address} className={inputClass} />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.cancel}</button>
              <button type="submit" className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t.common.saveChanges}</button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AffichesPage() {
  const { t } = useDashboardI18n();
  const a = t.affiches;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: employes = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employé mis à jour"); setEditId(null); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employé supprimé"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employes;
    return employes.filter((e: any) => e.full_name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [search, employes]);

  const selected = detailId ? employes.find((e: any) => e.id === detailId) ?? null : null;
  const editing = editId ? employes.find((e: any) => e.id === editId) ?? null : null;

  return (
    <div className="space-y-8">
      <DetailEmployeDialog employe={selected} open={Boolean(selected)} onOpenChange={(o) => !o && setDetailId(null)} />
      <EditEmployeDialog employe={editing} open={Boolean(editing)} onOpenChange={(o) => !o && setEditId(null)} onSave={(next) => updateMutation.mutate(next)} />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{a.eyebrow}</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-foreground">
            <span className="font-semibold">{a.titleBold}</span>{" "}
            <span className="font-normal italic text-muted-foreground">{a.titleItalic}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{a.subtitle}</p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={a.searchPlaceholder} className={cn(inputClass, "pl-9")} aria-label={a.searchAria} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Chargement..." : filtered.length === 1 ? a.employeesCountOne : interpolate(a.employeesCountMany, { count: filtered.length })}
        </p>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{a.employeeList}</p>
        </div>
        <div className="overflow-x-auto scroll-touch">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{a.table.name}</th>
                <th className="px-4 py-3">{a.table.position}</th>
                <th className="px-4 py-3">{a.table.department}</th>
                <th className="px-4 py-3">{a.table.contact}</th>
                <th className="px-4 py-3">{a.table.status}</th>
                <th className="px-4 py-3 w-28">{a.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e: any) => (
                <tr key={e.id} className="hover:bg-muted/80">
                  <td className="px-4 py-3 font-medium text-foreground">{e.full_name}</td>
                  <td className="px-4 py-3 text-foreground/90">{e.position}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.department}</td>
                  <td className="px-4 py-3 text-muted-foreground"><span className="block">{e.email}</span><span className="mt-0.5 block text-xs text-muted-foreground">{e.phone}</span></td>
                  <td className="px-4 py-3"><Badge variant={e.status === "actif" ? "dark" : "neutral"}>{e.status === "actif" ? t.status.actif : t.status.inactif}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setDetailId(e.id); setEditId(null); }} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground hover:bg-muted" aria-label={interpolate(a.viewAria, { name: e.full_name })}><Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" /></button>
                      <button type="button" onClick={() => { setEditId(e.id); setDetailId(null); }} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground hover:bg-muted" aria-label={interpolate(a.editAria, { name: e.full_name })}><Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" /></button>
                      <button type="button" onClick={() => { if (confirm("Supprimer ?")) deleteMutation.mutate({ data: e.id }); }} className="grid h-9 w-9 place-items-center border border-border bg-card text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">Chargement...</p> : null}
      </section>
    </div>
  );
}
