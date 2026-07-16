import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/server-dashboard";
import { listPayments } from "@/lib/server-payments";
import { listClients } from "@/lib/server-clients";
import { sendBroadcast, sendClientMessage } from "@/lib/server-whatsapp";
import {
  getInvoiceAnalytics,
  getOutstanding,
  listInvoiceYears,
  type InvoicePoint,
} from "@/lib/server-invoices";
import { toast } from "sonner";
import {
  Users,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Calendar,
  Send,
  Clock,
} from "lucide-react";
import { AddClientDialog, emptyWizard, type WizardData } from "@/components/add-client-wizard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
  softCardHover,
  softInput,
  softSelectTrigger,
  softSelectContent,
  dialogSurface,
  dashTooltip,
  labelClass,
  eyebrowClass,
  primaryPill,
  STATUS_COLORS,
  statusPill,
  initials,
} from "@/lib/dash-ui";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Tableau de bord   CRM" }] }),
  component: CrmDash,
});

// ──────────────────────────────────────────────────────────
// Données démo   statistique générale (encaissé en k MAD + nb de paiements)
// ──────────────────────────────────────────────────────────
type Grain = "mensuel" | "trimestriel" | "annuel";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
type SeriesKey = "encaisse" | "impaye" | "retard" | "attente";

/** Tone already used for "en attente" pills across the dashboard (on #F4E3C0). */
const PENDING_COLOR = "#8A5A16";

const SERIES_META: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "encaisse", label: "Encaissé", color: "#28396C" },
  { key: "impaye", label: "Impayé", color: STATUS_COLORS.impaye },
  { key: "retard", label: "En retard", color: STATUS_COLORS.retard },
  // "En attente" is impayé + retard, so it deliberately overlaps the two series
  // above: it reads as the single "left to collect" column next to Encaissé.
  { key: "attente", label: "En attente", color: PENDING_COLOR },
];

type QuickAction =
  | { kind: "link"; to: string; title: string; desc: string; icon: typeof Users }
  | { kind: "add-client"; title: string; desc: string; icon: typeof Plus };

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

/** Jours de retard depuis l'échéance du mois courant (borne à 0, jour ≤ 28). */
function daysOverdue(paymentDay?: number): number {
  const now = new Date();
  const day = Math.min(Math.max(Number(paymentDay) || 1, 1), 28);
  const due = new Date(now.getFullYear(), now.getMonth(), day);
  const diff = Math.floor((now.getTime() - due.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

function CrmDash() {
  const { t } = useDashboardI18n();
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [wizard, setWizard] = useState<WizardData>(emptyWizard);
  const updateWizard = (patch: Partial<WizardData>) => setWizard((prev) => ({ ...prev, ...patch }));
  const [grain, setGrain] = useState<Grain>("mensuel");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // Which money series are drawn. Clicking a legend chip toggles one on/off.
  const [series, setSeries] = useState<Record<SeriesKey, boolean>>({
    encaisse: true,
    impaye: true,
    retard: true,
    attente: true,
  });
  const toggleSeries = (k: SeriesKey) =>
    setSeries((s) => {
      const next = { ...s, [k]: !s[k] };
      // Never leave the chart empty.
      return Object.values(next).some(Boolean) ? next : s;
    });

  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: listPayments });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: years = [] } = useQuery({ queryKey: ["invoice-years"], queryFn: listInvoiceYears });
  const { data: outstanding } = useQuery({ queryKey: ["outstanding"], queryFn: getOutstanding });

  // The bar series comes straight off the invoices ledger, so impayé/retard are
  // recorded facts (what was owed, and whether the due date passed), not guesses.
  const { data: barData = [] } = useQuery({
    queryKey: ["invoice-analytics", grain, year],
    queryFn: () => getInvoiceAnalytics({ data: { grain, year } }),
  });
  // The activity card is always monthly, whatever the bar granularity is.
  const { data: monthlyData = [] } = useQuery({
    queryKey: ["invoice-analytics", "mensuel", year],
    queryFn: () => getInvoiceAnalytics({ data: { grain: "mensuel", year } }),
  });

  const dbPayments = payments as unknown as Array<{ id: string; amount: number; date: string; mode: string; period: string; invoice_sent: boolean; clients: { parent_name: string; child_name: string; phone: string; email: string; level: string; monthly_fee: number; payment_status: string; subscribed_services: string[] } }>;
  // "En attente" is what the bucket still owes: the unpaid amount whether or not
  // the due date has passed. Derived here rather than in the ledger query   it is
  // exactly impayé + retard, which getInvoiceAnalytics already returns.
  const chartData = useMemo(
    () => (barData as InvoicePoint[]).map((p) => ({ ...p, attente: p.impaye + p.retard })),
    [barData],
  );

  // Count payment statuses
  const statusCounts = useMemo(() => {
    const c = { paye: 0, impaye: 0, retard: 0 };
    (clients as any[]).forEach((cl: any) => {
      if (cl.payment_status === "paye") c.paye++;
      else if (cl.payment_status === "retard") c.retard++;
      else c.impaye++;
    });
    return c;
  }, [clients]);

  // Familles en attente de paiement (impayé + en retard), triées du plus ancien
  // retard au plus récent   c'est la file de relance affichée sous les paiements.
  const pendingDues = useMemo(() => {
    return (clients as any[])
      .filter((c: any) => c.payment_status === "impaye" || c.payment_status === "retard")
      .map((c: any) => {
        const net = Math.round((c.monthly_fee ?? 0) * (1 - (c.remise ?? 0) / 100));
        return {
          id: c.id as string,
          name: (c.parent_name || c.child_name || "") as string,
          level: (c.level || "") as string,
          status: c.payment_status as "impaye" | "retard",
          days: c.payment_status === "retard" ? daysOverdue(c.payment_day) : 0,
          amount: (c.debt ?? 0) > 0 ? (c.debt as number) : net,
        };
      })
      .sort((a, b) => b.days - a.days || b.amount - a.amount);
  }, [clients]);

  const pendingTotal = useMemo(
    () => pendingDues.reduce((s, d) => s + d.amount, 0),
    [pendingDues],
  );

  // The "En attente" KPI reads off the invoices ledger, like the Impayé / En retard
  // rows it sits under, so the column sums consistently   and matches the chart's
  // "En attente" bars, which come from the same query.
  const attenteTotal = (outstanding?.impayeTotal ?? 0) + (outstanding?.retardTotal ?? 0);
  const attenteCount = (outstanding?.impayeCount ?? 0) + (outstanding?.retardCount ?? 0);

  // Last 4 payments
  const lastPayments = useMemo(() => {
    return dbPayments.slice(0, 4).map((p) => ({
      who: p.clients?.parent_name ?? "",
      note: `Frais mensuels · ${p.clients?.child_name ?? ""}`,
      date: p.date || " ",
      amount: String(p.amount),
      status: (p.clients?.payment_status ?? "impaye") as "paye" | "impaye" | "retard",
    }));
  }, [dbPayments]);

  // 4 indicateurs
  const totalClients = (clients as any[]).length;
  const paidCount = statusCounts.paye;
  const overdueCount = statusCounts.retard;
  const unpaidCount = statusCounts.impaye;
  const totalRevenue = stats?.total_revenue ?? 0;

  // Each card opens the client list already filtered to the status it counts,
  // rather than dropping you on an unfiltered page.
  const metrics = [
    {
      k: "01",
      label: "Total de familles à l'école",
      value: String(totalClients),
      sub: "familles inscrites",
      accent: "#28396C",
      tint: "rgba(40,57,108,0.10)",
      icon: Users,
      to: "/dashboard/familles",
      search: {},
      extra: null as string | null,
    },
    {
      k: "02",
      label: "Payé",
      value: String(paidCount),
      sub: "paiements du mois reçus",
      accent: STATUS_COLORS.paye,
      tint: "rgba(107,165,58,0.14)",
      icon: CreditCard,
      to: "/dashboard/familles",
      search: { statut: "paye" },
      extra: null as string | null,
    },
    {
      k: "03",
      label: "En retard",
      value: String(overdueCount),
      sub: "relance recommandée",
      accent: STATUS_COLORS.retard,
      tint: "rgba(226,92,92,0.12)",
      icon: Clock,
      to: "/dashboard/familles",
      search: { statut: "retard" },
      extra: null as string | null,
    },
    {
      k: "04",
      label: "Impayé",
      value: String(unpaidCount),
      sub: "facture en attente",
      accent: STATUS_COLORS.impaye,
      tint: "rgba(232,161,60,0.14)",
      icon: AlertCircle,
      to: "/dashboard/familles",
      search: { statut: "impaye" },
      // Analyse express : montant total en attente de recouvrement.
      extra: `${(outstanding?.impayeTotal ?? 0).toLocaleString("fr-FR")} MAD en attente`,
    },
  ] as const;

  const queryClient = useQueryClient();

  const relanceMutation = useMutation({
    mutationFn: () => sendBroadcast({ data: { content: "Rappel de paiement", filterOverdue: true } }),
    onSuccess: (res) => {
      toast.success(`Rappel envoyé à ${res.success} clients`);
      queryClient.invalidateQueries({ queryKey: ["message-history"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Relance individuelle depuis la file "Paiements en attente".
  const remindMutation = useMutation({
    mutationFn: (clientId: string) =>
      sendClientMessage({ data: { clientId, content: "Rappel de paiement" } }),
    onSuccess: () => {
      toast.success("Rappel envoyé");
      queryClient.invalidateQueries({ queryKey: ["message-history"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const quickActions: QuickAction[] = [
    {
      kind: "link",
      to: "/dashboard/familles",
      title: t.home.quickActions.manageClients.title,
      desc: t.home.quickActions.manageClients.desc,
      icon: Users,
    },
    {
      kind: "link",
      to: "/dashboard/paiements",
      title: t.home.quickActions.lateClients.title,
      desc: t.home.quickActions.lateClients.desc,
      icon: Clock,
    },
    {
      kind: "add-client",
      title: t.home.quickActions.addClient.title,
      desc: t.home.quickActions.addClient.desc,
      icon: Plus,
    },
  ];


  return (
    <div className="space-y-5 sm:space-y-6">
      <AddClientDialog
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        wizard={wizard}
        updateWizard={updateWizard}
        setWizard={setWizard}
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{t.home.eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-foreground md:text-[2.35rem]">
            <span className="font-semibold">{t.home.titleBold}</span>{" "}
            <span className="font-normal italic text-muted-foreground">{t.home.titleItalic}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.home.subtitle}</p>
        </div>
        <button type="button" onClick={() => setAddClientOpen(true)} className={cn(primaryPill, "shrink-0")}>
          <Plus className="h-4 w-4" />
          {t.home.quickActions.addClient.title}
        </button>
      </header>

      {/* 4 cartes indicateurs   total / payé / en retard / impayé */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((card) => (
          <Link
            key={card.k}
            to={card.to}
            search={card.search}
            aria-label={interpolate(t.home.cardOpenAria, { label: card.label, value: card.value })}
            className={cn(softCardHover, "relative block overflow-hidden p-5 text-left text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl"
                style={{ backgroundColor: card.tint, color: card.accent }}
              >
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            {card.extra ? (
              <p
                className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                style={{ backgroundColor: card.tint, color: card.accent }}
              >
                {card.extra}
              </p>
            ) : null}
            <span className="mt-3 block h-1 w-10 rounded-full" style={{ backgroundColor: card.accent }} />
          </Link>
        ))}
      </div>

      {/* Statistique générale   barres (encaissé) + courbe (paiements reçus) et colonne d'indicateurs */}
      <div className={cn(softCard, "overflow-hidden")}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem]">
          {/* Graphique */}
          <div className="min-w-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={eyebrowClass}>Vue d'ensemble</p>
                <h2 className="mt-1 font-display text-2xl text-foreground">
                  Statistique <span className="font-normal italic text-muted-foreground">générale</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Select value={grain} onValueChange={(v) => setGrain(v as Grain)}>
                  <SelectTrigger className={cn(softSelectTrigger, "h-9 w-[7.5rem] rounded-xl")} aria-label="Granularité">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="trimestriel">3 mois</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
                {/* Only monthly is scoped to a year; "3 mois" is the last 3 months from today and annual shows every year. */}
                {grain === "mensuel" ? (
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className={cn(softSelectTrigger, "h-9 w-[6.5rem] rounded-xl")} aria-label="Année">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={softSelectContent}>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </div>

            <div className="mt-6 h-[20rem] w-full min-w-0 sm:h-[24rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(40,57,108,0.08)" vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  {/* Width fits 4-digit MAD ticks   a tighter axis clips the leading digit. */}
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v: number) => v.toLocaleString("fr-FR")}
                  />
                  <Tooltip
                    contentStyle={dashTooltip}
                    cursor={{ fill: "rgba(181,225,139,0.16)" }}
                    formatter={(v: number, n) => [`${Number(v).toLocaleString("fr-FR")} MAD`, n]}
                  />
                  {/* Thin fully-rounded columns   the bar-forward shape from the reference. */}
                  {SERIES_META.filter((s) => series[s.key]).map((s) => (
                    <Bar
                      key={s.key}
                      dataKey={s.key}
                      name={s.label}
                      fill={s.color}
                      radius={[999, 999, 999, 999]}
                      maxBarSize={12}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clickable legend: each chip toggles its series on the chart. */}
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              {SERIES_META.map((s) => {
                const on = series[s.key];
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => toggleSeries(s.key)}
                      aria-pressed={on}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        on
                          ? "border-[#28396C]/15 bg-card text-foreground shadow-sm"
                          : "border-transparent bg-muted/60 text-muted-foreground/70 hover:text-foreground",
                      )}
                    >
                      <span
                        className="h-3 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: on ? s.color : "currentColor" }}
                        aria-hidden
                      />
                      {s.label}
                    </button>
                  </li>
                );
              })}
              <li className="ml-1 text-xs text-muted-foreground">
                {grain === "mensuel"
                  ? `Par mois · ${year}`
                  : grain === "trimestriel"
                    ? "3 derniers mois"
                    : "Par année"}{" "}
                · MAD
              </li>
            </ul>
          </div>

          {/* Colonne d'indicateurs   impayé / retard sont cliquables : ils ouvrent la liste filtrée. */}
          <div className="border-t border-[#28396C]/10 lg:border-l lg:border-t-0">
            <ul className="divide-y divide-[#28396C]/10">
              <li className="px-5 py-5 sm:px-6">
                <p className="text-xs text-muted-foreground">Total encaissé</p>
                <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} MAD
                </p>
              </li>
              <li className="px-5 py-5 sm:px-6">
                <p className="text-xs text-muted-foreground">Encaissé ce mois</p>
                <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {(stats?.paid_this_month ?? 0).toLocaleString("fr-FR")} MAD
                </p>
              </li>

              <li>
                <Link
                  to="/dashboard/familles"
                  search={{ statut: "impaye" }}
                  className="block px-5 py-5 transition-colors hover:bg-[#F4E3C0]/40 sm:px-6"
                >
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS.impaye }} />
                    Impayé
                    <ArrowRight className="ml-auto h-3.5 w-3.5" />
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                    {(outstanding?.impayeTotal ?? 0).toLocaleString("fr-FR")} MAD
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {outstanding?.impayeCount ?? 0} facture(s) en attente
                  </p>
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard/familles"
                  search={{ statut: "retard" }}
                  className="block px-5 py-5 transition-colors hover:bg-[#F6D8D8]/40 sm:px-6"
                >
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS.retard }} />
                    En retard
                    <ArrowRight className="ml-auto h-3.5 w-3.5" />
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                    {(outstanding?.retardTotal ?? 0).toLocaleString("fr-FR")} MAD
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {outstanding?.retardCount ?? 0} facture(s) en retard
                  </p>
                </Link>
              </li>

              <li className="px-5 py-5 sm:px-6">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PENDING_COLOR }} />
                  En attente
                </p>
                <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {attenteTotal.toLocaleString("fr-FR")} MAD
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {attenteCount} facture(s) à recouvrer
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Activité récente + relance rapide + actions rapides */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:items-start">
        {/* Colonne principale : activité récente + créances en attente à relancer */}
        <div className="space-y-5">
        {/* Derniers paiements (Activité récente) */}
        <div className={cn(softCard, "p-5 sm:p-6")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Activité récente</p>
              <h2 className="mt-1 font-display text-xl text-foreground">Derniers paiements</h2>
            </div>
            <Link
              to="/dashboard/paiements"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[#28396C] transition hover:bg-[#B5E18B]/15"
            >
              Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-[#28396C]/8">
            {lastPayments.map((p) => (
              <li key={p.who + p.note} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#28396C]/8 text-xs font-bold text-[#28396C]">
                  {initials(p.who)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{p.who}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.note}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{p.amount} MAD</p>
                  <p className="text-[11px] text-muted-foreground">{p.date}</p>
                </div>
                <span className={statusPill(p.status)}>
                  {p.status === "paye" ? "Payé" : p.status === "retard" ? "En retard" : "Impayé"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Paiements en attente   file de relance : uniquement impayés et retards. */}
        <div className={cn(softCard, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28396C]/10 px-5 py-4 sm:px-6">
            <div>
              <p className={eyebrowClass}>Créances</p>
              <h2 className="mt-1 font-display text-xl text-foreground">Paiements en attente</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Familles impayées ou en retard à relancer</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#F4E3C0] px-3 py-1 text-xs font-semibold text-[#8A5A16]">
                {pendingDues.length} famille{pendingDues.length > 1 ? "s" : ""}
              </span>
              {pendingTotal > 0 ? (
                <span className="rounded-full bg-[#28396C]/8 px-3 py-1 text-xs font-semibold tabular-nums text-[#28396C]">
                  {pendingTotal.toLocaleString("fr-FR")} MAD
                </span>
              ) : null}
            </div>
          </div>
          {pendingDues.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Aucun paiement en attente. Tout est à jour.
            </p>
          ) : (
            <ul className="divide-y divide-[#28396C]/8">
              {pendingDues.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#28396C]/8 text-xs font-bold text-[#28396C]">
                    {initials(d.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{d.name}</p>
                      {d.status === "retard" && d.days > 0 ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            d.days > 14 ? "bg-[#F6D8D8] text-[#9A2F2F]" : "bg-[#F4E3C0] text-[#8A5A16]",
                          )}
                        >
                          {d.days}j de retard
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-[#F4E3C0] px-2 py-0.5 text-[10px] font-semibold text-[#8A5A16]">
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{d.level || "Niveau non défini"}</p>
                  </div>
                  <p className="hidden shrink-0 text-right text-sm font-semibold tabular-nums text-foreground sm:block">
                    {d.amount.toLocaleString("fr-FR")} MAD
                  </p>
                  <button
                    type="button"
                    onClick={() => remindMutation.mutate(d.id)}
                    disabled={remindMutation.isPending}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[#28396C] transition hover:bg-[#B5E18B]/15 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" /> Relancer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>

        {/* Colonne latérale   relance rapide + actions rapides */}
        <div className="space-y-5">
          {/* Relance rapide */}
          <div className={cn(softCard, "overflow-hidden")}>
            <div className="bg-[#28396C] p-5 text-white">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B5E18B]">Relance rapide</p>
                <Link to="/dashboard/familles" className="text-[11px] font-medium text-white/70 hover:text-white">
                  Voir tout
                </Link>
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold">Rappel de paiement</h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dashed border-white/40 text-white/80">
                  <Plus className="h-4 w-4" />
                </span>
                {(clients as any[]).filter((c: any) => c.payment_status !== "paye").slice(0, 4).map((c: any) => c.parent_name).map((name: string) => (
                  <span
                    key={name}
                    title={name}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#B5E18B] text-xs font-bold text-[#28396C] ring-2 ring-[#28396C]"
                  >
                    {initials(name)}
                  </span>
                ))}
              </div>
            </div>
            <form
              className="space-y-3 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                relanceMutation.mutate();
              }}
            >
              <div>
                <Label htmlFor="relance-periode" className={labelClass}>
                  Période concernée
                </Label>
                <Input
                  id="relance-periode"
                  defaultValue="Mai 2026   frais mensuels"
                  className={cn(softInput, "mt-1.5")}
                />
              </div>
              <button type="submit" disabled={relanceMutation.isPending} className={cn(primaryPill, "w-full justify-center")}>
                <Send className="h-4 w-4" />
                {relanceMutation.isPending ? "Envoi..." : "Envoyer le rappel"}
              </button>
            </form>
          </div>

          {/* Actions rapides */}
          <div className={cn(softCard, "p-5 sm:p-6")}>
            <p className={eyebrowClass}>{t.home.quickActionsEyebrow}</p>
            <h3 className="mt-1 font-display text-lg text-foreground">{t.home.quickNavBold}</h3>
            <ul className="mt-3 space-y-1.5">
              {quickActions.map((a) => {
                const QIcon = a.icon;
                const inner = (
                  <>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#B5E18B]/25 text-[#28396C]">
                      <QIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{a.title}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{a.desc}</span>
                    </span>
                  </>
                );
                const rowClass =
                  "group flex w-full items-start gap-3 rounded-2xl border border-transparent p-2.5 text-left transition hover:border-[#28396C]/10 hover:bg-[#B5E18B]/10";
                if (a.kind === "add-client") {
                  return (
                    <li key={a.title}>
                      <button type="button" onClick={() => setAddClientOpen(true)} className={rowClass}>
                        {inner}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={a.title}>
                    <Link to={a.to} className={rowClass}>
                      {inner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
