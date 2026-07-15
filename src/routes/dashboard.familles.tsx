import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
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
  Briefcase,
  BookOpen,
  Upload,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
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
  ghostPill,
  iconButton,
  statusPill,
  STATUS_COLORS,
  dashTooltip,
  renderPieLabel,
  eyebrowClass,
} from "@/lib/dash-ui";
import { listClients, createClient, updateClient, deleteClient, getClient, importClientsCsv, type ClientInput } from "@/lib/server-clients";
import { getSettings } from "@/lib/server-settings";
import { AddClientDialog, emptyChild, emptyWizard, type WizardData, type ChildFormData } from "@/components/add-client-wizard";
import { createPayment, updatePaymentInvoice } from "@/lib/server-payments";
import { generateReceiptPdf } from "@/lib/server-receipt";
import { sendClientMessage, sendBroadcast, sendPaymentReceipt } from "@/lib/server-whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/familles")({
  head: () => ({ meta: [{ title: "Parents   CRM" }] }),
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
  cin_mother: string;
  father_name: string;
  mother_name: string;
  profession_father: string;
  profession_mother: string;
  address: string;
  child_names: { name: string; dob: string; cycle: string; level: string; services: string[]; frais: string[] }[];
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
  subscribed_frais: string[];
  created_at: string;
};

function remiseAuto(fratrie: number) {
  if (fratrie >= 4) return 15;
  if (fratrie >= 3) return 10;
  return 0;
}

function servicesOf(c: DbClient, svcNames: string[]) {
  const all = (c.child_names ?? []).flatMap((ch) => ch.services ?? []);
  const dedup = [...new Set(all)];
  return dedup.filter((s) => svcNames.includes(s));
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

  const [search, setSearch] = useState("");
  const [niveauFilter, setNiveauFilter] = useState<string>("tous");
  const [serviceFilter, setServiceFilter] = useState<string>("tous");

  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Wizard data persists across dialog close so users don't lose their input
  const [wizard, setWizard] = useState<WizardData>(emptyWizard);

  const updateWizard = (patch: Partial<WizardData>) => setWizard((prev) => ({ ...prev, ...patch }));

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

  const niveaux = useMemo(
    () => [...new Set(base.map((c) => c.level).filter(Boolean))].sort(),
    [base],
  );

  const filtered = useMemo(
    () => base.filter((c) => niveauFilter === "tous" || c.level === niveauFilter),
    [base, niveauFilter],
  );

  const LEVEL_COLORS = [
    "#28396C", "#B5E18B", "#D2624A", "#F4C542", "#7BA5D9",
    "#E8A87C", "#95D5B2", "#C77DFF", "#F4845F", "#52B788",
  ];

  const donut = useMemo(() => {
    const counts: Record<string, number> = {};
    base.forEach((c) => {
      const lv = c.level || "Non défini";
      counts[lv] = (counts[lv] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => {
        if (a === "Non défini") return 1;
        if (b === "Non défini") return -1;
        return a.localeCompare(b);
      })
      .map(([name, value], i) => ({
        name,
        value,
        color: LEVEL_COLORS[i % LEVEL_COLORS.length],
      }));
  }, [base]);
  const donutTotal = donut.reduce((s, d) => s + d.value, 0);

  const detail = detailId ? clients.find((c) => c.id === detailId) : null;
  const edit = editId ? clients.find((c) => c.id === editId) : null;
  const paymentClient = paymentId ? clients.find((c) => c.id === paymentId) : null;

  const fileRef = useRef<HTMLInputElement>(null);
  const importCsv = useMutation({
    mutationFn: importClientsCsv,
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(`${r.imported} client(s) importé(s)${r.errors.length ? `, ${r.errors.length} erreur(s)` : ""}`);
      if (r.errors.length) r.errors.forEach((e) => toast.error(e));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur import CSV"),
  });

  function handleExportCsv() {
    const cols = [
      "parent_name", "child_name", "child_names", "email", "phone", "address",
      "level", "monthly_fee", "remise", "payment_day", "fratrie",
      "transport", "cantine", "garderie", "activites", "notes",
    ];
    const header = cols.join(",");
    const body = clients.map((c) => {
      const childNames = JSON.stringify(c.child_names ?? []);
      const esc = (v: unknown) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      return cols.map((col) => {
        if (col === "child_names") return esc(childNames);
        return esc((c as Record<string, unknown>)[col]);
      }).join(",");
    }).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      importCsv.mutate({ data: { csvText: text } });
    };
    reader.readAsText(file);
  }

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
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportCsv(f); e.target.value = ""; }}
          />
          <button type="button" onClick={handleExportCsv} className={cn(ghostPill, "gap-1.5")} title="Exporter en CSV">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={importCsv.isPending} className={cn(ghostPill, "gap-1.5 disabled:opacity-50")} title="Importer un CSV">
            {importCsv.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            CSV
          </button>
          <button type="button" onClick={() => setAddOpen(true)} className={primaryPill}>
            <Plus className="h-4 w-4" />
            {t.familles.addClient}
          </button>
        </div>
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
              <Label className={labelClass}>Niveau</Label>
              <Select value={niveauFilter} onValueChange={setNiveauFilter}>
                <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par niveau">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={softSelectContent}>
                  <SelectItem value="tous">Tous les niveaux</SelectItem>
                  {niveaux.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
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

        {/* Graphique circulaire — répartition par niveau */}
        <section className={cn(softCard, "flex flex-col p-5")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Analyse</p>
          {donutTotal > 0 ? (
            <>
              <div className="mt-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={donut}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      dataKey="value"
                      strokeWidth={0}
                      label={renderPieLabel}
                    >
                      {donut.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={dashTooltip}
                      formatter={(value: number, name: string) => [`${value} élève${value > 1 ? "s" : ""}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
                {donut.map((d) => {
                  const share = Math.round((d.value / donutTotal) * 100);
                  return (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {d.value} <span className="text-[10px]">({share}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
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
                  <td className="px-4 py-3 tabular-nums text-foreground/90">
                    <span className="block font-semibold text-foreground">
                      {(c.monthly_fee ?? 0)} {t.common.mad}
                    </span>
                    {(c.remise ?? 0) > 0 ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {Math.round((c.monthly_fee ?? 0) * (1 - (c.remise ?? 0) / 100))} {t.common.mad} après remise
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
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

      <AddClientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        wizard={wizard}
        updateWizard={updateWizard}
        setWizard={setWizard}
      />

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
              <p className={labelClass}>Niveau</p>
              <span className="mt-1 inline-block rounded-full bg-[#B5E18B]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3E6420]">
                {dash(client.level)}
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
        <InfoRow label="CIN / Passeport (père)" value={dash(client.cin)} />
        <InfoRow label="CIN / Passeport (mère)" value={dash(client.cin_mother)} />

        <SectionTitle icon={Briefcase}>Profession & adresse</SectionTitle>
        <InfoRow label="Profession du père" value={dash(client.profession_father)} />
        <InfoRow label="Profession de la mère" value={dash(client.profession_mother)} />
        <InfoRow label="Adresse" value={dash(client.address)} />

        <SectionTitle icon={Phone}>Contact</SectionTitle>
        <InfoRow label="Email du père" value={dash(client.email)} />
        <InfoRow label="Email de la mère" value={dash(client.email2)} />
        <InfoRow label="Téléphone 1" value={dash(client.phone)} />
        <InfoRow label="Téléphone 2" value={dash(client.phone2)} />

        <SectionTitle icon={ShieldAlert}>Contact d'urgence</SectionTitle>
        <InfoRow label="Notes" value={dash(client.notes)} />

        <SectionTitle icon={BookOpen}>Élèves</SectionTitle>
        {(client.child_names ?? []).length > 0 ? (
          (client.child_names ?? []).map((ch, i) => (
            <div key={i} className="col-span-full rounded-xl bg-muted/40 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Élève {i + 1} — {ch.name}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoRow label="Date de naissance" value={dash(ch.dob)} />
                <InfoRow label="Cycle" value={dash(ch.cycle)} />
                <InfoRow label="Niveau" value={dash(ch.level)} />
                <InfoRow label="Services" value={(ch.services ?? []).join(", ") || "—"} />
              </div>
            </div>
          ))
        ) : (
          <InfoRow label="Nom de l'élève" value={dash(client.child_name)} />
        )}

        <SectionTitle icon={Bus}>Frais supplémentaires</SectionTitle>
        {(() => {
          const all = (client.child_names ?? []).flatMap((ch) => ch.frais ?? []);
          const dedup = [...new Set(all as string[])];
          return dedup.length > 0
            ? dedup.map((f) => <InfoRow key={f} label={f} value="Souscrit" />)
            : <InfoRow label="Aucun" value="—" />;
        })()}

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
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const schoolYearStart = currentMonth >= 9 ? currentYear : currentYear - 1;
  const [schoolYear, setSchoolYear] = useState(schoolYearStart);

  const SCHOOL_MONTHS = [
    { num: 9, short: "Sep", long: "Septembre" },
    { num: 10, short: "Oct", long: "Octobre" },
    { num: 11, short: "Nov", long: "Novembre" },
    { num: 12, short: "Déc", long: "Décembre" },
    { num: 1, short: "Jan", long: "Janvier" },
    { num: 2, short: "Fév", long: "Février" },
    { num: 3, short: "Mar", long: "Mars" },
    { num: 4, short: "Avr", long: "Avril" },
    { num: 5, short: "Mai", long: "Mai" },
    { num: 6, short: "Juin", long: "Juin" },
  ];

  function monthCalYear(num: number, sy: number) {
    return num >= 9 ? sy : sy + 1;
  }

  function isFutureMonth(num: number, sy: number) {
    const yr = monthCalYear(num, sy);
    if (yr > currentYear) return true;
    if (yr < currentYear) return false;
    return num > currentMonth;
  }

  function selectMonth(num: number) {
    const yr = monthCalYear(num, schoolYear);
    const value = `${String(num).padStart(2, "0")}/${yr}`;
    setSelectedPeriod(value);
  }

  function formatPeriod(value: string) {
    if (!value) return "Mois en cours";
    const [m, y] = value.split("/");
    const month = SCHOOL_MONTHS.find((s) => s.num === Number(m));
    return month ? `${month.long} ${y}` : value;
  }

  function prevSchoolYear() { setSchoolYear((y) => y - 1); }
  function nextSchoolYear() { setSchoolYear((y) => Math.min(y + 1, currentYear)); }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const period = String(fd.get("period") || "");
      const payment = await createPayment({
        data: {
          client_id: clientId,
          amount: Number(fd.get("montant") ?? 0),
          date: String(fd.get("date") || new Date().toISOString().split("T")[0]),
          mode: String(fd.get("mode") || "especes") as any,
          period: period || undefined,
        },
      });
      if (clientEmail) {
        const clientData = await getClient({ data: clientId });
        const children = (clientData as any)?.child_names ?? [];
        const pdfResult = await generateReceiptPdf({
          data: {
            clientId,
            paymentId: payment.id,
            data: {
              school_name: "",
              school_address: "",
              school_phone: "",
              receipt_number: payment.receipt,
              date: String(payment.date),
              parent_name: clientLabel,
              children_names: children.map((c: any) => c.name).join(", "),
              period: String(payment.period),
              monthly_fee: String((clientData as any)?.monthly_fee ?? 0),
              remise: String((clientData as any)?.remise ?? 0),
              discount_amount: String(Math.round(((clientData as any)?.monthly_fee ?? 0) * ((clientData as any)?.remise ?? 0) / 100)),
              amount_due: String(payment.amount),
              amount_paid: String(payment.amount),
              payment_date: String(payment.date),
              remaining: "0",
              payment_mode: String(payment.mode),
              stamp: "true",
            },
          },
        });
        await sendPaymentReceipt({
          data: {
            to: clientEmail,
            parentName: clientLabel,
            receipt: payment.receipt,
            amount: Number(payment.amount),
            date: String(payment.date),
            mode: String(payment.mode),
            period: String(payment.period),
            pdfUrl: pdfResult.url,
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
            <Field id="pay-period" label="Mois concerné">
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(selectTriggerClass, "w-full justify-start text-left font-normal")}>
                    {selectedPeriod ? formatPeriod(selectedPeriod) : "Mois en cours"}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[280px] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <button type="button" onClick={prevSchoolYear} className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">{schoolYear}/{schoolYear + 1}</span>
                    <button type="button" onClick={nextSchoolYear} className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted disabled:opacity-30" disabled={schoolYear >= currentYear}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {SCHOOL_MONTHS.map((m) => {
                      const yr = monthCalYear(m.num, schoolYear);
                      const val = `${String(m.num).padStart(2, "0")}/${yr}`;
                      const future = isFutureMonth(m.num, schoolYear);
                      return (
                        <button
                          key={m.num}
                          type="button"
                          onClick={() => selectMonth(m.num)}
                          disabled={future}
                          className={cn(
                            "rounded-md px-1 py-2 text-sm transition-colors",
                            selectedPeriod === val ? "bg-[#6BA53A] text-white font-semibold" : "hover:bg-muted",
                            future && "text-muted-foreground/30 cursor-not-allowed",
                          )}
                        >
                          {m.short}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <input type="hidden" name="period" value={selectedPeriod} />
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
