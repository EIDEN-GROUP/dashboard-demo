import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Plus,
  Trash2,
  Search,
  GraduationCap,
  CalendarDays,
  MapPin,
  Phone,
  HeartPulse,
  Utensils,
  ShieldAlert,
  Percent,
  Bus,
  Package,
} from "lucide-react";
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
import {
  softCard,
  softInput as inputClass,
  softSelectTrigger as selectTriggerClass,
  softSelectContent,
  dialogSurface,
  labelClass,
  primaryPill,
  iconButton,
  statusPill,
  STATUS_COLORS,
} from "@/lib/dash-ui";
import { listClients, createClient, updateClient, deleteClient, type ClientInput } from "@/lib/server-clients";
import { getSettings } from "@/lib/server-settings";
import { createPayment, updatePaymentInvoice } from "@/lib/server-payments";
import { sendClientMessage, sendBroadcast, sendPaymentReceipt } from "@/lib/server-whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/familles")({
  head: () => ({ meta: [{ title: "Parents   CRM" }] }),
  // `?statut=impaye|retard` lets the dashboard's Impayé / En retard cards deep-link
  // straight into the filtered list.
  validateSearch: (search: Record<string, unknown>): { statut?: PaymentStatus } => {
    const s = search.statut;
    return s === "paye" || s === "impaye" || s === "retard" ? { statut: s } : {};
  },
  component: CrmParentsPage,
});

type PaymentStatus = "paye" | "impaye" | "retard";

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paye: "Payé",
  impaye: "Impayé",
  retard: "En retard",
};

type DbClient = {
  id: string;
  parent_name: string;
  child_name: string;
  child_age: string;
  email: string;
  email2: string;
  phone: string;
  phone2: string;
  cin: string;
  father_name: string;
  mother_name: string;
  dob: string;
  level: string;
  crm_stage: string;
  monthly_fee: number;
  debt: number;
  payment_status: PaymentStatus;
  payment_day: number;
  notes: string;
  whatsapp_optin: boolean;
  transport: boolean;
  cantine: boolean;
  garderie: boolean;
  activites: boolean;
  fratrie: number;
  remise: number;
  subscribed_services: string[];
  created_at: string;
};

function remiseAuto(fratrie: number) {
  if (fratrie >= 4) return 15;
  if (fratrie >= 3) return 10;
  return 0;
}

function servicesOf(c: DbClient, svcNames: string[]) {
  return (c.subscribed_services ?? []).filter((s) => svcNames.includes(s));
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      {children}
    </div>
  );
}

/** Puces des services souscrits. */
function ServiceChips({ services }: { services: string[] }) {
  if (services.length === 0) return <span className="text-xs text-muted-foreground">Aucun service</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {services.map((s) => (
        <span
          key={s}
          className="inline-flex items-center gap-1 rounded-full bg-[#28396C]/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#28396C]"
        >
          {s}
        </span>
      ))}
    </span>
  );
}

/** Badge de remise fratrie (masqué quand la famille n'a pas de remise). */
function RemiseBadge({ client }: { client: FlatClient }) {
  if (!client.remise || client.remise <= 0) return <span className="text-xs text-muted-foreground"> </span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#B5E18B]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3E6420]">
      <Percent className="h-3 w-3" />
      {client.remise}%   {client.fratrie} enfants
    </span>
  );
}

/** Petit sélecteur de statut de paiement, coloré selon la valeur. */
function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: PaymentStatus;
  onChange: (v: PaymentStatus) => void;
  className?: string;
}) {
  const tone =
    value === "paye"
      ? "bg-[#B5E18B]/30 text-[#3E6420]"
      : value === "retard"
        ? "bg-[#F6D8D8] text-[#9A2F2F]"
        : "bg-[#F4E3C0] text-[#8A5A16]";
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PaymentStatus)}>
      <SelectTrigger
        className={cn(
          "h-8 w-[8.5rem] gap-1.5 rounded-full border-0 px-3 text-[11px] font-semibold uppercase tracking-wide shadow-none focus:ring-0 focus:ring-offset-0",
          tone,
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={softSelectContent}>
        <SelectItem value="paye">{PAYMENT_LABEL.paye}</SelectItem>
        <SelectItem value="impaye">{PAYMENT_LABEL.impaye}</SelectItem>
        <SelectItem value="retard">{PAYMENT_LABEL.retard}</SelectItem>
      </SelectContent>
    </Select>
  );
}

/** Sélecteur Oui / Non pour les services de l'école. */
function OuiNonSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: OuiNon;
  onChange: (v: OuiNon) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as OuiNon)}>
      <SelectTrigger id={id} className={selectTriggerClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={softSelectContent}>
        <SelectItem value="Oui">Oui</SelectItem>
        <SelectItem value="Non">Non</SelectItem>
      </SelectContent>
    </Select>
  );
}

function dash(v: string) {
  return v.trim() === "" ? " " : v;
}

type FlatClient = DbClient & { child_subtitle?: string; has_transport: boolean; has_cantine: boolean; has_garderie: boolean; has_activites: boolean };

function CrmParentsPage() {
  const { t } = useDashboardI18n();
  const queryClient = useQueryClient();
  const { data: rawClients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const services: Array<{ name: string; price: number; enabled: boolean }> = settings?.services ?? [];
  const svcNames = services.filter((s) => s.enabled).map((s) => s.name);

  // Seeded from ?statut= so "Impayé" / "En retard" on the dashboard open this list pre-filtered.
  const { statut } = Route.useSearch();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(statut ?? "tous");
  const [serviceFilter, setServiceFilter] = useState<string>("tous");

  useEffect(() => {
    if (statut) setStatusFilter(statut);
  }, [statut]);

  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const removeClient = useMutation({
    mutationFn: (id: string) => deleteClient({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Fiche supprimée");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const clients: FlatClient[] = useMemo(() => {
    return (rawClients as any[] ?? []).map((r: any) => ({
      ...r,
      child_subtitle: r.child_age ? `Enfant de ${r.child_age} ans` : undefined,
      has_transport: (r.subscribed_services ?? []).includes("Transport scolaire"),
      has_cantine: (r.subscribed_services ?? []).includes("Cantine"),
      has_garderie: (r.subscribed_services ?? []).includes("Garderie"),
      has_activites: (r.subscribed_services ?? []).some((s: string) => s.toLowerCase().includes("activit")),
    }));
  }, [rawClients]);

  // Base = recherche + service (sert au graphique) ; filtered ajoute le statut (sert au tableau)
  const base = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Wait for settings to arrive, but don't blank the list just because the school
    // has no services configured   that hid every client.
    if (!settings) return [];
    return clients.filter((c) => {
      if (serviceFilter === "transport" && !c.has_transport) return false;
      if (serviceFilter === "cantine" && !c.has_cantine) return false;
      if (serviceFilter === "garderie" && !c.has_garderie) return false;
      if (serviceFilter === "activites" && !c.has_activites) return false;
      if (serviceFilter === "remise" && (c.remise ?? 0) <= 0) return false;
      if (!q) return true;
      const blob = `${c.parent_name} ${c.child_name} ${c.email} ${c.email2} ${c.phone} ${c.level}`.toLowerCase();
      return blob.includes(q);
    });
  }, [clients, search, serviceFilter, svcNames]);

  const filtered = useMemo(
    () => base.filter((c) => statusFilter === "tous" || c.payment_status === statusFilter),
    [base, statusFilter],
  );

  // Répartition pour le graphique circulaire
  const donut = useMemo(() => {
    const counts = { paye: 0, impaye: 0, retard: 0 };
    base.forEach((c) => { counts[c.payment_status ?? "impaye"] += 1; });
    return [
      { name: "Payé", value: counts.paye, color: STATUS_COLORS.paye },
      { name: "Impayé", value: counts.impaye, color: STATUS_COLORS.impaye },
      { name: "En retard", value: counts.retard, color: STATUS_COLORS.retard },
    ];
  }, [base]);
  const donutTotal = donut.reduce((s, d) => s + d.value, 0);

  const detail = detailId ? clients.find((c) => c.id === detailId) : null;
  const edit = editId ? clients.find((c) => c.id === editId) : null;
  const paymentClient = paymentId ? clients.find((c) => c.id === paymentId) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t.familles.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground md:text-4xl">
            {t.familles.titleBold}{" "}
            {t.familles.titleItalic ? <span className="italic text-muted-foreground">{t.familles.titleItalic}</span> : null}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Fiches élèves complètes   scolarité, contacts, santé et suivi des paiements mensuels.
          </p>
        </div>
        <button type="button" onClick={() => setAddOpen(true)} className={primaryPill}>
          <Plus className="h-4 w-4" />
          {t.familles.addClient}
        </button>
      </header>

      {/* Filtres */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className={cn(softCard, "p-5 lg:col-span-2")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Filtres</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="relative min-w-0 sm:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.familles.searchPlaceholder}
                className={cn(inputClass, "pl-10")}
                aria-label={t.familles.searchAria}
              />
            </div>
            <div>
              <Label className={labelClass}>Statut de paiement</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par statut">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={softSelectContent}>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="paye">{PAYMENT_LABEL.paye}</SelectItem>
                  <SelectItem value="impaye">{PAYMENT_LABEL.impaye}</SelectItem>
                  <SelectItem value="retard">{PAYMENT_LABEL.retard}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className={labelClass}>Service souscrit</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par service">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={softSelectContent}>
                  <SelectItem value="tous">Tous les services</SelectItem>
                  <SelectItem value="transport">Transport scolaire</SelectItem>
                  <SelectItem value="cantine">Cantine</SelectItem>
                  <SelectItem value="garderie">Garderie</SelectItem>
                  <SelectItem value="activites">Activités périscolaires</SelectItem>
                  <SelectItem value="remise">Avec remise fratrie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length === 1
              ? t.familles.clientsFoundOne
              : interpolate(t.familles.clientsFoundMany, { count: filtered.length })}
          </p>
        </section>

        {/* Graphique circulaire */}
        <section className={cn(softCard, "flex flex-col p-5")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Analyse</p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-display text-3xl font-semibold tabular-nums text-foreground">{donutTotal}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">familles</p>
          </div>
          <ul className="mt-4 space-y-2">
            {donut.map((d) => {
              const share = donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0;
              return (
                <li key={d.name} className="rounded-2xl bg-muted/50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      {d.value}
                      <span className="ml-1.5 font-normal text-muted-foreground">{share}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#28396C]/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${share}%`, backgroundColor: d.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Tableau   cliquer une ligne ouvre la fiche complète */}
      <section className={cn(softCard, "overflow-hidden")}>
        <div className="border-b border-[#28396C]/10 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t.familles.clientList}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#28396C]/10 bg-muted/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{t.familles.table.parent}</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Emails des parents</th>
                <th className="px-4 py-3">{t.familles.table.contact}</th>
                <th className="px-4 py-3">Services</th>
                <th className="px-4 py-3">Remise fratrie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">{t.familles.table.monthly}</th>
                <th className="px-4 py-3 w-36">{t.familles.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28396C]/8">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setDetailId(c.id)}
                  className="cursor-pointer transition-colors hover:bg-[#B5E18B]/10"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="block">{c.parent_name}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {c.child_name}
                      {c.child_subtitle ? `   ${c.child_subtitle}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dash(c.level)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="block">{dash(c.email)}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{dash(c.email2)}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="block">{c.phone}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{dash(c.phone2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ServiceChips services={servicesOf(c, svcNames)} />
                  </td>
                  <td className="px-4 py-3">
                    <RemiseBadge client={c} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide", c.payment_status === "paye" ? "bg-[#B5E18B]/30 text-[#3E6420]" : c.payment_status === "retard" ? "bg-[#F6D8D8] text-[#9A2F2F]" : "bg-[#F4E3C0] text-[#8A5A16]")}>
                      {PAYMENT_LABEL[c.payment_status ?? "impaye"]}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">
                    <span className="block font-semibold text-foreground">
                      {(c.monthly_fee ?? 0)} {t.common.mad}
                    </span>
                    {(c.remise ?? 0) > 0 ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground line-through">
                        {Math.round((c.monthly_fee ?? 0) / (1 - (c.remise ?? 0) / 100))} {t.common.mad}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {/* Recording a payment is the most frequent action on a row, so it
                          lives here rather than only behind the fiche. */}
                      <button
                        type="button"
                        onClick={() => setPaymentId(c.id)}
                        className={cn(
                          iconButton,
                          "border-transparent bg-[#B5E18B] text-[#28396C] hover:bg-[#B5E18B] hover:brightness-105",
                        )}
                        title="Enregistrer un paiement"
                        aria-label={`Enregistrer un paiement pour ${c.child_name}`}
                      >
                        <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(c.id)}
                        className={iconButton}
                        title="Modifier"
                        aria-label={interpolate(t.familles.editAria, { name: c.child_name })}
                      >
                        <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer définitivement la fiche de ${c.child_name} (${c.parent_name}) ?`)) {
                            removeClient.mutate(c.id);
                          }
                        }}
                        disabled={removeClient.isPending}
                        className={cn(iconButton, "text-[#E25C5C] hover:bg-[#E25C5C]/10 hover:text-[#E25C5C] disabled:opacity-50")}
                        title="Supprimer"
                        aria-label={`Supprimer la fiche de ${c.child_name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t.familles.noMatch}</p>
        ) : null}
      </section>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} />

      {detail ? (
        <DetailClientDialog
          client={detail}
          open={!!detailId}
          onOpenChange={(o) => !o && setDetailId(null)}
          onEdit={() => {
            setEditId(detail.id);
            setDetailId(null);
          }}
          onPayment={() => {
            setPaymentId(detail.id);
            setDetailId(null);
          }}
        />
      ) : null}

      {paymentClient ? (
        <PaymentDialog
          clientId={paymentClient.id}
          clientLabel={paymentClient.parent_name}
          clientEmail={paymentClient.email}
          open={!!paymentId}
          onOpenChange={(o) => {
            if (!o) setPaymentId(null);
          }}
        />
      ) : null}

      {edit ? (
        <EditClientDialog
          key={edit.id}
          client={edit}
          open={!!editId}
          onOpenChange={(o) => !o && setEditId(null)}
        />
      ) : null}
    </div>
  );
}

// ── Fiche complète (lecture) ───────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className={labelClass}>{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof GraduationCap; children: ReactNode }) {
  return (
    <p className="col-span-full mt-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#28396C]/8 text-[#28396C]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {children}
    </p>
  );
}

function DetailClientDialog({
  client,
  open,
  onOpenChange,
  onEdit,
  onPayment,
}: {
  client: FlatClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onPayment: () => void;
}) {
  const { t } = useDashboardI18n();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const services: Array<{ name: string; price: number; enabled: boolean }> = settings?.services ?? [];
  const subscribed = client.subscribed_services ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "w-[min(100vw-1.5rem,680px)] max-w-[680px]")}>
        <DialogDescription className="sr-only">Fiche complète de {client.child_name}</DialogDescription>
        <div className="flex min-h-0 flex-1 flex-col border-t-4 border-t-[#B5E18B]">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Fiche élève</p>
              <DialogTitle className="mt-1 text-left font-display text-xl font-semibold tracking-tight text-foreground">
                {client.child_name} <span className="font-normal text-muted-foreground">· {client.parent_name}</span>
              </DialogTitle>
            </div>
            <div className="text-right">
              <p className={labelClass}>Statut</p>
              <span className={cn("mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide", client.payment_status === "paye" ? "bg-[#B5E18B]/30 text-[#3E6420]" : client.payment_status === "retard" ? "bg-[#F6D8D8] text-[#9A2F2F]" : "bg-[#F4E3C0] text-[#8A5A16]")}>
                {PAYMENT_LABEL[client.payment_status ?? "impaye"]}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-touch px-6 py-5">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <SectionTitle icon={GraduationCap}>Scolarité</SectionTitle>
              <InfoRow label="Nom de l'élève" value={client.child_name} />
              <InfoRow label="Âge" value={dash(client.child_age)} />
              <InfoRow label="Date de naissance" value={dash(client.dob)} />
              <InfoRow label="Niveau / Classe" value={dash(client.level)} />
              <InfoRow label="Date d'inscription" value={dash(new Date(client.created_at).toLocaleDateString("fr-FR"))} />
              <InfoRow label="Enfants scolarisés" value={`${client.fratrie ?? 1}`} />

              <SectionTitle icon={CalendarDays}>Parents & identité</SectionTitle>
              <InfoRow label="Nom du père" value={dash(client.father_name)} />
              <InfoRow label="Nom de la mère" value={dash(client.mother_name)} />
              <InfoRow label="CIN / Passeport" value={dash(client.cin)} />

              <SectionTitle icon={Phone}>Contact</SectionTitle>
              <InfoRow label="Email du père" value={dash(client.email)} />
              <InfoRow label="Email de la mère" value={dash(client.email2)} />
              <InfoRow label="Téléphone du père" value={dash(client.phone)} />
              <InfoRow label="Téléphone de la mère" value={dash(client.phone2)} />

              <SectionTitle icon={ShieldAlert}>Contact d'urgence</SectionTitle>
              <InfoRow label="Notes" value={dash(client.notes)} />

              <SectionTitle icon={Bus}>Services souscrits</SectionTitle>
              {services.filter((s) => s.enabled).map((s) => (
                <InfoRow key={s.name} label={s.name} value={subscribed.includes(s.name) ? "Oui" : "Non"} />
              ))}

              <SectionTitle icon={Utensils}>Paiement & remise</SectionTitle>
              <InfoRow label="Frais mensuels" value={`${client.monthly_fee ?? 0} ${t.common.mad}`} />
              <InfoRow
                label="Remise fratrie"
                value={(client.remise ?? 0) > 0 ? `${client.remise}%   ${client.fratrie ?? 1} enfants` : "Aucune"}
              />
              <InfoRow label="Jour de paiement" value={client.payment_day ? `Le ${client.payment_day}` : " "} />
              <InfoRow label="Dette totale" value={`${client.debt ?? 0} ${t.common.mad}`} />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#28396C]/10 bg-card px-6 py-4">
            <button type="button" onClick={onPayment} className={primaryPill}>
              <Plus className="h-4 w-4" />
              Enregistrer un paiement
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useDashboardI18n();
  const queryClient = useQueryClient();
  const f = t.form;
  const a = t.familles.addModal;
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const services: Array<{ name: string; price: number; enabled: boolean }> = settings?.services ?? [];
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[640px]")}>
        <DialogDescription className="sr-only">{a.srDesc}</DialogDescription>
        <div className="flex min-h-0 flex-1 flex-col border-t-4 border-t-[#B5E18B]">
          <div className="shrink-0 border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{a.title}</DialogTitle>
          </div>
          <form
            className="min-h-0 flex-1 overflow-y-auto scroll-touch px-6 py-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const fd = new FormData(e.currentTarget);
              const subscribed = services.filter((s) => fd.get(`svc_${s.name}`)).map((s) => s.name);
              try {
                await createClient({
                  data: {
                    parent_name: String(fd.get("parent") || ""),
                    child_name: String(fd.get("child") || ""),
                    email: String(fd.get("email1") || ""),
                    email2: String(fd.get("email2") || ""),
                    phone: String(fd.get("tel1") || ""),
                    level: String(fd.get("niveau") || ""),
                    monthly_fee: Number(fd.get("mensuel") || 0),
                    fratrie: Number(fd.get("fratrie") || 1),
                    remise: remiseAuto(Number(fd.get("fratrie") || 1)),
                    subscribed_services: subscribed,
                    payment_day: 1,
                  },
                });
                queryClient.invalidateQueries({ queryKey: ["clients"] });
                toast.success("Client créé");
                onOpenChange(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erreur");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="nc-parent" label={f.parentDisplayName}>
                <Input id="nc-parent" name="parent" required className={inputClass} placeholder={f.parentDisplayPlaceholder} />
              </Field>
              <Field id="nc-child" label={f.studentName}>
                <Input id="nc-child" name="child" required className={inputClass} />
              </Field>
              <Field id="nc-email" label="Email du père">
                <Input id="nc-email" name="email1" type="email" className={inputClass} />
              </Field>
              <Field id="nc-email2" label="Email de la mère">
                <Input id="nc-email2" name="email2" type="email" className={inputClass} />
              </Field>
              <Field id="nc-tel" label={f.phone1}>
                <Input id="nc-tel" name="tel1" type="tel" className={inputClass} />
              </Field>
              <Field id="nc-niveau" label={f.level}>
                <Input id="nc-niveau" name="niveau" className={inputClass} placeholder={f.levelExample} />
              </Field>
              <Field id="nc-mensuel" label={f.monthlyFeesMad}>
                <Input id="nc-mensuel" name="mensuel" type="number" min={0} defaultValue={0} className={inputClass} />
              </Field>
              <Field id="nc-fratrie" label="Enfants scolarisés">
                <Input id="nc-fratrie" name="fratrie" type="number" min={1} max={10} defaultValue={1} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Label className={labelClass}>Services souscrits</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Une remise fratrie de 10 % est appliquée dès le 3ᵉ enfant, 15 % dès le 4ᵉ.
                </p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {services.filter((s) => s.enabled).map((s) => (
                    <label key={s.name} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        name={`svc_${s.name}`}
                        className="h-4 w-4 rounded border-[#28396C]/25 accent-[#6BA53A]"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#28396C]/10 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" className={cn(primaryPill, "px-5 py-2")}>
                {a.submit}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({
  clientId,
  clientLabel,
  clientEmail,
  open,
  onOpenChange,
}: {
  clientId: string;
  clientLabel: string;
  clientEmail?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
        await sendPaymentReceipt({
          data: {
            to: clientEmail,
            parentName: clientLabel,
            receipt: payment.receipt,
            amount: Number(payment.amount),
            date: String(payment.date),
            mode: String(payment.mode),
            period: String(payment.period),
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
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{p.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{p.title}</DialogTitle>
          </div>
          <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
            <Field id="pay-montant" label={f.amountMad}>
              <Input id="pay-montant" name="montant" type="number" defaultValue={0} min={0} className={inputClass} />
            </Field>
            <Field id="pay-date" label={f.paymentDate}>
              <Input id="pay-date" name="date" type="date" className={inputClass} />
            </Field>
            <Field id="pay-mode" label={f.paymentMode}>
              <Select name="mode" defaultValue="especes">
                <SelectTrigger id="pay-mode" className={selectTriggerClass}>
                  <SelectValue placeholder={t.common.mode} />
                </SelectTrigger>
                <SelectContent className={softSelectContent}>
                  <SelectItem value="especes">{f.paymentModes.cash}</SelectItem>
                  <SelectItem value="virement">{f.paymentModes.transfer}</SelectItem>
                  <SelectItem value="carte">{f.paymentModes.card}</SelectItem>
                  <SelectItem value="cheque">{f.paymentModes.check}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#28396C]/10 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" disabled={busy} className={cn(primaryPill, "px-5 py-2 disabled:opacity-60")}>
                {busy ? "..." : p.confirm}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditClientDialog({
  client,
  open,
  onOpenChange,
}: {
  client: FlatClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const services: Array<{ name: string; price: number; enabled: boolean }> = settings?.services ?? [];
  const initialSubscribed = client.subscribed_services ?? [];
  const [subscribed, setSubscribed] = useState<string[]>(initialSubscribed);
  const [fratrie, setFratrie] = useState<number>(client.fratrie ?? 1);
  const [remise, setRemise] = useState<number>(client.remise ?? 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSubscribed(client.subscribed_services ?? []);
    setFratrie(client.fratrie ?? 1);
    setRemise(client.remise ?? 0);
  }, [client]);

  const { t } = useDashboardI18n();
  const f = t.form;
  const e = t.familles.editModal;

  const toggleSvc = (name: string) => {
    setSubscribed((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "w-[min(100vw-1.5rem,640px)] max-w-[640px]")}>
        <DialogDescription className="sr-only">{interpolate(e.srDesc, { name: client.child_name })}</DialogDescription>
        <div className="flex min-h-0 flex-1 flex-col border-t-4 border-t-[#B5E18B]">
          <div className="shrink-0 border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{e.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{e.title}</DialogTitle>
          </div>
          <form
            className="min-h-0 flex-1 space-y-4 overflow-y-auto scroll-touch px-6 py-5"
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              const fd = new FormData(ev.currentTarget);
              try {
                await updateClient({
                  data: {
                    id: client.id,
                    parent_name: String(fd.get("parent_name") ?? client.parent_name),
                    child_name: String(fd.get("child_name") ?? client.child_name),
                    email: String(fd.get("email") ?? client.email),
                    email2: String(fd.get("email2") ?? client.email2),
                    phone: String(fd.get("phone") ?? client.phone),
                    phone2: String(fd.get("phone2") ?? client.phone2),
                    father_name: String(fd.get("father_name") ?? client.father_name),
                    mother_name: String(fd.get("mother_name") ?? client.mother_name),
                    cin: String(fd.get("cin") ?? client.cin),
                    dob: String(fd.get("dob") ?? client.dob),
                    level: String(fd.get("level") ?? client.level),
                    notes: String(fd.get("notes") ?? client.notes),
                    fratrie,
                    remise,
                    subscribed_services: subscribed,
                    payment_day: Number(fd.get("payment_day") ?? client.payment_day ?? 1),
                  },
                });
                queryClient.invalidateQueries({ queryKey: ["clients"] });
                toast.success("Client modifié");
                onOpenChange(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erreur");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="e-parent" label={t.common.parent}>
                <Input id="e-parent" name="parent_name" defaultValue={client.parent_name} className={inputClass} />
              </Field>
              <Field id="e-child" label={t.common.child}>
                <Input id="e-child" name="child_name" defaultValue={client.child_name} className={inputClass} />
              </Field>
              <Field id="e-dob" label={f.birthDate}>
                <Input id="e-dob" name="dob" defaultValue={client.dob} className={inputClass} />
              </Field>
              <Field id="e-level" label={f.level}>
                <Input id="e-level" name="level" defaultValue={client.level} className={inputClass} />
              </Field>
              <Field id="e-father" label={f.fatherName}>
                <Input id="e-father" name="father_name" defaultValue={client.father_name} className={inputClass} />
              </Field>
              <Field id="e-mother" label={f.motherName}>
                <Input id="e-mother" name="mother_name" defaultValue={client.mother_name} className={inputClass} />
              </Field>
              <Field id="e-cin" label={f.cinPassport}>
                <Input id="e-cin" name="cin" defaultValue={client.cin} className={inputClass} />
              </Field>
              <Field id="e-email" label="Email du père">
                <Input id="e-email" name="email" type="email" defaultValue={client.email} className={inputClass} />
              </Field>
              <Field id="e-email2" label="Email de la mère">
                <Input id="e-email2" name="email2" type="email" defaultValue={client.email2} className={inputClass} />
              </Field>
              <Field id="e-phone" label="Téléphone du père">
                <Input id="e-phone" name="phone" type="tel" defaultValue={client.phone} className={inputClass} />
              </Field>
              <Field id="e-phone2" label="Téléphone de la mère">
                <Input id="e-phone2" name="phone2" type="tel" defaultValue={client.phone2} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="e-notes" label="Notes">
                  <Input id="e-notes" name="notes" defaultValue={client.notes} className={inputClass} />
                </Field>
              </div>
              <Field id="e-fratrie" label="Enfants scolarisés">
                <Input
                  id="e-fratrie"
                  type="number"
                  min={1}
                  max={10}
                  value={fratrie}
                  onChange={(ev) => {
                    const n = Number(ev.target.value || 1);
                    setFratrie(n);
                    setRemise(remiseAuto(n));
                  }}
                  className={inputClass}
                />
              </Field>
              <Field id="e-remise" label="Remise fratrie (%)">
                <Input
                  id="e-remise"
                  type="number"
                  min={0}
                  max={100}
                  value={remise}
                  onChange={(ev) => setRemise(Number(ev.target.value || 0))}
                  className={inputClass}
                />
              </Field>
              <Field id="e-jour" label={f.paymentDay}>
                <Input id="e-jour" name="payment_day" type="number" min={1} max={31} defaultValue={client.payment_day ?? 1} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Label className={labelClass}>Services souscrits</Label>
                <div className="mt-2 flex flex-wrap gap-4">
                  {services.filter((s) => s.enabled).map((s) => (
                    <label key={s.name} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={subscribed.includes(s.name)}
                        onChange={() => toggleSvc(s.name)}
                        className="h-4 w-4 rounded border-[#28396C]/25 accent-[#6BA53A]"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#28396C]/10 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" disabled={busy} className={cn(primaryPill, "px-5 py-2 disabled:opacity-60")}>
                {busy ? "..." : t.common.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
