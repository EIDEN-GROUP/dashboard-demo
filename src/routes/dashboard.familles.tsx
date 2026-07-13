import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import {
  Pencil,
  Plus,
  Search,
  GraduationCap,
  CalendarDays,
  MapPin,
  Phone,
  HeartPulse,
  Utensils,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
} from "recharts";
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
import { cn } from "@/lib/utils";
import { interpolate, useDashboardI18n } from "@/lib/landing-i18n";
import {
  softCard,
  softInput as inputClass,
  softSelectTrigger as selectTriggerClass,
  softSelectContent,
  dialogSurface,
  dashTooltip,
  labelClass,
  primaryPill,
  iconButton,
  statusPill,
  STATUS_COLORS,
} from "@/lib/dash-ui";

export const Route = createFileRoute("/dashboard/familles")({
  head: () => ({ meta: [{ title: "Parents   CRM" }] }),
  component: CrmParentsPage,
});

type StadeCrm = "nouveau" | "converti";
type PaymentStatus = "paye" | "impaye" | "retard";

// ── Mois de facturation (démo) ─────────────────────────────
const MONTHS: { key: string; label: string }[] = [
  { key: "2026-01", label: "Janvier 2026" },
  { key: "2026-02", label: "Février 2026" },
  { key: "2026-03", label: "Mars 2026" },
  { key: "2026-04", label: "Avril 2026" },
  { key: "2026-05", label: "Mai 2026" },
  { key: "2026-06", label: "Juin 2026" },
];
const DEFAULT_MONTH = "2026-05";

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paye: "Payé",
  impaye: "Impayé",
  retard: "En retard",
};

type Client = {
  id: string;
  parent: string;
  child: string;
  childSubtitle?: string;
  sexe: "Garçon" | "Fille" | "";
  email: string;
  phone: string;
  stade: StadeCrm;
  /** statut de paiement par mois (clé = MONTHS.key) */
  statuts: Record<string, PaymentStatus>;
  mensuel: number;
  dette: number;
  dob: string;
  dateInscription: string;
  pere: string;
  mere: string;
  cin: string;
  email2: string;
  tel2: string;
  niveau: string;
  jourPaiement?: number;
  adresse: string;
  groupeSanguin: string;
  allergies: string;
  urgenceNom: string;
  urgenceTel: string;
  transport: "Oui" | "Non";
  cantine: "Oui" | "Non";
};

/** Statut du mois sélectionné (défaut impayé si non renseigné). */
function statusOf(c: Client, month: string): PaymentStatus {
  return c.statuts[month] ?? "impaye";
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

/** Badge de stade CRM (nouveau / converti). */
function StadeBadge({ children, dark }: { children: ReactNode; dark: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        dark ? "bg-[#B5E18B]/30 text-[#3E6420]" : "bg-muted text-foreground/70",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dark ? "bg-[#6BA53A]" : "bg-current")} aria-hidden />
      {children}
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

const initialClients: Client[] = [
  {
    id: "1",
    parent: "rztest / testss",
    child: "testss",
    childSubtitle: "Enfant de 13 ans",
    sexe: "Garçon",
    email: "tehgdgh@test.com",
    phone: "0614020520",
    stade: "nouveau",
    statuts: { "2026-01": "impaye", "2026-02": "impaye", "2026-03": "impaye", "2026-04": "impaye", "2026-05": "impaye", "2026-06": "impaye" },
    mensuel: 0,
    dette: 0,
    dob: "",
    dateInscription: "12/09/2025",
    pere: "testest",
    mere: "testst",
    cin: "",
    email2: "",
    tel2: "",
    niveau: "1ère année collège",
    jourPaiement: 1,
    adresse: "",
    groupeSanguin: "",
    allergies: "",
    urgenceNom: "",
    urgenceTel: "",
    transport: "Non",
    cantine: "Non",
  },
  {
    id: "2",
    parent: "Famille Alami",
    child: "Yasmine",
    sexe: "Fille",
    email: "contact.alami@example.com",
    phone: "0661122334",
    stade: "converti",
    statuts: { "2026-01": "paye", "2026-02": "paye", "2026-03": "paye", "2026-04": "paye", "2026-05": "paye", "2026-06": "impaye" },
    mensuel: 1800,
    dette: 0,
    dob: "15/03/2012",
    dateInscription: "02/09/2023",
    pere: "Karim Alami",
    mere: "Sanae Alami",
    cin: "AB123456",
    email2: "",
    tel2: "",
    niveau: "CM2",
    jourPaiement: 5,
    adresse: "12 Rue Ibn Batouta, Rabat",
    groupeSanguin: "O+",
    allergies: "Aucune",
    urgenceNom: "Sanae Alami (mère)",
    urgenceTel: "0661122334",
    transport: "Oui",
    cantine: "Oui",
  },
  {
    id: "3",
    parent: "Benjelloun / Sara",
    child: "Sara",
    sexe: "Fille",
    email: "sara.b@example.com",
    phone: "0611223344",
    stade: "nouveau",
    statuts: { "2026-01": "impaye", "2026-02": "retard", "2026-03": "retard", "2026-04": "impaye", "2026-05": "retard", "2026-06": "impaye" },
    mensuel: 1600,
    dette: 1200,
    dob: "22/06/2015",
    dateInscription: "10/09/2024",
    pere: "Omar Benjelloun",
    mere: "Leila Idrissi",
    cin: " ",
    email2: "",
    tel2: "0655009911",
    niveau: "CE1",
    jourPaiement: 10,
    adresse: "Hay Riad, Rabat",
    groupeSanguin: "A+",
    allergies: "Arachides",
    urgenceNom: "Omar Benjelloun (père)",
    urgenceTel: "0611223344",
    transport: "Non",
    cantine: "Oui",
  },
  {
    id: "4",
    parent: "Tazi / Mehdi",
    child: "Mehdi",
    sexe: "Garçon",
    email: "mehdi.parent@example.com",
    phone: "0622334455",
    stade: "converti",
    statuts: { "2026-01": "paye", "2026-02": "paye", "2026-03": "retard", "2026-04": "paye", "2026-05": "paye", "2026-06": "impaye" },
    mensuel: 1800,
    dette: 0,
    dob: "02/11/2010",
    dateInscription: "01/09/2022",
    pere: "Hicham Tazi",
    mere: "Nadia Tazi",
    cin: "CD998877",
    email2: "second@example.com",
    tel2: "",
    niveau: "1ère année collège",
    jourPaiement: 1,
    adresse: "Lotissement Al Andalous, Salé",
    groupeSanguin: "B-",
    allergies: "Aucune",
    urgenceNom: "Nadia Tazi (mère)",
    urgenceTel: "0622334455",
    transport: "Oui",
    cantine: "Non",
  },
];

function dash(v: string) {
  return v.trim() === "" ? " " : v;
}

function CrmParentsPage() {
  const { t } = useDashboardI18n();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<string>(DEFAULT_MONTH);
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [stageFilter, setStageFilter] = useState<string>("tous");

  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const setStatus = (id: string, status: PaymentStatus) =>
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statuts: { ...c.statuts, [month]: status } } : c)),
    );

  // Base = recherche + stade (sert au graphique) ; filtered ajoute le statut (sert au tableau)
  const base = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (stageFilter !== "tous" && c.stade !== stageFilter) return false;
      if (!q) return true;
      const blob = `${c.parent} ${c.child} ${c.email} ${c.phone} ${c.niveau}`.toLowerCase();
      return blob.includes(q);
    });
  }, [clients, search, stageFilter]);

  const filtered = useMemo(
    () => base.filter((c) => statusFilter === "tous" || statusOf(c, month) === statusFilter),
    [base, statusFilter, month],
  );

  // Répartition du mois pour le graphique circulaire
  const donut = useMemo(() => {
    const counts = { paye: 0, impaye: 0, retard: 0 };
    base.forEach((c) => {
      counts[statusOf(c, month)] += 1;
    });
    return [
      { name: "Payé", value: counts.paye, color: STATUS_COLORS.paye },
      { name: "Impayé", value: counts.impaye, color: STATUS_COLORS.impaye },
      { name: "En retard", value: counts.retard, color: STATUS_COLORS.retard },
    ];
  }, [base, month]);
  const donutTotal = donut.reduce((s, d) => s + d.value, 0);

  const monthLabel = MONTHS.find((m) => m.key === month)?.label ?? "";

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

      {/* Filtres + analyse du mois */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className={cn(softCard, "p-5 lg:col-span-2")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Filtres   vue mensuelle</p>
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
              <Label className={labelClass}>Mois</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par mois">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={softSelectContent}>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label className={labelClass}>Stade CRM</Label>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par stade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={softSelectContent}>
                  <SelectItem value="tous">Tous les stades</SelectItem>
                  <SelectItem value="nouveau">{t.status.stageNouveau}</SelectItem>
                  <SelectItem value="converti">{t.status.stageConverti}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length === 1
              ? t.familles.clientsFoundOne
              : interpolate(t.familles.clientsFoundMany, { count: filtered.length })}{" "}
              {monthLabel}
          </p>
        </section>

        {/* Graphique circulaire   répartition du mois */}
        <section className={cn(softCard, "flex flex-col p-5")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Analyse   {monthLabel}</p>
          <div className="relative mx-auto mt-2 h-40 w-full max-w-[13rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="none"
                >
                  {donut.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip contentStyle={dashTooltip} formatter={(v: number, n) => [`${v} famille${v > 1 ? "s" : ""}`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">{donutTotal}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">familles</p>
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {donut.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold tabular-nums text-foreground">{d.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Tableau   cliquer une ligne ouvre la fiche complète */}
      <section className={cn(softCard, "overflow-hidden")}>
        <div className="border-b border-[#28396C]/10 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t.familles.clientList}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#28396C]/10 bg-muted/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{t.familles.table.parent}</th>
                <th className="px-4 py-3">{t.familles.table.child}</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">{t.familles.table.contact}</th>
                <th className="px-4 py-3">{t.familles.table.crmStage}</th>
                <th className="px-4 py-3">Statut ({monthLabel})</th>
                <th className="px-4 py-3">{t.familles.table.monthly}</th>
                <th className="px-4 py-3 w-16">{t.familles.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28396C]/8">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setDetailId(c.id)}
                  className="cursor-pointer transition-colors hover:bg-[#B5E18B]/10"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{c.parent}</td>
                  <td className="px-4 py-3 text-foreground/90">
                    <span className="block">{c.child}</span>
                    {c.childSubtitle ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{c.childSubtitle}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dash(c.niveau)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="block">{c.email}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{c.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StadeBadge dark={c.stade === "converti"}>
                      {c.stade === "nouveau" ? t.status.nouveau : t.status.converti}
                    </StadeBadge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect value={statusOf(c, month)} onChange={(v) => setStatus(c.id, v)} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">
                    {c.mensuel} {t.common.mad}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setEditId(c.id)}
                      className={iconButton}
                      aria-label={interpolate(t.familles.editAria, { name: c.child })}
                    >
                      <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    </button>
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

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onCreated={(row) => setClients((p) => [...p, row])} />

      {detail ? (
        <DetailClientDialog
          client={detail}
          month={month}
          monthLabel={monthLabel}
          open={!!detailId}
          onOpenChange={(o) => !o && setDetailId(null)}
          onStatusChange={(v) => setStatus(detail.id, v)}
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
          clientLabel={paymentClient.parent}
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
          onSave={(patch) => {
            setClients((prev) => prev.map((x) => (x.id === edit.id ? { ...x, ...patch } : x)));
            setEditId(null);
          }}
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
  month,
  monthLabel,
  open,
  onOpenChange,
  onStatusChange,
  onEdit,
  onPayment,
}: {
  client: Client;
  month: string;
  monthLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (v: PaymentStatus) => void;
  onEdit: () => void;
  onPayment: () => void;
}) {
  const { t } = useDashboardI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "w-[min(100vw-1.5rem,680px)] max-w-[680px]")}>
        <DialogDescription className="sr-only">Fiche complète de {client.child}</DialogDescription>
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Fiche élève</p>
              <DialogTitle className="mt-1 text-left font-display text-xl font-semibold tracking-tight text-foreground">
                {client.child} <span className="font-normal text-muted-foreground">· {client.parent}</span>
              </DialogTitle>
            </div>
            <div className="text-right">
              <p className={labelClass}>Statut   {monthLabel}</p>
              <div className="mt-1">
                <StatusSelect value={statusOf(client, month)} onChange={onStatusChange} />
              </div>
            </div>
          </div>

          <div className="max-h-[62vh] overflow-y-auto scroll-touch px-6 py-5">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <SectionTitle icon={GraduationCap}>Scolarité</SectionTitle>
              <InfoRow label="Nom de l'élève" value={client.child} />
              <InfoRow label="Sexe" value={dash(client.sexe)} />
              <InfoRow label="Date de naissance" value={dash(client.dob)} />
              <InfoRow label="Niveau / Classe" value={dash(client.niveau)} />
              <InfoRow label="Date d'inscription" value={dash(client.dateInscription)} />
              <InfoRow label="Stade CRM" value={client.stade === "nouveau" ? t.status.nouveau : t.status.converti} />

              <SectionTitle icon={CalendarDays}>Parents & identité</SectionTitle>
              <InfoRow label="Nom du père" value={dash(client.pere)} />
              <InfoRow label="Nom de la mère" value={dash(client.mere)} />
              <InfoRow label="CIN / Passeport" value={dash(client.cin)} />

              <SectionTitle icon={Phone}>Contact</SectionTitle>
              <InfoRow label="Email principal" value={dash(client.email)} />
              <InfoRow label="Email secondaire" value={dash(client.email2)} />
              <InfoRow label="Téléphone 1" value={dash(client.phone)} />
              <InfoRow label="Téléphone 2" value={dash(client.tel2)} />
              <div className="sm:col-span-2">
                <p className={labelClass}>
                  <MapPin className="mr-1 inline h-3 w-3" />
                  Adresse
                </p>
                <p className="text-sm font-semibold text-foreground">{dash(client.adresse)}</p>
              </div>

              <SectionTitle icon={ShieldAlert}>Contact d'urgence</SectionTitle>
              <InfoRow label="Personne à contacter" value={dash(client.urgenceNom)} />
              <InfoRow label="Téléphone d'urgence" value={dash(client.urgenceTel)} />

              <SectionTitle icon={HeartPulse}>Santé & services</SectionTitle>
              <InfoRow label="Groupe sanguin" value={dash(client.groupeSanguin)} />
              <InfoRow label="Allergies" value={dash(client.allergies)} />
              <InfoRow label="Transport scolaire" value={client.transport} />
              <InfoRow label="Cantine" value={client.cantine} />

              <SectionTitle icon={Utensils}>Paiement</SectionTitle>
              <InfoRow label="Frais mensuels" value={`${client.mensuel} ${t.common.mad}`} />
              <InfoRow label="Jour de paiement" value={client.jourPaiement ? `Le ${client.jourPaiement}` : " "} />
              <InfoRow label="Dette totale" value={`${client.dette} ${t.common.mad}`} />
              <div className="sm:col-span-2">
                <p className={labelClass}>Historique des statuts</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {MONTHS.map((m) => {
                    const s = statusOf(client, m.key);
                    return (
                      <span key={m.key} className={cn(statusPill(s), "gap-1")} title={m.label}>
                        {m.label.split(" ")[0].slice(0, 3)} · {PAYMENT_LABEL[s]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#28396C]/10 px-6 py-4">
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
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (row: Client) => void;
}) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const a = t.familles.addModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[640px]")}>
        <DialogDescription className="sr-only">{a.srDesc}</DialogDescription>
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{a.title}</DialogTitle>
          </div>
          <form
            className="max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const parent = String(fd.get("parent") || "Nouveau parent");
              const child = String(fd.get("child") || "Enfant");
              onCreated({
                id: `n-${Date.now()}`,
                parent,
                child,
                sexe: "",
                email: String(fd.get("email1") || ""),
                phone: String(fd.get("tel1") || ""),
                stade: "nouveau",
                statuts: {},
                mensuel: Number(fd.get("mensuel") || 0),
                dette: 0,
                dob: "",
                dateInscription: "",
                pere: "",
                mere: "",
                cin: "",
                email2: "",
                tel2: "",
                niveau: String(fd.get("niveau") || ""),
                jourPaiement: 1,
                adresse: "",
                groupeSanguin: "",
                allergies: "",
                urgenceNom: "",
                urgenceTel: "",
                transport: "Non",
                cantine: "Non",
              });
              onOpenChange(false);
            }}
          >
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
                <Input id="nc-niveau" name="niveau" className={inputClass} placeholder={f.levelExample} />
              </Field>
              <Field id="nc-mensuel" label={f.monthlyFeesMad}>
                <Input id="nc-mensuel" name="mensuel" type="number" min={0} defaultValue={0} className={inputClass} />
              </Field>
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
  clientLabel,
  open,
  onOpenChange,
}: {
  clientLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const p = t.familles.paymentModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[480px]")}>
        <DialogDescription className="sr-only">{interpolate(p.srDesc, { name: clientLabel })}</DialogDescription>
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{p.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{p.title}</DialogTitle>
          </div>
          <form
            className="space-y-4 px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <Field id="pay-montant" label={f.amountMad}>
              <Input id="pay-montant" name="montant" type="number" defaultValue={0} min={0} className={inputClass} />
            </Field>
            <Field id="pay-date" label={f.paymentDate}>
              <Input id="pay-date" name="date" type="date" className={inputClass} defaultValue="2026-05-12" />
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
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#28396C]/10 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" className={cn(primaryPill, "px-5 py-2")}>
                {p.confirm}
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
  onSave,
}: {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<Client>) => void;
}) {
  const [stade, setStade] = useState<StadeCrm>(client.stade);
  const [sexe, setSexe] = useState<Client["sexe"]>(client.sexe);
  const [transport, setTransport] = useState<Client["transport"]>(client.transport);
  const [cantine, setCantine] = useState<Client["cantine"]>(client.cantine);

  useEffect(() => {
    setStade(client.stade);
    setSexe(client.sexe);
    setTransport(client.transport);
    setCantine(client.cantine);
  }, [client.id, client.stade, client.sexe, client.transport, client.cantine]);

  const { t } = useDashboardI18n();
  const f = t.form;
  const e = t.familles.editModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "w-[min(100vw-1.5rem,640px)] max-w-[640px]")}>
        <DialogDescription className="sr-only">{interpolate(e.srDesc, { name: client.child })}</DialogDescription>
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{e.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">{e.title}</DialogTitle>
          </div>
          <form
            className="max-h-[65vh] space-y-4 overflow-y-auto scroll-touch px-6 py-5"
            onSubmit={(ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              onSave({
                parent: String(fd.get("parent") || client.parent),
                child: String(fd.get("child") || client.child),
                sexe,
                email: String(fd.get("email") || client.email),
                phone: String(fd.get("phone") || client.phone),
                email2: String(fd.get("email2") ?? client.email2),
                tel2: String(fd.get("tel2") ?? client.tel2),
                pere: String(fd.get("pere") ?? client.pere),
                mere: String(fd.get("mere") ?? client.mere),
                cin: String(fd.get("cin") ?? client.cin),
                dob: String(fd.get("dob") ?? client.dob),
                dateInscription: String(fd.get("dateInscription") ?? client.dateInscription),
                niveau: String(fd.get("niveau") ?? client.niveau),
                adresse: String(fd.get("adresse") ?? client.adresse),
                groupeSanguin: String(fd.get("groupeSanguin") ?? client.groupeSanguin),
                allergies: String(fd.get("allergies") ?? client.allergies),
                urgenceNom: String(fd.get("urgenceNom") ?? client.urgenceNom),
                urgenceTel: String(fd.get("urgenceTel") ?? client.urgenceTel),
                transport,
                cantine,
                stade,
                mensuel: Number(fd.get("mensuel") ?? client.mensuel),
                dette: Number(fd.get("dette") ?? client.dette),
                jourPaiement: Number(fd.get("jour") ?? client.jourPaiement ?? 1),
              });
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="e-parent" label={t.common.parent}>
                <Input id="e-parent" name="parent" defaultValue={client.parent} className={inputClass} />
              </Field>
              <Field id="e-child" label={t.common.child}>
                <Input id="e-child" name="child" defaultValue={client.child} className={inputClass} />
              </Field>
              <Field id="e-sexe" label="Sexe">
                <Select value={sexe || undefined} onValueChange={(v) => setSexe(v as Client["sexe"])}>
                  <SelectTrigger id="e-sexe" className={selectTriggerClass}>
                    <SelectValue placeholder=" " />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="Garçon">Garçon</SelectItem>
                    <SelectItem value="Fille">Fille</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-dob" label={f.birthDate}>
                <Input id="e-dob" name="dob" defaultValue={client.dob} className={inputClass} />
              </Field>
              <Field id="e-niveau" label={f.level}>
                <Input id="e-niveau" name="niveau" defaultValue={client.niveau} className={inputClass} />
              </Field>
              <Field id="e-inscription" label="Date d'inscription">
                <Input id="e-inscription" name="dateInscription" defaultValue={client.dateInscription} className={inputClass} />
              </Field>
              <Field id="e-pere" label={f.fatherName}>
                <Input id="e-pere" name="pere" defaultValue={client.pere} className={inputClass} />
              </Field>
              <Field id="e-mere" label={f.motherName}>
                <Input id="e-mere" name="mere" defaultValue={client.mere} className={inputClass} />
              </Field>
              <Field id="e-cin" label={f.cinPassport}>
                <Input id="e-cin" name="cin" defaultValue={client.cin} className={inputClass} />
              </Field>
              <Field id="e-stade" label={f.crmStage}>
                <Select value={stade} onValueChange={(v) => setStade(v as StadeCrm)}>
                  <SelectTrigger id="e-stade" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="nouveau">{t.status.nouveau}</SelectItem>
                    <SelectItem value="converti">{t.status.converti}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-email" label={f.email1}>
                <Input id="e-email" name="email" type="email" defaultValue={client.email} className={inputClass} />
              </Field>
              <Field id="e-email2" label={f.email2}>
                <Input id="e-email2" name="email2" type="email" defaultValue={client.email2} className={inputClass} />
              </Field>
              <Field id="e-phone" label={f.phone1}>
                <Input id="e-phone" name="phone" type="tel" defaultValue={client.phone} className={inputClass} />
              </Field>
              <Field id="e-tel2" label={f.phone2}>
                <Input id="e-tel2" name="tel2" type="tel" defaultValue={client.tel2} className={inputClass} />
              </Field>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="e-adresse" className={labelClass}>
                  Adresse
                </Label>
                <Input id="e-adresse" name="adresse" defaultValue={client.adresse} className={inputClass} />
              </div>
              <Field id="e-urg-nom" label="Contact d'urgence">
                <Input id="e-urg-nom" name="urgenceNom" defaultValue={client.urgenceNom} className={inputClass} />
              </Field>
              <Field id="e-urg-tel" label="Téléphone d'urgence">
                <Input id="e-urg-tel" name="urgenceTel" defaultValue={client.urgenceTel} className={inputClass} />
              </Field>
              <Field id="e-sang" label="Groupe sanguin">
                <Input id="e-sang" name="groupeSanguin" defaultValue={client.groupeSanguin} className={inputClass} />
              </Field>
              <Field id="e-allergies" label="Allergies">
                <Input id="e-allergies" name="allergies" defaultValue={client.allergies} className={inputClass} />
              </Field>
              <Field id="e-transport" label="Transport scolaire">
                <Select value={transport} onValueChange={(v) => setTransport(v as Client["transport"])}>
                  <SelectTrigger id="e-transport" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="Oui">Oui</SelectItem>
                    <SelectItem value="Non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-cantine" label="Cantine">
                <Select value={cantine} onValueChange={(v) => setCantine(v as Client["cantine"])}>
                  <SelectTrigger id="e-cantine" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="Oui">Oui</SelectItem>
                    <SelectItem value="Non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-mensuel" label={f.monthlyFeesMad}>
                <Input id="e-mensuel" name="mensuel" type="number" min={0} defaultValue={client.mensuel} className={inputClass} />
              </Field>
              <Field id="e-dette" label="Dette (MAD)">
                <Input id="e-dette" name="dette" type="number" min={0} defaultValue={client.dette} className={inputClass} />
              </Field>
              <Field id="e-jour" label={f.paymentDay}>
                <Input id="e-jour" name="jour" type="number" min={1} max={31} defaultValue={client.jourPaiement ?? 1} className={inputClass} />
              </Field>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#28396C]/10 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" className={cn(primaryPill, "px-5 py-2")}>
                {t.common.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
