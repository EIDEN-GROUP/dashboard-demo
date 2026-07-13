import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  CreditCard,
  AlertCircle,
  Banknote,
  Clock,
  Plus,
  ArrowUpRight,
  Calendar,
  MessageSquare,
  Send,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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
import { getDashboardStats, getMonthlyRevenue } from "@/lib/server-dashboard";
import { createClient } from "@/lib/server-clients";
import { sendBroadcast } from "@/lib/server-whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "CRM Plateforme" }] }),
  component: CrmDash,
});

const inputClass = "rounded-none border-border bg-card shadow-none focus-visible:border-primary focus-visible:ring-0";
const selectTriggerClass = "h-10 rounded-none border-border bg-card shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/70";

type QuickAction =
  | { kind: "link"; to: string; title: string; desc: string; icon: typeof Users }
  | { kind: "add-client"; title: string; desc: string; icon: typeof Plus }
  | { kind: "broadcast"; title: string; desc: string; icon: typeof MessageSquare };

const tagClass = "inline-flex items-center border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/90";
const badgeClass = "absolute right-4 top-4 border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground";
const dashChartTooltip = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--foreground)",
} as const;
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClass}>{label}</Label>
      {children}
    </div>
  );
}

function NouveauClientModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const m = t.home.addClientModal;
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createClient({
        data: {
          parent_name: String(fd.get("parent") || fd.get("pere") || "").trim() || "Nouveau client",
          child_name: String(fd.get("eleve") || fd.get("child") || "").trim() || "Enfant",
          email: String(fd.get("email1") || "").trim(),
          phone: String(fd.get("tel1") || "").trim(),
          level: String(fd.get("niveau") || "").trim(),
          father_name: String(fd.get("pere") || "").trim(),
          mother_name: String(fd.get("mere") || "").trim(),
          cin: String(fd.get("cin") || "").trim(),
          email2: String(fd.get("email2") || "").trim(),
          phone2: String(fd.get("tel2") || "").trim(),
          dob: String(fd.get("naissance") || "").trim(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onOpenChange(false);
      toast.success("Client créé avec succès");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none", "max-h-[min(90vh,860px)] w-[min(100vw-1.5rem,640px)] max-w-[min(100vw-1.5rem,640px)] translate-y-[-50%] sm:max-w-[640px]", "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0")}>
        <DialogDescription className="sr-only">{m.srDesc}</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{m.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">{m.title}</DialogTitle>
          </div>
          <form className="max-h-[calc(90vh-12rem)] overflow-y-auto px-6 py-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="crm-eleve" label={f.studentName}>
                <Input id="crm-eleve" name="eleve" autoComplete="name" className={inputClass} />
              </Field>
              <Field id="crm-dob" label={f.birthDate}>
                <div className="relative">
                  <Input id="crm-dob" name="naissance" placeholder={f.birthDatePlaceholder} className={cn(inputClass, "pr-10")} />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" aria-hidden />
                </div>
              </Field>
              <Field id="crm-pere" label={f.fatherName}>
                <Input id="crm-pere" name="pere" autoComplete="additional-name" className={inputClass} />
              </Field>
              <Field id="crm-mere" label={f.motherName}>
                <Input id="crm-mere" name="mere" autoComplete="additional-name" className={inputClass} />
              </Field>
              <Field id="crm-cin" label={f.cinPassport}>
                <Input id="crm-cin" name="cin" className={inputClass} />
              </Field>
              <Field id="crm-niveau" label={f.level}>
                <Select name="niveau">
                  <SelectTrigger id="crm-niveau" className={selectTriggerClass}>
                    <SelectValue placeholder={t.common.selectLevel} />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
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
                <Input id="crm-email1" name="email1" type="email" autoComplete="email" className={inputClass} />
              </Field>
              <Field id="crm-email2" label={f.email2}>
                <Input id="crm-email2" name="email2" type="email" className={inputClass} />
              </Field>
              <Field id="crm-tel1" label={f.phone1}>
                <Input id="crm-tel1" name="tel1" type="tel" autoComplete="tel" className={inputClass} />
              </Field>
              <Field id="crm-tel2" label={f.phone2}>
                <Input id="crm-tel2" name="tel2" type="tel" className={inputClass} />
              </Field>
            </div>
            {error ? <p className="mt-4 text-xs text-red-600">{error}</p> : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.cancel}</button>
              <button type="submit" disabled={busy} className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "..." : m.submit}</button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BroadcastDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useDashboardI18n();
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
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setResult(null); setContent(""); } onOpenChange(o); }}>
      <DialogContent className={cn("gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none", "max-h-[min(90vh,560px)] w-[min(100vw-1.5rem,520px)] max-w-[min(100vw-1.5rem,520px)] translate-y-[-50%] sm:max-w-[520px]", "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0")}>
        <DialogDescription className="sr-only">Envoyer un message WhatsApp à tous les clients</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">WhatsApp</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">Message à tous les clients</DialogTitle>
          </div>
          <div className="px-6 py-5 space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre message pour tous les clients (WhatsApp)..."
              rows={5}
              className="w-full resize-y border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input"
            />
            {result ? (
              <div className="border border-border bg-muted p-3 text-sm">
                <p className="font-medium text-foreground">Résultat</p>
                <p className="text-muted-foreground">Total: {result.total} · Succès: {result.success} · Échecs: {result.failed}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">{t.common.cancel}</button>
              <button type="button" onClick={handleSend} disabled={busy || !content.trim()} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                <Send className="h-4 w-4" />
                {busy ? "Envoi en cours..." : "Envoyer à tous"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CrmDash() {
  const { t } = useDashboardI18n();
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const { data: chartData } = useQuery({
    queryKey: ["dashboard-chart"],
    queryFn: getMonthlyRevenue,
  });

  const filterTags = [t.home.tags.clients, t.home.tags.payments, t.home.tags.debt, t.home.tags.collection];

  const metrics = [
    {
      k: "01",
      label: t.home.metrics.totalClients,
      value: statsLoading ? "..." : String(stats?.total_clients ?? 0),
      sub: stats ? `${stats.active_clients} ${t.home.metrics.oneActive.toLowerCase()}` : "",
      badge: t.common.active,
      borderClass: "border-t-primary",
      icon: Users,
      to: "/dashboard/familles" as const,
    },
    {
      k: "02",
      label: t.home.metrics.paidThisMonth,
      value: statsLoading ? "..." : `${stats?.paid_this_month?.toLocaleString("fr-FR") ?? 0} ${t.common.mad}`,
      sub: `${stats?.overdue_count ?? 0} ${t.home.metrics.onePending.toLowerCase()}`,
      badge: t.common.active,
      borderClass: "border-t-chart-4",
      icon: CreditCard,
      to: "/dashboard/familles" as const,
    },
    {
      k: "03",
      label: t.home.metrics.totalDebt,
      value: statsLoading ? "..." : `${stats?.total_debt?.toLocaleString("fr-FR") ?? 0} ${t.common.mad}`,
      sub: t.home.metrics.calculatedDynamic,
      badge: t.common.active,
      borderClass: "border-t-chart-2",
      icon: AlertCircle,
      to: "/dashboard/rapports" as const,
    },
    {
      k: "04",
      label: t.home.metrics.totalRevenue,
      value: statsLoading ? "..." : `${stats?.total_revenue?.toLocaleString("fr-FR") ?? 0} ${t.common.mad}`,
      sub: t.home.metrics.reportsDemo,
      badge: t.common.active,
      borderClass: "border-t-muted-foreground",
      icon: Banknote,
      to: "/dashboard/rapports" as const,
    },
  ] as const;

  const quickActions: QuickAction[] = [
    { kind: "link", to: "/dashboard/familles", title: t.home.quickActions.manageClients.title, desc: t.home.quickActions.manageClients.desc, icon: Users },
    { kind: "link", to: "/dashboard/familles", title: t.home.quickActions.recordPayment.title, desc: t.home.quickActions.recordPayment.desc, icon: CreditCard },
    { kind: "link", to: "/dashboard/paiements", title: t.home.quickActions.lateClients.title, desc: t.home.quickActions.lateClients.desc, icon: Clock },
    { kind: "add-client", title: t.home.quickActions.addClient.title, desc: t.home.quickActions.addClient.desc, icon: Plus },
    { kind: "broadcast", title: "Message WhatsApp", desc: "Envoyer un message à tous les clients", icon: MessageSquare },
  ];

  const quickRowClass = "group flex w-full items-start gap-3 border border-transparent p-3 text-left transition hover:border-border hover:bg-muted";

  return (
    <div className="space-y-8">
      <NouveauClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{t.home.eyebrow}</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-foreground">
            <span className="font-semibold">{t.home.titleBold}</span>{" "}
            <span className="font-normal italic text-muted-foreground">{t.home.titleItalic}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.home.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterTags.map((label) => (
            <span key={label} className={tagClass}>{label}</span>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((card) => (
          <Link
            key={card.k}
            to={card.to}
            aria-label={interpolate(t.home.cardOpenAria, { label: card.label, value: card.value })}
            className={"relative block overflow-hidden border border-border bg-card p-5 text-left text-inherit no-underline outline-none transition-colors hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " + card.borderClass + " border-t-4"}
          >
            <span className={badgeClass}>{card.badge}</span>
            <p className="pr-16 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.k} — {card.label}</p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-muted text-foreground/90">
                <card.icon className="h-5 w-5" />
              </span>
            </div>
            {card.sub ? <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p> : null}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 w-full flex-col border border-border bg-card p-6 lg:min-w-0 lg:flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.common.chart}</p>
          <h2 className="mt-1 font-display text-xl text-foreground">
            {t.home.chartTitleBold} <span className="font-normal italic text-muted-foreground">{t.home.chartTitleItalic}</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{t.home.chartSubtitle}</p>
          <div className="mt-4 h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={dashChartTooltip} />
                <Bar dataKey="v" fill="var(--primary)" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Link to="/dashboard/rapports" className="mt-4 inline-flex w-fit shrink-0 items-center gap-1.5 border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            {t.home.viewReports}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="flex shrink-0 flex-col gap-4 lg:w-[min(100%,22rem)] lg:max-w-sm">
          <div className="flex flex-col border border-border bg-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.home.quickActionsEyebrow}</p>
            <h2 className="mt-1 font-display text-xl text-foreground">
              {t.home.quickNavBold} <span className="font-normal italic text-muted-foreground">{t.home.quickNavItalic}</span>
            </h2>
            <ul className="mt-5 space-y-2">
              {quickActions.map((a) => {
                const QIcon = a.icon;
                const inner = (
                  <>
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-border bg-muted text-foreground/90">
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
                if (a.kind === "add-client") {
                  return (
                    <li key={a.title}>
                      <button type="button" onClick={() => setAddClientOpen(true)} className={quickRowClass}>{inner}</button>
                    </li>
                  );
                }
                if (a.kind === "broadcast") {
                  return (
                    <li key={a.title}>
                      <button type="button" onClick={() => setBroadcastOpen(true)} className={quickRowClass}>{inner}</button>
                    </li>
                  );
                }
                return (
                  <li key={a.title}>
                    <Link to={a.to} className={quickRowClass}>{inner}</Link>
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
