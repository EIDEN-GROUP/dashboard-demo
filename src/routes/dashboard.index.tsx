import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardStats, getMonthlyRevenue } from "@/lib/server-dashboard";
import { listPayments } from "@/lib/server-payments";
import { listClients } from "@/lib/server-clients";
import { sendBroadcast } from "@/lib/server-whatsapp";
import { toast } from "sonner";
import {
  Users,
  CreditCard,
  AlertCircle,
  Plus,
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
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
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
type Grain = "annee" | "semestre";

type StatPoint = { mois: string; encaisse: number; paiements: number };

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
// Encaissements mensuels   série d'activité par plage (MAD, en milliers)
type Range = "1S" | "1M" | "3M" | "1A";

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

function NouveauClientModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const m = t.home.addClientModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          dialogSurface,
          "max-h-[min(90vh,860px)] w-[min(100vw-1.5rem,640px)] max-w-[min(100vw-1.5rem,640px)] translate-y-[-50%] sm:max-w-[640px]",
        )}
      >
        <DialogDescription className="sr-only">{m.srDesc}</DialogDescription>
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{m.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
              {m.title}
            </DialogTitle>
          </div>
          <form
            className="max-h-[calc(90vh-12rem)] overflow-y-auto px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="crm-eleve" label={f.studentName}>
                <Input id="crm-eleve" name="eleve" autoComplete="name" className={softInput} />
              </Field>
              <Field id="crm-dob" label={f.birthDate}>
                <div className="relative">
                  <Input
                    id="crm-dob"
                    name="naissance"
                    placeholder={f.birthDatePlaceholder}
                    className={cn(softInput, "pr-10")}
                  />
                  <Calendar
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                    aria-hidden
                  />
                </div>
              </Field>
              <Field id="crm-pere" label={f.fatherName}>
                <Input id="crm-pere" name="pere" autoComplete="additional-name" className={softInput} />
              </Field>
              <Field id="crm-mere" label={f.motherName}>
                <Input id="crm-mere" name="mere" autoComplete="additional-name" className={softInput} />
              </Field>
              <Field id="crm-cin" label={f.cinPassport}>
                <Input id="crm-cin" name="cin" className={softInput} />
              </Field>
              <Field id="crm-niveau" label={f.level}>
                <Select name="niveau">
                  <SelectTrigger id="crm-niveau" className={softSelectTrigger}>
                    <SelectValue placeholder={t.common.selectLevel} />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="ps">{f.levels.ps}</SelectItem>
                    <SelectItem value="ms">{f.levels.ms}</SelectItem>
                    <SelectItem value="gs">{f.levels.gs}</SelectItem>
                    <SelectItem value="cp">{f.levels.cp}</SelectItem>
                    <SelectItem value="ce1">{f.levels.ce1}</SelectItem>
                    <SelectItem value="ce2">{f.levels.ce2}</SelectItem>
                    <SelectItem value="cm1">{f.levels.cm1}</SelectItem>
                    <SelectItem value="cm2">{f.levels.cm2}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="crm-email1" label={f.email1}>
                <Input id="crm-email1" name="email1" type="email" autoComplete="email" className={softInput} />
              </Field>
              <Field id="crm-email2" label={f.email2}>
                <Input id="crm-email2" name="email2" type="email" className={softInput} />
              </Field>
              <Field id="crm-tel1" label={f.phone1}>
                <Input id="crm-tel1" name="tel1" type="tel" autoComplete="tel" className={softInput} />
              </Field>
              <Field id="crm-tel2" label={f.phone2}>
                <Input id="crm-tel2" name="tel2" type="tel" className={softInput} />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#28396C]/10 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" className={cn(primaryPill, "px-5 py-2")}>
                {m.submit}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CrmDash() {
  const { t } = useDashboardI18n();
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [range, setRange] = useState<Range>("1A");
  const [grain, setGrain] = useState<Grain>("annee");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const { data: monthlyRevenue } = useQuery({ queryKey: ["monthly-revenue"], queryFn: getMonthlyRevenue });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: listPayments });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });

  const dbPayments = payments as unknown as Array<{ id: string; amount: number; date: string; mode: string; period: string; invoice_sent: boolean; clients: { parent_name: string; child_name: string; phone: string; email: string; level: string; monthly_fee: number; payment_status: string; subscribed_services: string[] } }>;
  const rangeButtons: Range[] = ["1S", "1M", "3M", "1A"];

  // Build chart data from real monthly revenue
  const chartData = useMemo(() => {
    const rev = (monthlyRevenue ?? []) as Array<{ m: string; v: number }>;
    return rev.map((r) => ({ mois: r.m, encaisse: Math.round(r.v / 1000), paiements: Math.round(r.v / 50) }));
  }, [monthlyRevenue]);

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
    },
    {
      k: "02",
      label: "Payé",
      value: String(paidCount),
      sub: "paiements du mois reçus",
      accent: STATUS_COLORS.paye,
      tint: "rgba(107,165,58,0.14)",
      icon: CreditCard,
      to: "/dashboard/paiements",
    },
    {
      k: "03",
      label: "En retard",
      value: String(overdueCount),
      sub: "relance recommandée",
      accent: STATUS_COLORS.retard,
      tint: "rgba(226,92,92,0.12)",
      icon: Clock,
      to: "/dashboard/paiements",
    },
    {
      k: "04",
      label: "Impayé",
      value: String(unpaidCount),
      sub: "facture en attente",
      accent: STATUS_COLORS.impaye,
      tint: "rgba(232,161,60,0.14)",
      icon: AlertCircle,
      to: "/dashboard/paiements",
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
      <NouveauClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />

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
                    <SelectItem value="annee">Année</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className={cn(softSelectTrigger, "h-9 w-[6.5rem] rounded-xl")} aria-label="Année">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 h-[20rem] w-full min-w-0 sm:h-[24rem]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(40,57,108,0.08)" vertical={false} />
                  <XAxis
                    dataKey="mois"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={dashTooltip}
                    cursor={{ fill: "rgba(181,225,139,0.16)" }}
                    formatter={(v: number, n) =>
                      n === "Encaissé" ? [`${v}k MAD`, n] : [`${v} paiements`, n]
                    }
                  />
                  <Bar dataKey="encaisse" name="Encaissé" fill="#C9DCF2" radius={[8, 8, 0, 0]} maxBarSize={38} />
                  <Line
                    type="monotone"
                    dataKey="paiements"
                    name="Paiements"
                    stroke="#28396C"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#6BA53A", stroke: "#fff", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <ul className="mt-4 flex flex-wrap gap-3">
              <li className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="h-2.5 w-3.5 rounded-sm bg-[#C9DCF2]" /> Encaissé (k MAD)
              </li>
              <li className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="h-0.5 w-4 rounded-full bg-[#28396C]" /> Paiements reçus
              </li>
            </ul>
          </div>

          {/* Colonne d'indicateurs   comme la maquette : une ligne par KPI, séparateurs fins */}
          <div className="border-t border-[#28396C]/10 lg:border-l lg:border-t-0">
            <ul className="divide-y divide-[#28396C]/10">
              {[
                { label: "Total encaissé", value: `${(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} MAD`, delta: "", up: true },
                { label: "Encaissé ce mois", value: `${(stats?.paid_this_month ?? 0).toLocaleString("fr-FR")} MAD`, delta: "", up: true },
                { label: "Dette totale", value: `${(stats?.total_debt ?? 0).toLocaleString("fr-FR")} MAD`, delta: "", up: false },
                { label: "Familles actives", value: String(stats?.active_clients ?? 0), delta: "", up: true },
              ].map((k) => (
                <li key={k.label} className="px-5 py-5 sm:px-6">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <p className="font-display text-2xl font-semibold tabular-nums text-foreground">{k.value}</p>
                  </div>
                </li>
              ))}
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
                  {(totalRevenue ?? 0).toLocaleString("fr-FR")} <span className="text-sm font-normal text-muted-foreground">MAD</span>
                </p>
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
            <AreaChart data={chartData.map((d) => ({ x: d.mois, v: d.encaisse }))} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6BA53A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6BA53A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(40,57,108,0.10)" vertical={false} />
              <XAxis dataKey="x" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={dashTooltip}
                cursor={{ stroke: "rgba(40,57,108,0.25)", strokeWidth: 1 }}
                formatter={(v: number) => [`${v}k MAD`, "Encaissé"]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#28396C"
                strokeWidth={2.5}
                fill="url(#activityFill)"
                dot={{ r: 3, fill: "#28396C", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#6BA53A", stroke: "#fff", strokeWidth: 2 }}
              />
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
                  {p.status === "paye" ? "Payé" : p.status === "retard" ? "En retard" : "Impayé"}
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
