import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Search, MessageSquare, Send, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { interpolate, useDashboardI18n } from "@/lib/landing-i18n";
import { listClients, createClient, updateClient, deleteClient, type ClientInput } from "@/lib/server-clients";
import { createPayment, updatePaymentInvoice } from "@/lib/server-payments";
import { sendClientMessage, sendBroadcast, sendEmailNotification } from "@/lib/server-whatsapp";
import { listLevels } from "@/lib/server-settings";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/familles")({
  head: () => ({ meta: [{ title: "Parents CRM" }] }),
  component: CrmParentsPage,
});

const inputClass = "rounded-none border-border bg-card shadow-none focus-visible:border-primary focus-visible:ring-0";
const selectTriggerClass = "h-10 rounded-none border-border bg-card shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/70";
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-muted-foreground";
const dialogSurface = "gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none max-h-[min(90vh,720px)] w-[min(100vw-1.5rem,560px)] max-w-[min(100vw-1.5rem,560px)] [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0";

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

function dash(v: string) { return v.trim() === "" ? "—" : v; }

function CrmParentsPage() {
  const { t } = useDashboardI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [whatsappId, setWhatsappId] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Client supprimé");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (overdueOnly && !c.overdue) return false;
      if (statusFilter === "nouveau" && c.crm_stage !== "nouveau") return false;
      if (statusFilter === "converti" && c.crm_stage !== "converti") return false;
      if (statusFilter === "impaye" && c.payment_status !== "impaye") return false;
      if (statusFilter === "paye" && c.payment_status !== "paye") return false;
      if (!q) return true;
      const blob = `${c.parent_name} ${c.child_name} ${c.email} ${c.phone}`.toLowerCase();
      return blob.includes(q);
    });
  }, [clients, search, statusFilter, overdueOnly]);

  const detail = detailId ? clients.find((c) => c.id === detailId) : null;
  const edit = editId ? clients.find((c) => c.id === editId) : null;
  const paymentClient = paymentId ? clients.find((c) => c.id === paymentId) : null;

  return (
    <div className="space-y-6">
      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} />
      <WhatsAppDialog clientId={whatsappId} onClose={() => setWhatsappId(null)} />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t.familles.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground md:text-4xl">
            {t.familles.titleBold}{" "}
            {t.familles.titleItalic ? <span className="italic text-muted-foreground">{t.familles.titleItalic}</span> : null}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t.familles.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setBroadcastOpen(true)} className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
            <Send className="h-4 w-4" />
            Message à tous
          </button>
          <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {t.familles.addClient}
          </button>
        </div>
      </header>

      <section className="border border-border bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">— {t.common.filtersSearch}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.familles.searchPlaceholder} className={cn(inputClass, "pl-10")} aria-label={t.familles.searchAria} />
          </div>
          <div className="w-full min-w-[11rem] lg:w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={selectTriggerClass} aria-label={t.familles.filterStatusAria}>
                <SelectValue placeholder={t.common.allStatuses} />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border">
                <SelectItem value="tous">{t.common.allStatuses}</SelectItem>
                <SelectItem value="nouveau">{t.status.stageNouveau}</SelectItem>
                <SelectItem value="converti">{t.status.stageConverti}</SelectItem>
                <SelectItem value="impaye">{t.status.paymentImpaye}</SelectItem>
                <SelectItem value="paye">{t.status.paymentPaye}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 border border-border bg-muted px-3 py-2.5 text-sm text-foreground/90">
            <Checkbox checked={overdueOnly} onCheckedChange={(v) => setOverdueOnly(v === true)}
              className="rounded-none border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary" />
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden />
              {t.status.overdue}
            </span>
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isLoading ? "Chargement..." : filtered.length === 1
            ? t.familles.clientsFoundOne
            : interpolate(t.familles.clientsFoundMany, { count: filtered.length })}
        </p>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t.familles.clientList}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{t.familles.table.parent}</th>
                <th className="px-4 py-3">{t.familles.table.child}</th>
                <th className="px-4 py-3">{t.familles.table.contact}</th>
                <th className="px-4 py-3">{t.familles.table.crmStage}</th>
                <th className="px-4 py-3">{t.familles.table.status}</th>
                <th className="px-4 py-3">{t.familles.table.monthly}</th>
                <th className="px-4 py-3">{t.familles.table.debt}</th>
                <th className="px-4 py-3 w-32">{t.familles.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/80">
                  <td className="px-4 py-3 font-medium text-foreground">{c.parent_name}</td>
                  <td className="px-4 py-3 text-foreground/90">
                    <span className="block">{c.child_name}</span>
                    {c.child_age ? <span className="mt-0.5 block text-xs text-muted-foreground">{c.child_age}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="block">{c.email}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{c.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.crm_stage === "converti" ? "dark" : "neutral"}>
                      {c.crm_stage === "nouveau" ? t.status.nouveau : t.status.converti}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.payment_status === "paye" ? "dark" : "neutral"}>
                      {c.payment_status === "impaye" ? t.status.impaye : t.status.paye}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">{c.monthly_fee} {t.common.mad}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">{c.debt} {t.common.mad}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setDetailId(c.id)} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground hover:bg-muted" aria-label={interpolate(t.familles.viewAria, { name: c.child_name })}>
                        <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button type="button" onClick={() => setEditId(c.id)} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground hover:bg-muted" aria-label={interpolate(t.familles.editAria, { name: c.child_name })}>
                        <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button type="button" onClick={() => setWhatsappId(c.id)} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground hover:bg-muted" aria-label={`WhatsApp ${c.parent_name}`}>
                        <MessageSquare className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button type="button" onClick={() => { if (confirm("Supprimer ce client ?")) deleteMutation.mutate({ data: c.id }); }} className="grid h-9 w-9 place-items-center border border-border bg-card text-red-500 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !isLoading ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t.familles.noMatch}</p>
        ) : null}
        {isLoading ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">Chargement...</p> : null}
      </section>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} />
      {detail ? <DetailClientDialog client={detail} open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} onPayment={() => { setPaymentId(detail.id); setDetailId(null); }} /> : null}
      {paymentClient ? <PaymentDialog clientId={paymentClient.id} clientLabel={paymentClient.parent_name} clientEmail={paymentClient.email} open={!!paymentId} onOpenChange={(o) => { if (!o) setPaymentId(null); }} /> : null}
      {edit ? <EditClientDialog key={edit.id} client={edit} open={!!editId} onOpenChange={(o) => !o && setEditId(null)} /> : null}
    </div>
  );
}

function BroadcastDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ total: number; success: number; failed: number } | null>(null);

  const handleSend = async () => {
    if (!content.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await sendBroadcast({ data: { content: content.trim() } });
      if (res.ok) {
        setResult({ total: res.total, success: res.success, failed: res.failed });
        toast.success(`Message envoyé à ${res.success} client(s)`);
      } else {
        toast.error(res.error || "Échec de l'envoi");
      }
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setResult(null); setContent(""); } onOpenChange(o); }}>
      <DialogContent className={cn(dialogSurface, "max-w-[520px]")}>
        <DialogDescription className="sr-only">Envoyer un message WhatsApp à tous les clients</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">WhatsApp</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">Message à tous les clients</DialogTitle>
          </div>
          <div className="px-6 py-5 space-y-4">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre message pour tous les clients..." rows={5}
              className="w-full resize-y border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input" />
            {result ? <div className="border border-border bg-muted p-3 text-sm"><p className="font-medium text-foreground">Résultat</p><p className="text-muted-foreground">Total: {result.total} · Succès: {result.success} · Échecs: {result.failed}</p></div> : null}
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Annuler</button>
              <button type="button" onClick={handleSend} disabled={busy || !content.trim()} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                <Send className="h-4 w-4" />
                {busy ? "Envoi..." : "Envoyer à tous"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WhatsAppDialog({ clientId, onClose }: { clientId: string | null; onClose: () => void }) {
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const client = clientId ? clients.find((c) => c.id === clientId) : null;
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSend = async () => {
    if (!client || !content.trim()) return;
    setBusy(true);
    try {
      const res = await sendClientMessage({ data: { clientId: client.id, content: content.trim() } });
      if (res.ok) {
        toast.success("Message envoyé");
        onClose();
      } else {
        toast.error(res.error || "Échec de l'envoi");
      }
    } catch {
      toast.error("Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!clientId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn(dialogSurface, "max-w-[480px]")}>
        <DialogDescription className="sr-only">Envoyer un message WhatsApp</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">WhatsApp</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">
              Message à {client?.parent_name || "..."}
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">{client?.phone}</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre message..." rows={4}
              className="w-full resize-y border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Annuler</button>
              <button type="button" onClick={handleSend} disabled={busy || !content.trim()} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                <Send className="h-4 w-4" />
                {busy ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const a = t.familles.addModal;
  const queryClient = useQueryClient();
  const { data: levels } = useQuery({ queryKey: ["levels"], queryFn: listLevels });
  const [selLevel, setSelLevel] = useState("");
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const levelMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of levels ?? []) m[l.name] = l.monthly_fee;
    return m;
  }, [levels]);

  const handleLevelChange = (v: string) => {
    setSelLevel(v);
    setMonthlyFee(levelMap[v] ?? 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createClient({
        data: {
          parent_name: String(fd.get("parent") || "").trim() || "Nouveau parent",
          child_name: String(fd.get("child") || "").trim() || "Enfant",
          email: String(fd.get("email1") || "").trim(),
          phone: String(fd.get("tel1") || "").trim(),
          level: selLevel,
          monthly_fee: monthlyFee,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Client créé");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[640px]")}>
        <DialogDescription className="sr-only">{a.srDesc}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{a.title}</DialogTitle>
          </div>
          <form className="max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="nc-parent" label={f.parentDisplayName}>
                <Input id="nc-parent" name="parent" required className={inputClass} placeholder={f.parentDisplayPlaceholder} />
              </Field>
              <Field id="nc-child" label={f.studentName}>
                <Input id="nc-child" name="child" required className={inputClass} />
              </Field>
              <Field id="nc-email" label={f.email1}>
                <Input id="nc-email" name="email1" type="email" className={inputClass} />
              </Field>
              <Field id="nc-tel" label={f.phone1}>
                <Input id="nc-tel" name="tel1" type="tel" className={inputClass} />
              </Field>
              <Field id="nc-niveau" label={f.level}>
                <Select value={selLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger id="nc-niveau" className={selectTriggerClass}><SelectValue placeholder={t.common.selectLevel} /></SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    {(levels ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.name}>{l.name} — {l.monthly_fee} MAD</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="nc-mensuel" label={f.monthlyFeesMad}>
                <input name="mensuel" type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} className={inputClass} />
              </Field>
            </div>
            {error ? <p className="mt-4 text-xs text-red-600">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.cancel}</button>
              <button type="submit" disabled={busy} className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "..." : a.submit}</button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailClientDialog({ client, open, onOpenChange, onPayment }: { client: any; open: boolean; onOpenChange: (open: boolean) => void; onPayment: () => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const d = t.familles.detailModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface}>
        <DialogDescription className="sr-only">{interpolate(d.srDesc, { name: client.child_name })}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t.common.crm}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{d.title}</DialogTitle>
          </div>
          <div className="grid max-h-[60vh] grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <Field id="d-eleve" label={f.studentName}><p className="text-sm font-semibold text-foreground">{client.child_name}</p></Field>
            <Field id="d-dob" label={f.birthDate}><p className="text-sm font-semibold text-foreground">{dash(client.dob)}</p></Field>
            <Field id="d-pere" label={f.fatherName}><p className="text-sm font-semibold text-foreground">{dash(client.father_name)}</p></Field>
            <Field id="d-mere" label={f.motherName}><p className="text-sm font-semibold text-foreground">{dash(client.mother_name)}</p></Field>
            <Field id="d-cin" label={f.cinPassport}><p className="text-sm font-semibold text-foreground">{dash(client.cin)}</p></Field>
            <Field id="d-email1" label={f.email1}><p className="text-sm font-semibold text-foreground">{dash(client.email)}</p></Field>
            <Field id="d-email2" label={f.email2}><p className="text-sm font-semibold text-foreground">{dash(client.email2)}</p></Field>
            <Field id="d-tel1" label={f.phone1}><p className="text-sm font-semibold text-foreground">{dash(client.phone)}</p></Field>
            <Field id="d-tel2" label={f.phone2}><p className="text-sm font-semibold text-foreground">{dash(client.phone2)}</p></Field>
            <Field id="d-niveau" label={f.level}><p className="text-sm font-semibold text-foreground">{dash(client.level)}</p></Field>
            <Field id="d-frais" label={f.monthlyFees}><p className="text-sm font-semibold text-foreground">{client.monthly_fee} {t.common.mad}</p></Field>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
            <button type="button" onClick={() => { onPayment(); onOpenChange(false); }} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              {d.recordPayment}
            </button>
            <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.close}</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ clientId, clientLabel, clientEmail, open, onOpenChange }: { clientId: string; clientLabel: string; clientEmail?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const p = t.familles.paymentModal;
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const payment = await createPayment({
        data: {
          client_id: clientId,
          amount: Number(fd.get("montant") ?? 0),
          date: String(fd.get("date") || new Date().toISOString().split("T")[0]),
          mode: String(fd.get("mode") || "especes") as any,
        },
      });

      if (clientEmail) {
        await sendEmailNotification({
          data: {
            to: clientEmail,
            subject: `Reçu de paiement ${payment.receipt}`,
            html: [
              `<h2>Reçu de paiement</h2>`,
              `<p>Bonjour ${clientLabel},</p>`,
              `<p>Nous vous confirmons la réception de votre paiement.</p>`,
              `<table>`,
              `<tr><td style="padding:4px 12px 4px 0;font-weight:600">Reçu n°</td><td>${payment.receipt}</td></tr>`,
              `<tr><td style="padding:4px 12px 4px 0;font-weight:600">Montant</td><td>${payment.amount} MAD</td></tr>`,
              `<tr><td style="padding:4px 12px 4px 0;font-weight:600">Date</td><td>${payment.date}</td></tr>`,
              `<tr><td style="padding:4px 12px 4px 0;font-weight:600">Mode</td><td>${payment.mode}</td></tr>`,
              `<tr><td style="padding:4px 12px 4px 0;font-weight:600">Période</td><td>${payment.period}</td></tr>`,
              `</table>`,
              `<p>Merci pour votre confiance.</p>`,
              `<p>Cordialement,<br/>L'équipe Gestio</p>`,
            ].join("\n"),
            text: [
              `Reçu de paiement ${payment.receipt}`,
              ``,
              `Bonjour ${clientLabel},`,
              ``,
              `Nous vous confirmons la réception de votre paiement.`,
              ``,
              `Reçu n°: ${payment.receipt}`,
              `Montant: ${payment.amount} MAD`,
              `Date: ${payment.date}`,
              `Mode: ${payment.mode}`,
              `Période: ${payment.period}`,
              ``,
              `Merci pour votre confiance.`,
              `Cordialement,`,
              `L'équipe Gestio`,
            ].join("\n"),
          },
        });
      }

      if (payment.id) {
        await updatePaymentInvoice({ data: { id: payment.id, invoice_sent: true } }).catch(() => {});
      }

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(clientEmail ? "Paiement enregistré et facture envoyée" : "Paiement enregistré");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[480px]")}>
        <DialogDescription className="sr-only">{interpolate(p.srDesc, { name: clientLabel })}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{p.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{p.title}</DialogTitle>
          </div>
          <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
            <Field id="pay-montant" label={f.amountMad}><Input id="pay-montant" name="montant" type="number" defaultValue={0} min={0} className={inputClass} /></Field>
            <Field id="pay-date" label={f.paymentDate}><Input id="pay-date" name="date" type="date" className={inputClass} /></Field>
            <Field id="pay-mode" label={f.paymentMode}>
              <Select name="mode" defaultValue="especes">
                <SelectTrigger id="pay-mode" className={selectTriggerClass}><SelectValue placeholder={t.common.mode} /></SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="especes">{f.paymentModes.cash}</SelectItem>
                  <SelectItem value="virement">{f.paymentModes.transfer}</SelectItem>
                  <SelectItem value="carte">{f.paymentModes.card}</SelectItem>
                  <SelectItem value="cheque">{f.paymentModes.check}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.cancel}</button>
              <button type="submit" disabled={busy} className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "..." : p.confirm}</button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditClientDialog({ client, open, onOpenChange }: { client: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const e = t.familles.editModal;
  const queryClient = useQueryClient();
  const { data: levels } = useQuery({ queryKey: ["levels"], queryFn: listLevels });
  const [stade, setStade] = useState(client.crm_stage);
  const [editLevel, setEditLevel] = useState(client.level ?? "");
  const [editFee, setEditFee] = useState(client.monthly_fee ?? 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setStade(client.crm_stage); }, [client.id, client.crm_stage]);

  const levelMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of levels ?? []) m[l.name] = l.monthly_fee;
    return m;
  }, [levels]);

  const handleLevelChange = (v: string) => {
    setEditLevel(v);
    if (levelMap[v]) setEditFee(levelMap[v]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateClient({
        data: {
          id: client.id,
          parent_name: String(fd.get("parent") || client.parent_name),
          child_name: String(fd.get("child") || client.child_name),
          email: String(fd.get("email") || client.email),
          phone: String(fd.get("phone") || client.phone),
          level: editLevel,
          crm_stage: stade,
          monthly_fee: editFee,
          payment_day: Number(fd.get("jour") ?? client.payment_day ?? 1),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client mis à jour");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[560px]")}>
        <DialogDescription className="sr-only">{interpolate(e.srDesc, { name: client.child_name })}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{e.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{e.title}</DialogTitle>
          </div>
          <form className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="e-parent" label={t.common.parent}><Input id="e-parent" name="parent" defaultValue={client.parent_name} className={inputClass} /></Field>
              <Field id="e-child" label={t.common.child}><Input id="e-child" name="child" defaultValue={client.child_name} className={inputClass} /></Field>
              <Field id="e-email" label={t.common.email}><Input id="e-email" name="email" type="email" defaultValue={client.email} className={inputClass} /></Field>
              <Field id="e-phone" label={t.common.phone}><Input id="e-phone" name="phone" type="tel" defaultValue={client.phone} className={inputClass} /></Field>
              <Field id="e-niveau" label={f.level}>
                <Select value={editLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger id="e-niveau" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    {(levels ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.name}>{l.name} — {l.monthly_fee} MAD</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-stade" label={f.crmStage}>
                <Select value={stade} onValueChange={(v) => setStade(v as "nouveau" | "converti")}>
                  <SelectTrigger id="e-stade" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    <SelectItem value="nouveau">{t.status.nouveau}</SelectItem>
                    <SelectItem value="converti">{t.status.converti}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-mensuel" label={f.monthlyFeesMad}><Input id="e-mensuel" name="mensuel" type="number" min={0} value={editFee} onChange={(e) => setEditFee(Number(e.target.value))} className={inputClass} /></Field>
              <Field id="e-jour" label={f.paymentDay}><Input id="e-jour" name="jour" type="number" min={1} max={31} defaultValue={client.payment_day ?? 1} className={inputClass} /></Field>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.cancel}</button>
              <button type="submit" disabled={busy} className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "..." : t.common.saveChanges}</button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
