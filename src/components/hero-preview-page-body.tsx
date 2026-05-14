import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Plus, Search, Users, XCircle } from "lucide-react";
import { CartesianGrid, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  mirrorClients,
  mirrorDemandes,
  mirrorEmployes,
  mirrorFilterTags,
  mirrorMetrics,
  mirrorPaymentRows,
  mirrorQuickActions,
  mirrorRapportsChart,
  mirrorRapportsImpayeCount,
  mirrorRapportsPayeCount,
  mirrorRapportsTotalFamilles,
  type DashboardMiniaturePageId,
} from "@/lib/dashboard-mirror-data";

const tagClass =
  "inline-flex items-center border border-border bg-muted px-2 py-0.5 text-[7px] font-semibold uppercase tracking-wider text-foreground/90 sm:text-[8px]";

const badgeClass =
  "absolute right-1 top-1 border border-border bg-card px-1 py-px text-[7px] font-medium text-muted-foreground sm:right-1.5 sm:top-1.5 sm:text-[8px]";

const chartTooltipBar = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--foreground)",
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
  switch (page) {
    case "dashboard":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto">
          <div className="shrink-0 space-y-0.5">
            <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Vue d&apos;ensemble — CRM</p>
            <p className="font-display text-[11px] font-semibold leading-tight text-foreground sm:text-[12px]">
              <span className="font-semibold">Tableau</span> <span className="font-normal italic text-muted-foreground">de bord</span>
            </p>
            <div className="flex flex-wrap gap-0.5 pt-0.5">
              {mirrorFilterTags.map((label) => (
                <span key={label} className={tagClass}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-0.5 sm:grid-cols-4">
            {mirrorMetrics.map((card) => (
              <Link
                key={card.k}
                to={card.k === "01" || card.k === "02" ? "/dashboard/familles" : "/dashboard/rapports"}
                onClick={(e) => {
                  e.preventDefault();
                  showLocked("Ouvrez la session pour accéder à cette fiche depuis le tableau de bord réel.");
                }}
                className={cn(
                  "relative block border border-border bg-card p-1.5 text-left text-inherit no-underline sm:p-2",
                  card.borderClass,
                  "border-t-2",
                )}
              >
                <span className={badgeClass}>{card.badge}</span>
                <p className="pr-8 text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                  {card.k} — {card.label}
                </p>
                <div className="mt-1 flex items-start justify-between gap-1">
                  <p className="font-display text-[13px] font-semibold leading-none text-foreground sm:text-sm">{card.value}</p>
                  <span className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground/85 sm:h-6 sm:w-6">
                    <card.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                </div>
                {card.sub ? <p className="mt-0.5 text-[7px] text-muted-foreground sm:text-[8px]">{card.sub}</p> : null}
              </Link>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col border border-border bg-card p-1.5 sm:p-2">
              <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[8px]">Actions rapides</p>
              <h2 className="mt-0.5 font-display text-[10px] text-foreground sm:text-[11px]">
                Navigation <span className="font-normal italic text-muted-foreground">rapide</span>
              </h2>
              <ul className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
                {mirrorQuickActions.map((a) => {
                  const QIcon = a.icon;
                  return (
                    <li key={a.title}>
                      <button
                        type="button"
                        onClick={() => showLocked(`${a.title} : connectez-vous pour ouvrir cette action.`)}
                        className="group flex w-full items-start gap-1 border border-transparent p-1 text-left transition hover:border-border hover:bg-muted/70"
                      >
                        <span className="mt-px grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground/85">
                          <QIcon className="h-2.5 w-2.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-1">
                            <span className="text-[8px] font-medium text-foreground sm:text-[9px]">{a.title}</span>
                            <ArrowUpRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                          </span>
                          <span className="mt-px block text-[7px] leading-snug text-muted-foreground sm:text-[8px]">{a.desc}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
          </div>
        </div>
      );

    case "familles":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <div className="shrink-0 space-y-0.5">
            <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground">CRM — Gestion</p>
            <p className="font-display text-[11px] font-semibold text-foreground sm:text-[12px]">
              Mes <span className="italic text-muted-foreground">clients</span>
            </p>
          </div>
          <button type="button" className={cn(previewBtn, "shrink-0 self-start")} onClick={() => showLocked("Ajouter un client : après connexion.")}>
            <Plus className="h-2.5 w-2.5" /> Ajouter
          </button>
          <div className="shrink-0 border border-border bg-card p-1">
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">Filtres & recherche</p>
            <div className="mt-1 flex items-center gap-0.5 border border-border bg-muted px-1 py-0.5">
              <Search className="h-2.5 w-2.5 shrink-0 text-muted-foreground/80" />
              <span className="text-[7px] text-muted-foreground/80 sm:text-[8px]">Rechercher…</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="border-b border-border px-1 py-0.5">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">Liste des clients</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    <th className="px-1 py-0.5">Parent</th>
                    <th className="px-1 py-0.5">Enfant</th>
                    <th className="px-1 py-0.5">Stade</th>
                    <th className="px-1 py-0.5">Paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mirrorClients.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/80">
                      <td className="px-1 py-0.5 font-medium text-foreground">{c.parent}</td>
                      <td className="px-1 py-0.5 text-foreground/85">{c.child}</td>
                      <td className="px-1 py-0.5">
                        <span className="inline-flex items-center gap-0.5 border border-border bg-muted px-0.5 py-px text-[7px] font-semibold uppercase sm:text-[8px]">
                          {c.stade}
                        </span>
                      </td>
                      <td className="px-1 py-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 border px-0.5 py-px text-[7px] font-semibold uppercase sm:text-[8px]",
                            c.payment === "paye" ? "border-border bg-foreground text-background" : "border-border bg-muted text-foreground/85",
                          )}
                        >
                          {c.payment}
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
            <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground">CRM — Paiements</p>
            <p className="font-display text-[11px] text-foreground sm:text-[12px]">
              Historique des <span className="italic text-muted-foreground">paiements</span>
            </p>
          </div>
          <button type="button" className={cn(previewBtn, "inline-flex shrink-0 gap-0.5 self-start")} onClick={() => showLocked("Export CSV : après connexion.")}>
            Exporter
          </button>
          <div className="shrink-0 border border-border bg-card p-1">
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">Filtres et recherche</p>
            <div className="mt-0.5 flex items-center gap-0.5 border border-border bg-muted px-1 py-0.5">
              <Search className="h-2.5 w-2.5 text-muted-foreground/80" />
              <span className="text-[7px] text-muted-foreground/80 sm:text-[8px]">Rechercher…</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    <th className="px-1 py-0.5">Parent</th>
                    <th className="px-1 py-0.5">Enfant</th>
                    <th className="px-1 py-0.5">Montant</th>
                    <th className="px-1 py-0.5">Date</th>
                    <th className="px-1 py-0.5">Mode</th>
                    <th className="px-1 py-0.5">Reçu</th>
                    <th className="px-1 py-0.5">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mirrorPaymentRows.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/80">
                      <td className="px-1 py-0.5 font-medium text-foreground">{r.parent}</td>
                      <td className="px-1 py-0.5 text-foreground/85">{r.enfant}</td>
                      <td className="px-1 py-0.5 font-semibold tabular-nums">{r.montant} MAD</td>
                      <td className="px-1 py-0.5 tabular-nums text-foreground/85">{r.date}</td>
                      <td className="px-1 py-0.5">
                        <span className="inline-flex items-center gap-0.5 border border-border bg-foreground px-0.5 py-px text-[7px] font-semibold uppercase text-background sm:text-[8px]">
                          {r.mode}
                        </span>
                      </td>
                      <td className="px-1 py-0.5 font-mono text-[7px] text-foreground/85 sm:text-[8px]">{r.recu}</td>
                      <td className="px-1 py-0.5">
                        <span className="border border-border bg-muted px-0.5 py-px text-[7px] text-foreground/85 sm:text-[8px]">
                          {r.facture === "non_envoye" ? "Non envoyé" : "Envoyé"}
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
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Demandes — CRM</p>
              <p className="font-display text-[11px] text-foreground sm:text-[12px]">
                <span className="font-semibold">Gestion des </span>
                <span className="font-medium italic text-muted-foreground">rendez-vous</span>
              </p>
            </div>
            <button type="button" className={cn(previewBtn, "gap-0.5")} onClick={() => showLocked("Exporter CSV : après connexion.")}>
              CSV
            </button>
          </div>
          <div className="shrink-0 border border-border bg-card p-1">
            <div className="flex items-center gap-0.5 border border-border bg-muted px-1 py-0.5">
              <Search className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[7px] text-muted-foreground/80 sm:text-[8px]">Rechercher…</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[260px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {["Nom", "Email", "Date", "Sujet"].map((h) => (
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
            <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Équipe — CRM</p>
            <p className="font-display text-[11px] leading-tight text-foreground sm:text-[12px]">
              <span className="font-semibold">Affiches</span> <span className="font-normal italic text-muted-foreground">et personnel</span>
            </p>
            <p className="text-[7px] text-muted-foreground sm:text-[8px]">Liste des employés et leur statut (démo).</p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-border bg-card">
            <div className="border-b border-border px-1 py-0.5">
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[8px]">Liste des employés</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-[7px] sm:text-[8px]">
                <thead>
                  <tr className="border-b border-border bg-muted text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">
                    <th className="px-1 py-0.5">Nom</th>
                    <th className="px-1 py-0.5">Poste</th>
                    <th className="px-1 py-0.5">Département</th>
                    <th className="px-1 py-0.5">Contact</th>
                    <th className="px-1 py-0.5">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mirrorEmployes.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/80">
                      <td className="px-1 py-0.5 font-medium text-foreground">{e.nomComplet}</td>
                      <td className="px-1 py-0.5 text-foreground/85">{e.poste}</td>
                      <td className="px-1 py-0.5 text-foreground/75">{e.departement}</td>
                      <td className="px-1 py-0.5 text-foreground/75">
                        <span className="block truncate max-w-[5rem]">{e.email}</span>
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
                          {e.statut === "actif" ? "Actif" : "Inactif"}
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
            <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Analyse — CRM</p>
            <div>
              <p className="font-display text-[11px] leading-tight text-foreground sm:text-[12px]">
                <span className="font-semibold">Rapports</span>{" "}
                <span className="font-normal italic text-muted-foreground">et indicateurs</span>
              </p>
              <p className="mt-0.5 text-[7px] leading-snug text-muted-foreground sm:text-[8px]">
                Synthèse des inscriptions et de l&apos;activité commerciale (données de démonstration).
              </p>
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
              <p className="text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">03 — Synthèse</p>
              <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">Payé</p>
                  <p className="font-display text-[12px] font-semibold tabular-nums leading-none text-foreground sm:text-[13px]">
                    {mirrorRapportsPayeCount}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">Impayé</p>
                  <p className="font-display text-[12px] font-semibold tabular-nums leading-none text-foreground sm:text-[13px]">
                    {mirrorRapportsImpayeCount}
                  </p>
                </div>
                <div className="min-w-0 border-l border-border pl-2">
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[8px]">Total familles</p>
                  <p className="font-display text-[13px] font-semibold tabular-nums leading-none text-foreground sm:text-sm">
                    {mirrorRapportsTotalFamilles}
                  </p>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-1 border-t border-border/70 pt-1">
                <p className="min-w-0 flex-1 text-[7px] leading-tight text-muted-foreground sm:text-[8px]">
                  Somme des familles suivies dans ces deux statuts (démo).
                </p>
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground/85"
                  aria-hidden
                >
                  <Users className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>

            <button
              type="button"
              className={cn(rapportsCard, "border-t-chart-4 hover:border-border hover:bg-muted/60")}
              onClick={() => showLocked("Liste familles payées : ouvrez une session pour la liste complète.")}
            >
              <p className="pr-5 text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">01 — Payé</p>
              <div className="mt-0.5 flex items-start justify-between gap-1">
                <p className="font-display text-[13px] font-semibold text-foreground sm:text-sm">{mirrorRapportsPayeCount}</p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground/85">
                  <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
                </span>
              </div>
              <p className="mt-0.5 text-[7px] leading-tight text-muted-foreground sm:text-[8px]">
                Familles avec paiement à jour (mois en cours)
              </p>
            </button>

            <button
              type="button"
              className={cn(rapportsCard, "border-t-chart-3 hover:border-border hover:bg-muted/60")}
              onClick={() => showLocked("Liste familles impayées : ouvrez une session pour la liste complète.")}
            >
              <p className="pr-5 text-[7px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[8px]">02 — Impayé</p>
              <div className="mt-0.5 flex items-start justify-between gap-1">
                <p className="font-display text-[13px] font-semibold text-foreground sm:text-sm">{mirrorRapportsImpayeCount}</p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-border bg-muted text-foreground">
                  <XCircle className="h-2.5 w-2.5" aria-hidden />
                </span>
              </div>
              <p className="mt-0.5 text-[7px] leading-tight text-muted-foreground sm:text-[8px]">
                Sans règlement ou avec dette ouverte
              </p>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border border-border bg-card p-1 sm:p-1.5">
            <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[8px]">Graphique</p>
            <h2 className="mt-0.5 font-display text-[10px] text-foreground sm:text-[11px]">
              Inscriptions <span className="font-normal italic text-muted-foreground">par mois</span>
            </h2>
            <p className="mt-0.5 text-[7px] text-muted-foreground sm:text-[8px]">Volume mensuel sur la période affichée (démo).</p>
            <div className="mt-1 min-h-0 flex-1" style={{ minHeight: "4rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...mirrorRapportsChart]}>
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
