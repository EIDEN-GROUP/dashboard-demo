import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Users,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Calendar,
  Send,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
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
// Données démo   activité d'encaissement (MAD, en milliers)
// ──────────────────────────────────────────────────────────
type Range = "1S" | "1M" | "3M" | "1A";

const ACTIVITY: Record<Range, { x: string; v: number }[]> = {
  "1S": [
    { x: "Lun", v: 3.6 },
    { x: "Mar", v: 5.4 },
    { x: "Mer", v: 4.2 },
    { x: "Jeu", v: 7.1 },
    { x: "Ven", v: 6.3 },
    { x: "Sam", v: 2.8 },
  ],
  "1M": [
    { x: "S1", v: 18 },
    { x: "S2", v: 27 },
    { x: "S3", v: 22 },
    { x: "S4", v: 34 },
  ],
  "3M": [
    { x: "Mar", v: 41 },
    { x: "Avr", v: 33 },
    { x: "Mai", v: 48 },
  ],
  "1A": [
    { x: "Sep", v: 24 },
    { x: "Oct", v: 31 },
    { x: "Nov", v: 28 },
    { x: "Déc", v: 19 },
    { x: "Jan", v: 34 },
    { x: "Fév", v: 42 },
    { x: "Mar", v: 41 },
    { x: "Avr", v: 33 },
    { x: "Mai", v: 48 },
    { x: "Juin", v: 44 },
  ],
};

const ACTIVITY_TOTAL: Record<Range, string> = {
  "1S": "12 400",
  "1M": "42 500",
  "3M": "122 000",
  "1A": "344 000",
};

// Répartition des paiements par statut   payé / impayé / en retard (ce mois)
const STATUS_DATA = [
  { name: "Payé", value: 2, color: STATUS_COLORS.paye },
  { name: "Impayé", value: 1, color: STATUS_COLORS.impaye },
  { name: "En retard", value: 1, color: STATUS_COLORS.retard },
];

// Derniers paiements (démo)   reflète dashboard.paiements
const LAST_PAYMENTS = [
  { who: "Famille Alami", note: "Frais mensuels · Yasmine", date: "05/05/2026", amount: "1 800", status: "paye" as const },
  { who: "Tazi / Mehdi", note: "Frais mensuels · Mehdi", date: "05/05/2026", amount: "1 800", status: "paye" as const },
  { who: "Benjelloun / Sara", note: "Échéance dépassée · Sara", date: "En retard", amount: "1 200", status: "retard" as const },
  { who: "rztest / testss", note: "Inscription en attente", date: " ", amount: "0", status: "impaye" as const },
];

// Familles pour la relance rapide
const QUICK_FAMILIES = ["Famille Alami", "Tazi / Mehdi", "Benjelloun / Sara", "Famille Amrani", "Famille Bennani"];

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

  // 4 indicateurs   total / payé / en retard / impayé
  const metrics = [
    {
      k: "01",
      label: "Total de familles à l'école",
      value: "4",
      sub: "familles inscrites",
      accent: "#28396C",
      tint: "rgba(40,57,108,0.10)",
      icon: Users,
      to: "/dashboard/familles",
    },
    {
      k: "02",
      label: "Payé",
      value: "2",
      sub: "paiements du mois reçus",
      accent: STATUS_COLORS.paye,
      tint: "rgba(107,165,58,0.14)",
      icon: CreditCard,
      to: "/dashboard/paiements",
    },
    {
      k: "03",
      label: "En retard",
      value: "1",
      sub: "relance recommandée",
      accent: STATUS_COLORS.retard,
      tint: "rgba(226,92,92,0.12)",
      icon: Clock,
      to: "/dashboard/paiements",
    },
    {
      k: "04",
      label: "Impayé",
      value: "1",
      sub: "facture en attente",
      accent: STATUS_COLORS.impaye,
      tint: "rgba(232,161,60,0.14)",
      icon: AlertCircle,
      to: "/dashboard/paiements",
    },
  ] as const;

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

  const rangeButtons: Range[] = ["1S", "1M", "3M", "1A"];
  const statusTotal = STATUS_DATA.reduce((s, d) => s + d.value, 0);

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

      {/* 2 graphiques   gauche : BarChart par statut · droite : AreaChart mensuel */}
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Gauche   répartition par statut (3 couleurs) */}
        <div className={cn(softCard, "min-w-0 p-5 sm:p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Répartition</p>
              <h2 className="mt-1 font-display text-xl text-foreground">
                Paiements <span className="font-normal italic text-muted-foreground">par statut</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Payé · Impayé · En retard   ce mois</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold tabular-nums text-foreground">{statusTotal}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">familles</p>
            </div>
          </div>
          <div className="mt-4 h-72 w-full min-w-0 sm:h-[24rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATUS_DATA} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(40,57,108,0.10)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={dashTooltip}
                  cursor={{ fill: "rgba(181,225,139,0.18)" }}
                  formatter={(v: number) => [`${v} famille${v > 1 ? "s" : ""}`, "Familles"]}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={70}>
                  {STATUS_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {STATUS_DATA.map((s) => (
              <li key={s.name} className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
                <span className="font-semibold tabular-nums">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Droite   activité mensuelle (aires) */}
        <div className={cn(softCard, "min-w-0 p-5 sm:p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Mon activité</p>
              <h2 className="mt-1 font-display text-xl text-foreground">
                Encaissements <span className="font-normal italic text-muted-foreground">mensuels</span>
              </h2>
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
          <div className="mt-3 flex items-end gap-2">
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {ACTIVITY_TOTAL[range]} <span className="text-sm font-normal text-muted-foreground">MAD</span>
            </p>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#B5E18B]/30 px-2 py-0.5 text-[11px] font-semibold text-[#3E6420]">
              <TrendingUp className="h-3 w-3" /> +8,4%
            </span>
          </div>
          <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY[range]} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
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
            {LAST_PAYMENTS.map((p) => (
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
                {QUICK_FAMILIES.slice(0, 4).map((name) => (
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
              <button type="submit" className={cn(primaryPill, "w-full justify-center")}>
                <Send className="h-4 w-4" />
                Envoyer le rappel
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
