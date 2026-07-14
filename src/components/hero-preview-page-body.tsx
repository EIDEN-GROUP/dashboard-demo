import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Search,
  Send,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { CartesianGrid, Bar, BarChart, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDashboardI18n, useLandingI18n } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/dash-ui";
import {
  mirrorClients,
  mirrorDashboardMetrics,
  mirrorDemandes,
  mirrorEmployes,
  mirrorLastPayments,
  mirrorPaymentRows,
  mirrorRapportsChart,
  mirrorRapportsImpayeCount,
  mirrorRapportsPayeCount,
  mirrorRapportsTotalFamilles,
  mirrorStatKpis,
  mirrorStatSeries,
  type DashboardMiniaturePageId,
} from "@/lib/dashboard-mirror-data";

const chartTooltipBar = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--foreground)",
} as const;

// Rounded tooltip matching the real dashboard shot.
const shotTooltip = {
  background: "var(--card)",
  border: "1px solid rgba(40,57,108,0.15)",
  borderRadius: 10,
  color: "var(--foreground)",
  fontSize: 11,
} as const;

export function HeroPreviewPageBody({
  page,
  previewBtn,
  showLocked,
}: {
  page: DashboardMiniaturePageId;
  previewBtn: string;
  showLocked: (msg: string) => void;
}) {
  const { t } = useDashboardI18n();
  const { t: tl } = useLandingI18n();
  const pv = tl.preview;

  const chartData = useMemo(
    () => mirrorRapportsChart.map((row, i) => ({ m: t.rapports.months[i] ?? row.m, v: row.v })),
    [t.rapports.months],
  );

  const stadeLabel = (s: string) => (s === "nouveau" ? t.status.nouveau : t.status.converti);
  const paymentLabel = (s: string) => (s === "impaye" ? t.status.impaye : t.status.paye);

  const rendezVousTableHeaders = useMemo(
    () => [t.rendezVous.csvHeaders[0], t.rendezVous.csvHeaders[1], t.rendezVous.csvHeaders[3], t.rendezVous.csvHeaders[4]],
    [t.rendezVous.csvHeaders],
  );

  switch (page) {
    case "dashboard":
      return (
        <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain text-[#28396C]">
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#5C6B94]">{t.home.eyebrow}</p>
              <p className="mt-0.5 font-display text-sm font-semibold leading-tight sm:text-base">
                <span className="font-semibold">{t.home.titleBold}</span>{" "}
                <span className="font-normal italic text-[#5C6B94]">{t.home.titleItalic}</span>
              </p>
              <p className="mt-0.5 truncate text-[9px] text-[#5C6B94] sm:text-[10px]">{t.home.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => showLocked(pv.locked.addClient)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#B5E18B] px-2.5 py-1.5 text-[9px] font-bold text-[#28396C] shadow-sm sm:text-[10px]"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">{t.home.quickActions.addClient.title}</span>
            </button>
          </div>

          {/* 4 status cards   total familles / payé / en retard / impayé */}
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
            {mirrorDashboardMetrics.map((card) => (
              <Link
                key={card.k}
                to={card.to}
                onClick={(e) => {
                  e.preventDefault();
                  showLocked(pv.locked.openCard);
                }}
                className="relative block overflow-hidden rounded-2xl border border-[#28396C]/10 bg-white p-2.5 text-left text-inherit no-underline shadow-[0_10px_25px_-20px_rgba(40,57,108,0.5)]"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[8px] font-medium uppercase tracking-wider text-[#5C6B94] sm:text-[9px]">{card.label}</p>
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: card.tint, color: card.accent }}
                  >
                    <card.icon className="h-3 w-3" />
                  </span>
                </div>
                <p className="mt-1.5 font-display text-lg font-semibold leading-none tracking-tight sm:text-xl">{card.value}</p>
                <p className="mt-1 text-[8px] text-[#5C6B94] sm:text-[9px]">{card.sub}</p>
                <span className="mt-2 block h-1 w-8 rounded-full" style={{ backgroundColor: card.accent }} />
              </Link>
            ))}
          </div>

          {/* Statistique générale   barres (encaissé) + courbe (paiements) + colonne KPI */}
          <div className="shrink-0 overflow-hidden rounded-2xl border border-[#28396C]/10 bg-white shadow-[0_14px_30px_-24px_rgba(40,57,108,0.5)]">
            <div className="grid sm:grid-cols-[minmax(0,1fr)_9rem]">
              <div className="min-w-0 p-2.5 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#5C6B94] sm:text-[9px]">Vue d'ensemble</p>
                    <h2 className="mt-0.5 font-display text-xs text-[#28396C] sm:text-sm">
                      Statistique <span className="font-normal italic text-[#5C6B94]">générale</span>
                    </h2>
                  </div>
                  <span className="rounded-lg border border-[#28396C]/10 bg-muted/60 px-2 py-0.5 text-[8px] font-medium text-[#5C6B94] sm:text-[9px]">2026</span>
                </div>
                <div className="mt-2 h-[6.5rem] w-full min-w-0 sm:h-[7.5rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mirrorStatSeries} margin={{ top: 6, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(40,57,108,0.08)" vertical={false} />
                      <XAxis dataKey="mois" stroke="var(--muted-foreground)" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 8 }} width={20} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={shotTooltip} cursor={{ fill: "rgba(181,225,139,0.16)" }} />
                      <Bar dataKey="encaisse" fill="#C9DCF2" radius={[4, 4, 0, 0]} maxBarSize={18} />
                      <Line type="monotone" dataKey="paiements" stroke="#28396C" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 flex flex-wrap gap-3">
                  <li className="inline-flex items-center gap-1.5 text-[8px] font-medium text-[#5C6B94] sm:text-[9px]">
                    <span className="h-2 w-3 rounded-sm bg-[#C9DCF2]" /> Encaissé (k MAD)
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-[8px] font-medium text-[#5C6B94] sm:text-[9px]">
                    <span className="h-0.5 w-3.5 rounded-full bg-[#28396C]" /> Paiements reçus
                  </li>
                </ul>
              </div>

              <ul className="grid grid-cols-2 border-t border-[#28396C]/10 sm:grid-cols-1 sm:border-l sm:border-t-0 sm:divide-y sm:divide-[#28396C]/10">
                {mirrorStatKpis.map((k) => (
                  <li key={k.label} className="border-b border-[#28396C]/10 px-2.5 py-1.5 sm:border-b-0 sm:py-2">
                    <p className="truncate text-[8px] text-[#5C6B94] sm:text-[9px]">{k.label}</p>
                    <div className="mt-0.5 flex items-end justify-between gap-1">
                      <p className="font-display text-sm font-semibold tabular-nums leading-none">{k.value}</p>
                      <span className={cn("inline-flex items-center gap-0.5 text-[8px] font-semibold sm:text-[9px]", k.up ? "text-[#3E6420]" : "text-[#9A2F2F]")}>
                        {k.delta}
                        {k.up ? <ArrowUp className="h-2 w-2" /> : <ArrowDown className="h-2 w-2" />}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Derniers paiements + Relance rapide */}
          <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#28396C]/10 bg-white p-2.5 shadow-[0_14px_30px_-24px_rgba(40,57,108,0.5)]">
              <div className="flex shrink-0 items-center justify-between gap-2">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#5C6B94] sm:text-[9px]">Activité récente</p>
                  <h2 className="mt-0.5 font-display text-xs text-[#28396C] sm:text-sm">Derniers paiements</h2>
                </div>
                <button
                  type="button"
                  onClick={() => showLocked(pv.locked.openCard)}
                  className="inline-flex items-center gap-1 text-[8px] font-semibold text-[#28396C] sm:text-[9px]"
                >
                  Voir tout <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <ul className="mt-1.5 min-h-0 flex-1 divide-y divide-[#28396C]/8 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                {mirrorLastPayments.map((p) => (
                  <li key={p.who + p.note} className="flex items-center gap-2 py-1.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#28396C]/8 text-[9px] font-bold text-[#28396C]">
                      {initials(p.who)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium leading-tight sm:text-[11px]">{p.who}</p>
                      <p className="truncate text-[8px] leading-tight text-[#5C6B94] sm:text-[9px]">{p.note}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold tabular-nums sm:text-[11px]">{p.amount} MAD</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[7px] font-semibold uppercase tracking-wide sm:text-[8px]",
                        p.status === "paye"
                          ? "bg-[#B5E18B]/30 text-[#3E6420]"
                          : p.status === "retard"
                            ? "bg-[#F6D8D8] text-[#9A2F2F]"
                            : "bg-[#F4E3C0] text-[#8A5A16]",
                      )}
                    >
                      {p.status === "paye" ? "Payé" : p.status === "retard" ? "En retard" : "Impayé"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Relance rapide teaser */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#28396C]/10 bg-[#28396C] p-2.5 text-white shadow-[0_14px_30px_-24px_rgba(40,57,108,0.5)] lg:block">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#B5E18B] sm:text-[9px]">Relance rapide</p>
                <TrendingUp className="h-3.5 w-3.5 text-[#B5E18B]" />
              </div>
              <h4 className="mt-1 font-display text-xs font-semibold sm:text-sm">Rappel de paiement</h4>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-white/40 text-white/80">
                  <Plus className="h-3 w-3" />
                </span>
                {["Famille Alami", "Tazi / Mehdi", "Benjelloun"].map((name) => (
                  <span
                    key={name}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#B5E18B] text-[9px] font-bold text-[#28396C] ring-2 ring-[#28396C]"
                  >
                    {initials(name)}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => showLocked(pv.locked.openCard)}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#B5E18B] px-3 py-2 text-[10px] font-bold text-[#28396C]"
              >
                <Send className="h-3 w-3" />
                Envoyer le rappel
              </button>
            </div>
          </div>
        </div>
      );

    case "familles":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <div className="shrink-0 space-y-0.5">
            <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t.familles.eyebrow}</p>
            <p className="font-display text-[11px] font-semibold text-foreground sm:text-[12px]">
              {t.familles.titleBold} <span className="italic text-muted-foreground">{t.familles.titleItalic}</span>
            </p>
          </div>
          <button type="button" className={cn(previewBtn, "shrink-0 self-start")} onClick={() => showLocked(pv.locked.addClient)}>
            <Plus className="h-2.5 w-2.5" /> {t.common.add}
          </button>
          <div className="shrink-0 border border-border bg-card p-1">
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">
              {t.common.filtersSearch}
            </p>
            <div className="mt-1 flex items-center gap-0.5 border border-border bg-muted px-1 py-0.5">
              <Search className="h-2.5 w-2.5 shrink-0 text-muted-foreground/80" />
              <span className="text-[7px] text-muted-foreground/80 sm:text-[8px]">{pv.searchEllipsis}</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="border-b border-border px-1 py-0.5">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">
                {t.familles.clientList}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    <th className="px-1 py-0.5">{t.familles.table.parent}</th>
                    <th className="px-1 py-0.5">{t.familles.table.child}</th>
                    <th className="px-1 py-0.5">{pv.tableStage}</th>
                    <th className="px-1 py-0.5">{pv.tablePayment}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mirrorClients.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/80">
                      <td className="px-1 py-0.5 font-medium text-foreground">{c.parent}</td>
                      <td className="px-1 py-0.5 text-foreground/85">{c.child}</td>
                      <td className="px-1 py-0.5">
                        <span className="inline-flex items-center gap-0.5 border border-border bg-muted px-0.5 py-px text-[7px] font-semibold uppercase sm:text-[8px]">
                          {stadeLabel(c.stade)}
                        </span>
                      </td>
                      <td className="px-1 py-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 border px-0.5 py-px text-[7px] font-semibold uppercase sm:text-[8px]",
                            c.payment === "paye" ? "border-border bg-foreground text-background" : "border-border bg-muted text-foreground/85",
                          )}
                        >
                          {paymentLabel(c.payment)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case "paiements":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <div className="shrink-0">
            <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t.paiements.eyebrow}</p>
            <p className="font-display text-[11px] text-foreground sm:text-[12px]">
              {t.paiements.titleBold} <span className="italic text-muted-foreground">{t.paiements.titleItalic}</span>
            </p>
          </div>
          <button
            type="button"
            className={cn(previewBtn, "inline-flex shrink-0 gap-0.5 self-start")}
            onClick={() => showLocked(pv.locked.exportCsv)}
          >
            {t.common.export}
          </button>
          <div className="shrink-0 border border-border bg-card p-1">
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">
              {t.common.filtersAndSearch}
            </p>
            <div className="mt-0.5 flex items-center gap-0.5 border border-border bg-muted px-1 py-0.5">
              <Search className="h-2.5 w-2.5 text-muted-foreground/80" />
              <span className="text-[7px] text-muted-foreground/80 sm:text-[8px]">{pv.searchEllipsis}</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    <th className="px-1 py-0.5">{t.common.parent}</th>
                    <th className="px-1 py-0.5">{t.common.child}</th>
                    <th className="px-1 py-0.5">{t.common.amount}</th>
                    <th className="px-1 py-0.5">{t.common.date}</th>
                    <th className="px-1 py-0.5">{t.common.mode}</th>
                    <th className="px-1 py-0.5">{t.common.receipt}</th>
                    <th className="px-1 py-0.5">{t.common.invoice}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mirrorPaymentRows.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/80">
                      <td className="px-1 py-0.5 font-medium text-foreground">{r.parent}</td>
                      <td className="px-1 py-0.5 text-foreground/85">{r.enfant}</td>
                      <td className="px-1 py-0.5 font-semibold tabular-nums">
                        {r.montant} {t.common.mad}
                      </td>
                      <td className="px-1 py-0.5 tabular-nums text-foreground/85">{r.date}</td>
                      <td className="px-1 py-0.5">
                        <span className="inline-flex items-center gap-0.5 border border-border bg-foreground px-0.5 py-px text-[7px] font-semibold uppercase text-background sm:text-[8px]">
                          {r.mode}
                        </span>
                      </td>
                      <td className="px-1 py-0.5 font-mono text-[7px] text-foreground/85 sm:text-[8px]">{r.recu}</td>
                      <td className="px-1 py-0.5">
                        <span className="border border-border bg-muted px-0.5 py-px text-[7px] text-foreground/85 sm:text-[8px]">
                          {r.facture === "non_envoye" ? t.status.notSent : t.status.sent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case "rendez-vous":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <div className="flex shrink-0 flex-wrap items-end justify-between gap-1">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t.rendezVous.eyebrow}</p>
              <p className="font-display text-[11px] text-foreground sm:text-[12px]">
                <span className="font-semibold">{t.rendezVous.titleBold}</span>
                <span className="font-medium italic text-muted-foreground">{t.rendezVous.titleItalic}</span>
              </p>
            </div>
            <button type="button" className={cn(previewBtn, "gap-0.5")} onClick={() => showLocked(pv.locked.exportCsv)}>
              {pv.csvShort}
            </button>
          </div>
          <div className="shrink-0 border border-border bg-card p-1">
            <div className="flex items-center gap-0.5 border border-border bg-muted px-1 py-0.5">
              <Search className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[7px] text-muted-foreground/80 sm:text-[8px]">{pv.searchEllipsis}</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[260px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {rendezVousTableHeaders.map((h) => (
                      <th key={h} className="px-1 py-0.5 text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mirrorDemandes.map((r) => (
                    <tr key={r.id} className="border-b border-border/70">
                      <td className="px-1 py-0.5 font-medium text-foreground">{r.nom}</td>
                      <td className="max-w-[4rem] truncate px-1 py-0.5 text-foreground/75">{r.email}</td>
                      <td className="px-1 py-0.5 tabular-nums">{r.dateTable}</td>
                      <td className="max-w-[4rem] truncate px-1 py-0.5 text-muted-foreground">{r.sujet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case "affiches":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <div className="shrink-0">
            <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{t.affiches.eyebrow}</p>
            <p className="font-display text-[11px] leading-tight text-foreground sm:text-[12px]">
              <span className="font-semibold">{t.affiches.titleBold}</span>{" "}
              <span className="font-normal italic text-muted-foreground">{t.affiches.titleItalic}</span>
            </p>
            <p className="text-[7px] text-muted-foreground sm:text-[8px]">{t.affiches.subtitle}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="border-b border-border px-1 py-0.5">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">
                {t.affiches.employeeList}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    <th className="px-1 py-0.5">{t.affiches.table.name}</th>
                    <th className="px-1 py-0.5">{t.affiches.table.position}</th>
                    <th className="px-1 py-0.5">{t.affiches.table.department}</th>
                    <th className="px-1 py-0.5">{t.affiches.table.contact}</th>
                    <th className="px-1 py-0.5">{t.affiches.table.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mirrorEmployes.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/80">
                      <td className="px-1 py-0.5 font-medium text-foreground">{e.nomComplet}</td>
                      <td className="px-1 py-0.5 text-foreground/85">{e.poste}</td>
                      <td className="px-1 py-0.5 text-foreground/75">{e.departement}</td>
                      <td className="px-1 py-0.5 text-foreground/75">
                        <span className="block max-w-[5rem] truncate">{e.email}</span>
                        <span className="mt-px block text-[7px] text-muted-foreground sm:text-[8px]">{e.tel}</span>
                      </td>
                      <td className="px-1 py-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 border px-0.5 py-px text-[7px] font-semibold uppercase sm:text-[8px]",
                            e.statut === "actif" ? "border-border bg-foreground text-background" : "border-border bg-muted text-foreground/85",
                          )}
                        >
                          <span className="h-0.5 w-0.5 shrink-0 bg-current" aria-hidden />
                          {e.statut === "actif" ? t.status.actif : t.status.inactif}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case "rapports": {
      const rapportsCard =
        "relative block w-full overflow-hidden border border-border bg-card p-1.5 text-left outline-none transition-colors sm:p-2 border-t-[3px]";
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <header className="shrink-0 space-y-0.5">
            <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{t.rapports.eyebrow}</p>
            <div>
              <p className="font-display text-[11px] leading-tight text-foreground sm:text-[12px]">
                <span className="font-semibold">{t.rapports.titleBold}</span>{" "}
                <span className="font-normal italic text-muted-foreground">{t.rapports.titleItalic}</span>
              </p>
              <p className="mt-0.5 text-[7px] leading-snug text-muted-foreground sm:text-[8px]">{t.rapports.subtitle}</p>
            </div>
          </header>

          <div className="grid shrink-0 grid-cols-2 gap-0.5">
            <div
              className={cn(
                rapportsCard,
                "col-span-2 border-t-primary",
                "cursor-default hover:border-border hover:bg-card",
              )}
            >
              <p className="text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                {t.rapports.summary}
              </p>
              <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    {t.rapports.paid}
                  </p>
                  <p className="font-display text-[12px] font-semibold tabular-nums leading-none text-foreground sm:text-[13px]">
                    {mirrorRapportsPayeCount}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    {t.rapports.unpaid}
                  </p>
                  <p className="font-display text-[12px] font-semibold tabular-nums leading-none text-foreground sm:text-[13px]">
                    {mirrorRapportsImpayeCount}
                  </p>
                </div>
                <div className="min-w-0 border-l border-border pl-2">
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    {t.rapports.totalFamilies}
                  </p>
                  <p className="font-display text-[13px] font-semibold tabular-nums leading-none text-foreground sm:text-sm">
                    {mirrorRapportsTotalFamilles}
                  </p>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-1 border-t border-border/70 pt-1">
                <p className="min-w-0 flex-1 text-[7px] leading-tight text-muted-foreground sm:text-[8px]">
                  {t.rapports.summaryNote}
                </p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground/85" aria-hidden>
                  <Users className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>

            <button
              type="button"
              className={cn(rapportsCard, "border-t-chart-4 hover:border-border hover:bg-muted/60")}
              onClick={() => showLocked(pv.locked.paidList)}
            >
              <p className="pr-5 text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                {t.rapports.paidCard}
              </p>
              <div className="mt-0.5 flex items-start justify-between gap-1">
                <p className="font-display text-[13px] font-semibold text-foreground sm:text-sm">{mirrorRapportsPayeCount}</p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground/85">
                  <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
                </span>
              </div>
              <p className="mt-0.5 text-[7px] leading-tight text-muted-foreground sm:text-[8px]">{t.rapports.paidDesc}</p>
            </button>

            <button
              type="button"
              className={cn(rapportsCard, "border-t-chart-3 hover:border-border hover:bg-muted/60")}
              onClick={() => showLocked(pv.locked.unpaidList)}
            >
              <p className="pr-5 text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                {t.rapports.unpaidCard}
              </p>
              <div className="mt-0.5 flex items-start justify-between gap-1">
                <p className="font-display text-[13px] font-semibold text-foreground sm:text-sm">{mirrorRapportsImpayeCount}</p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground">
                  <XCircle className="h-2.5 w-2.5" aria-hidden />
                </span>
              </div>
              <p className="mt-0.5 text-[7px] leading-tight text-muted-foreground sm:text-[8px]">{t.rapports.unpaidDesc}</p>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border border-border bg-card p-1 sm:p-1.5">
            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[8px]">
              {t.common.chart}
            </p>
            <h2 className="mt-0.5 font-display text-[10px] text-foreground sm:text-[11px]">
              {t.rapports.chartTitleBold}{" "}
              <span className="font-normal italic text-muted-foreground">{t.rapports.chartTitleItalic}</span>
            </h2>
            <p className="mt-0.5 text-[7px] text-muted-foreground sm:text-[8px]">{t.rapports.chartSubtitle}</p>
            <div className="mt-1 min-h-0 flex-1" style={{ minHeight: "4rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" tick={{ fontSize: 9 }} />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 9 }} width={16} />
                  <Tooltip contentStyle={chartTooltipBar} />
                  <Bar dataKey="v" fill="var(--primary)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
