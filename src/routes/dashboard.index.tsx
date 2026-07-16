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
import {
  ResponsiveContainer,
  BarChart,
  AreaChart,
  Area,
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
import { AddClientDialog, emptyWizard, type WizardData } from "@/components/add-client-wizard";
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

type Range = "1S" | "1M" | "3M" | "1A";
const RANGE_LABEL: Record<Range, string> = { "1S": "1 semaine", "1M": "1 mois", "3M": "3 mois", "1A": "1 an" };
const RANGE_MONTHS: Record<Range, number> = { "1S": 1, "1M": 1, "3M": 3, "1A": 12 };
const rangeButtons: Range[] = ["1S", "1M", "3M", "1A"];

const PENDING_COLOR = "#E8A13C";
const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
type SeriesKey = "encaisse" | "en_attente" | "retard" | "attente";

const SERIES_META: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "encaisse", label: "Encaissé", color: "#28396C" },
  { key: "en_attente", label: "En attente", color: STATUS_COLORS.en_attente },
  { key: "retard", label: "En retard", color: STATUS_COLORS.retard },
  { key: "attente", label: "En attente (total)", color: PENDING_COLOR },
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
const daysOverdue = (paymentDay?: number): number => {
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
  const [relanceIds, setRelanceIds] = useState<string[]>([]);
  const [relanceExpanded, setRelanceExpanded] = useState(false);
  const [relancePeriode, setRelancePeriode] = useState("Mai 2026 — frais mensuels");
  const [range, setRange] = useState<Range>("1A");
  const [grain, setGrain] = useState<Grain>("mensuel");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // Which money series are drawn. Clicking a legend chip toggles one on/off.
  const [series, setSeries] = useState<Record<SeriesKey, boolean>>({
    encaisse: true,
    en_attente: true,
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
    () => (barData as InvoicePoint[]).map((p) => ({ ...p, attente: p.en_attente + p.retard })),
    [barData],
  );

  /** 1S/1M/3M/1A now actually cut the window: last N months of the year's series. */
  const areaData = useMemo(() => {
    const months = monthlyData as InvoicePoint[];
    const take = RANGE_MONTHS[range];
    const thisYear = String(new Date().getFullYear()) === year;
    // Anchor the window on the current month when looking at the current year.
    const end = thisYear ? new Date().getMonth() + 1 : months.length;
    const start = Math.max(0, end - take);
    return months.slice(start, end);
  }, [monthlyData, range, year]);

  const rangeTotal = useMemo(
    () => areaData.reduce((sum, p) => sum + (p.encaisse ?? 0), 0),
    [areaData],
  );

  // Count payment statuses
  const statusCounts = useMemo(() => {
    const c = { paye: 0, en_attente: 0, retard: 0 };
    (clients as any[]).forEach((cl: any) => {
      if (cl.payment_status === "paye") c.paye++;
      else if (cl.payment_status === "retard") c.retard++;
      else if (cl.payment_status === "en_attente") c.en_attente++;
    });
    return c;
  }, [clients]);

  // Familles en attente de paiement (impayé + en retard), triées du plus ancien
  // retard au plus récent   c'est la file de relance affichée sous les paiements.
  const pendingDues = useMemo(() => {
    return (clients as any[])
      .filter((c: any) => c.payment_status === "en_attente" || c.payment_status === "retard")
      .map((c: any) => {
        const net = Math.round((c.monthly_fee ?? 0) * (1 - (c.remise ?? 0) / 100));
        return {
          id: c.id as string,
          name: (c.parent_name || c.child_name || "") as string,
          level: (c.level || "") as string,
          status: c.payment_status as "en_attente" | "retard",
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
  const attenteTotal = (outstanding?.enAttenteTotal ?? 0) + (outstanding?.retardTotal ?? 0);
  const attenteCount = (outstanding?.enAttenteCount ?? 0) + (outstanding?.retardCount ?? 0);

  // Relance rapide: pick who gets the reminder instead of blasting every overdue
  // client. Empty selection keeps the old behaviour (all overdue clients).
  const relanceCandidates = useMemo(
    () => (clients as any[]).filter((c: any) => c.payment_status !== "paye"),
    [clients],
  );
  const relanceShown = relanceExpanded ? relanceCandidates : relanceCandidates.slice(0, 4);
  const toggleRelance = (id: string) =>
    setRelanceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const relanceMutation = useMutation({
    mutationFn: async () => {
      const content = relancePeriode.trim()
        ? `Rappel de paiement — ${relancePeriode.trim()}`
        : "Rappel de paiement";

      // No selection => previous behaviour: every overdue client.
      if (relanceIds.length === 0) {
        return sendBroadcast({ data: { content, filterOverdue: true } });
      }

      // Sequential, not Promise.all: WAHA drives one WhatsApp session, and
      // parallel bursts are exactly the pattern that gets numbers banned.
      let success = 0;
      const errors: string[] = [];
      for (const clientId of relanceIds) {
        const res = await sendClientMessage({ data: { clientId, content } });
        if (res.ok) success += 1;
        else errors.push(res.error ?? "échec");
      }
      return { ok: true, success, failed: relanceIds.length - success, errors };
    },
    onSuccess: (res: any) => {
      if (res.success === 0) {
        toast.error(res.errors?.[0] ?? "Aucun rappel envoyé");
      } else {
        toast.success(
          `Rappel envoyé à ${res.success} client${res.success > 1 ? "s" : ""}` +
            (res.failed ? ` (${res.failed} échec${res.failed > 1 ? "s" : ""})` : ""),
        );
      }
      setRelanceIds([]);
      queryClient.invalidateQueries({ queryKey: ["message-history"] });
    },
    onError: (e: Error) => toast.error(e.message),
  } as const);

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

  // Last 4 payments
  const lastPayments = useMemo(() => {
    return dbPayments.slice(0, 4).map((p) => ({
      who: p.clients?.parent_name ?? "",
      note: `Frais mensuels · ${p.clients?.child_name ?? ""}`,
      date: p.date || " ",
      amount: String(p.amount),
      status: (p.clients?.payment_status ?? "en_attente") as "paye" | "en_attente" | "retard",
    }));
  }, [dbPayments]);

  // 4 indicateurs
  const totalClients = (clients as any[]).length;
  const paidCount = statusCounts.paye;
  const overdueCount = statusCounts.retard;
  const unpaidCount = statusCounts.en_attente;
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
    },
    {
      k: "04",
      label: "En attente",
      value: String(unpaidCount),
      sub: "facture en attente",
      accent: STATUS_COLORS.en_attente,
      tint: "rgba(232,161,60,0.14)",
      icon: AlertCircle,
      to: "/dashboard/familles",
      search: { statut: "en_attente" },
      // Analyse express : montant total en attente de recouvrement.
      extra: `${pendingDues.length} famille(s) en attente`,
    },
  ] as const;

const queryClient = useQueryClient();

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
                    <SelectItem value="annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
                {/* In annual mode every year is already on screen, so the year picker is moot. */}
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
                  {/* Width fits 4-digit MAD ticks   a tighter axis clips the leading digit.*/}
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
                {grain === "mensuel" ? `Par mois · ${year}` : "Par année"} · MAD
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
                  search={{ statut: "en_attente" }}
                  className="block px-5 py-5 transition-colors hover:bg-[#F4E3C0]/40 sm:px-6"
                >
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS.en_attente }} />
                    En attente
                    <ArrowRight className="ml-auto h-3.5 w-3.5" />
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-foreground">
                    {(outstanding?.enAttenteTotal ?? 0).toLocaleString("fr-FR")} MAD
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {outstanding?.enAttenteCount ?? 0} facture(s) en attente
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

      {/* Encaissements mensuels   courbe d'activité avec plages 1S / 1M / 3M / 1A */}
      <div className={cn(softCard, "min-w-0 p-5 sm:p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Mon activité</p>
            <h2 className="mt-1 font-display text-xl text-foreground">
              Encaissements <span className="font-normal italic text-muted-foreground">mensuels</span>
            </h2>
              <div className="mt-2 flex items-end gap-2">
                <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  {rangeTotal.toLocaleString("fr-FR")} <span className="text-sm font-normal text-muted-foreground">MAD</span>
                </p>
                <span className="pb-1 text-xs text-muted-foreground">encaissé sur {range}</span>
              </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#28396C]/10 bg-muted/60 p-1">
            {rangeButtons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  range === r ? "bg-[#28396C] text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                {SERIES_META.map((s) => (
                  <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(40,57,108,0.10)" vertical={false} />
              <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v: number) => v.toLocaleString("fr-FR")}
              />
              <Tooltip
                contentStyle={dashTooltip}
                cursor={{ stroke: "rgba(40,57,108,0.25)", strokeWidth: 1 }}
                formatter={(v: number, n) => [`${Number(v).toLocaleString("fr-FR")} MAD`, n]}
              />
              {/* `linear` keeps the angular, ticker-like profile of the reference   `monotone` rounds it off. */}
              {SERIES_META.filter((s) => series[s.key]).map((s) => (
                <Area
                  key={s.key}
                  type="linear"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#fill-${s.key})`}
                  dot={false}
                  activeDot={{ r: 4, fill: s.color, stroke: "#fff", strokeWidth: 2 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activité récente + relance rapide + actions rapides */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:items-start">
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
                  {p.status === "paye" ? "Payé" : p.status === "retard" ? "En retard" : "En attente"}
                </span>
              </li>
            ))}
          </ul>
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
                {relanceCandidates.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setRelanceExpanded((v) => !v)}
                    title={relanceExpanded ? "Afficher moins" : `Afficher les ${relanceCandidates.length} clients`}
                    aria-expanded={relanceExpanded}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dashed border-white/40 text-white/80 transition hover:border-white/80 hover:text-white"
                  >
                    <Plus className={cn("h-4 w-4 transition-transform", relanceExpanded && "rotate-45")} />
                  </button>
                )}
                {relanceShown.map((c: any) => {
                  const selected = relanceIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleRelance(c.id)}
                      title={`${c.parent_name}${selected ? " — sélectionné" : ""}`}
                      aria-pressed={selected}
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-bold transition",
                        selected
                          ? "bg-white text-[#28396C] ring-2 ring-[#B5E18B] ring-offset-2 ring-offset-[#28396C]"
                          : "bg-[#B5E18B] text-[#28396C] ring-2 ring-[#28396C] opacity-70 hover:opacity-100",
                      )}
                    >
                      {initials(c.parent_name)}
                    </button>
                  );
                })}
                {relanceCandidates.length === 0 && (
                  <p className="text-xs text-white/60">Aucun client à relancer.</p>
                )}
              </div>
              <p className="mt-3 text-[11px] text-white/70">
                {relanceIds.length > 0
                  ? `${relanceIds.length} client${relanceIds.length > 1 ? "s" : ""} sélectionné${relanceIds.length > 1 ? "s" : ""}`
                  : "Cliquez sur un parent pour le relancer, ou envoyez à tous les retards."}
              </p>
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
                  value={relancePeriode}
                  onChange={(e) => setRelancePeriode(e.target.value)}
                  className={cn(softInput, "mt-1.5")}
                />
              </div>
              <button
                type="submit"
                disabled={relanceMutation.isPending || relanceCandidates.length === 0}
                className={cn(primaryPill, "w-full justify-center")}
              >
                <Send className="h-4 w-4" />
                {relanceMutation.isPending
                  ? "Envoi..."
                  : relanceIds.length > 0
                    ? `Envoyer à ${relanceIds.length} sélectionné${relanceIds.length > 1 ? "s" : ""}`
                    : "Envoyer à tous les retards"}
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
