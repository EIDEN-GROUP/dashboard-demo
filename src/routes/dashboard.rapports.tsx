import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Search, Users, XCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { interpolate, useDashboardI18n } from "@/lib/landing-i18n";
import { getDashboardStats, getMonthlyRevenue } from "@/lib/server-dashboard";

export const Route = createFileRoute("/dashboard/rapports")({
  head: () => ({ meta: [{ title: "Rapports — CRM" }] }),
  component: RapportsPage,
});

const chartTooltip = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 0, color: "var(--foreground)" } as const;

const listeDialogContent = cn(
  "grid min-w-0 grid-cols-1 gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none",
  "max-h-[min(90vh,860px)] w-[min(100vw-1.5rem,640px)] max-w-[min(100vw-1.5rem,640px)] translate-y-[-50%] sm:max-w-[640px]",
  "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0",
);

const cardClass = "relative block w-full overflow-hidden border border-border bg-card p-5 text-left outline-none transition-colors hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-t-4";
const listeSearchInputClass = "h-10 rounded-none border-border bg-card shadow-none focus-visible:border-primary focus-visible:ring-0";

function ListeFamillesModal({ open, onOpenChange, title, eyebrow, rows }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; eyebrow: string; rows: any[] }) {
  const { t } = useDashboardI18n();
  const r = t.rapports;
  const searchFieldId = useId();
  const [query, setQuery] = useState("");

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => { const hay = [row.parent_name || row.parent, row.child_name || row.child, row.email, row.phone, row.remarque].join(" ").toLowerCase(); return hay.includes(q); });
  }, [rows, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={listeDialogContent}>
        <DialogDescription className="sr-only min-w-0">{r.modalSrDesc}</DialogDescription>
        <div className="min-w-0 max-w-full border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">{title}</DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {query.trim() ? (filtered.length === 1 ? interpolate(r.resultsOnTotal, { filtered: filtered.length, total: rows.length }) : interpolate(r.resultsOnTotalPlural, { filtered: filtered.length, total: rows.length }))
                : (rows.length === 1 ? r.familiesDemoOne : interpolate(r.familiesDemoMany, { count: rows.length }))}
            </p>
          </div>
          <div className="border-b border-border px-6 py-3">
            <label htmlFor={searchFieldId} className="sr-only">{r.searchInList}</label>
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" aria-hidden />
              <Input id={searchFieldId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={r.searchPlaceholder} className={cn(listeSearchInputClass, "pl-10")} autoComplete="off" />
            </div>
          </div>
          <div className="max-h-[calc(90vh-15.5rem)] min-w-0 w-full max-w-full overflow-x-auto overflow-y-auto scroll-touch border-b border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">{t.common.parent}</th><th className="px-4 py-3">{t.common.child}</th><th className="px-4 py-3">{t.common.contact}</th><th className="px-4 py-3">{t.common.situation}</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">{r.noSearchMatch}</td></tr> :
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/80">
                      <td className="px-4 py-3 font-medium text-foreground">{row.parent_name || row.parent}</td>
                      <td className="px-4 py-3 text-foreground/90">{row.child_name || row.child}</td>
                      <td className="px-4 py-3 text-muted-foreground"><span className="block">{row.email}</span><span className="mt-0.5 block text-xs text-muted-foreground">{row.phone}</span></td>
                      <td className="max-w-[11rem] px-4 py-3 text-xs leading-snug text-muted-foreground">{row.remarque || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function buildFamillesList(data: any[], paid: boolean): any[] {
  return data.map((c: any, i: number) => ({
    id: `${paid ? "paye" : "impaye"}-${i}`,
    parent_name: c.parent_name,
    child_name: c.child_name,
    email: c.email,
    phone: c.phone,
    remarque: paid ? "Paiement à jour" : `Dette ${c.debt} MAD`,
  }));
}

function RapportsPage() {
  const { t } = useDashboardI18n();
  const r = t.rapports;
  const [modal, setModal] = useState<null | "paye" | "impaye">(null);

  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const { data: chartData } = useQuery({ queryKey: ["dashboard-chart"], queryFn: getMonthlyRevenue });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: async () => {
    const { listClients } = await import("@/lib/server-clients");
    return listClients();
  }});

  const payees = useMemo(() => clients.filter((c: any) => c.payment_status === "paye"), [clients]);
  const impayees = useMemo(() => clients.filter((c: any) => c.payment_status === "impaye"), [clients]);

  const displayData = chartData ?? [];

  return (
    <div className="space-y-8">
      <ListeFamillesModal open={modal === "paye"} onOpenChange={(o) => !o && setModal(null)} eyebrow={r.modalEyebrow} title={r.modalPaidTitle} rows={buildFamillesList(payees, true)} />
      <ListeFamillesModal open={modal === "impaye"} onOpenChange={(o) => !o && setModal(null)} eyebrow={r.modalEyebrow} title={r.modalUnpaidTitle} rows={buildFamillesList(impayees, false)} />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{r.eyebrow}</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-foreground">
            <span className="font-semibold">{r.titleBold}</span>{" "}
            <span className="font-normal italic text-muted-foreground">{r.titleItalic}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{r.subtitle}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className={cn(cardClass, "border-t-primary sm:col-span-2 xl:col-span-1", "cursor-default hover:border-border hover:bg-card")}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{r.summary}</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.paid}</p><p className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums">{payees.length}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.unpaid}</p><p className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums">{impayees.length}</p></div>
            <div className="min-w-[6rem] border-l border-border pl-6"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.totalFamilies}</p><p className="font-display text-3xl font-semibold tracking-tight text-foreground tabular-nums">{clients.length}</p></div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">{r.summaryNote}</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-muted text-foreground/90" aria-hidden><Users className="h-5 w-5" /></span>
          </div>
        </div>

        <button type="button" onClick={() => setModal("paye")} className={cn(cardClass, "border-t-chart-4")}>
          <p className="pr-14 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{r.paidCard}</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{payees.length}</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-muted text-foreground/90"><CheckCircle2 className="h-5 w-5" aria-hidden /></span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{r.paidDesc}</p>
        </button>

        <button type="button" onClick={() => setModal("impaye")} className={cn(cardClass, "border-t-chart-3")}>
          <p className="pr-14 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{r.unpaidCard}</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{impayees.length}</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-input bg-muted text-foreground"><XCircle className="h-5 w-5" aria-hidden /></span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{r.unpaidDesc}</p>
        </button>
      </div>

      <div className="border border-border bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.common.chart}</p>
        <h2 className="mt-1 font-display text-xl text-foreground">
          {r.chartTitleBold} <span className="font-normal italic text-muted-foreground">{r.chartTitleItalic}</span>
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{r.chartSubtitle}</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="v" fill="var(--primary)" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
