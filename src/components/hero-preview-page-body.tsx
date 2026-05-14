import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Plus, Search, XCircle } from "lucide-react";
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
  type DashboardMiniaturePageId,
} from "@/lib/dashboard-mirror-data";

const tagClass =
  "inline-flex items-center border border-zinc-300 bg-zinc-100 px-1.5 py-px text-[5px] font-semibold uppercase tracking-wider text-zinc-800 sm:text-[6px]";

const badgeClass =
  "absolute right-1 top-1 border border-zinc-300 bg-white px-1 py-px text-[5px] font-medium text-zinc-700 sm:right-1.5 sm:top-1.5";

const chartTooltipBar = {
  background: "#ffffff",
  border: "1px solid #d4d4d8",
  borderRadius: 0,
  color: "#09090b",
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
            <p className="text-[6px] font-medium uppercase tracking-[0.18em] text-zinc-500">Vue d&apos;ensemble — CRM</p>
            <p className="font-display text-[9px] font-semibold leading-tight text-zinc-950 sm:text-[10px]">
              <span className="font-semibold">Tableau</span> <span className="font-normal italic text-zinc-500">de bord</span>
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
                  "relative block border border-zinc-200 bg-white p-1.5 text-left text-inherit no-underline sm:p-2",
                  card.borderClass,
                  "border-t-2",
                )}
              >
                <span className={badgeClass}>{card.badge}</span>
                <p className="pr-8 text-[5px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[6px]">
                  {card.k} — {card.label}
                </p>
                <div className="mt-1 flex items-start justify-between gap-1">
                  <p className="font-display text-[11px] font-semibold leading-none text-zinc-900 sm:text-xs">{card.value}</p>
                  <span className="grid h-5 w-5 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-800 sm:h-6 sm:w-6">
                    <card.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                </div>
                {card.sub ? <p className="mt-0.5 text-[5px] text-zinc-600 sm:text-[6px]">{card.sub}</p> : null}
              </Link>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col border border-zinc-200 bg-white p-1.5 sm:p-2">
              <p className="text-[5px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-[6px]">Actions rapides</p>
              <h2 className="mt-0.5 font-display text-[8px] text-zinc-950 sm:text-[9px]">
                Navigation <span className="font-normal italic text-zinc-500">rapide</span>
              </h2>
              <ul className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
                {mirrorQuickActions.map((a) => {
                  const QIcon = a.icon;
                  return (
                    <li key={a.title}>
                      <button
                        type="button"
                        onClick={() => showLocked(`${a.title} : connectez-vous pour ouvrir cette action.`)}
                        className="group flex w-full items-start gap-1 border border-transparent p-1 text-left transition hover:border-zinc-200 hover:bg-zinc-50"
                      >
                        <span className="mt-px grid h-5 w-5 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-800">
                          <QIcon className="h-2.5 w-2.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-1">
                            <span className="text-[6px] font-medium text-zinc-950 sm:text-[7px]">{a.title}</span>
                            <ArrowUpRight className="h-2.5 w-2.5 shrink-0 text-zinc-500" />
                          </span>
                          <span className="mt-px block text-[5px] leading-snug text-zinc-600 sm:text-[6px]">{a.desc}</span>
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
            <p className="text-[6px] font-medium uppercase tracking-[0.18em] text-zinc-500">CRM — Gestion</p>
            <p className="font-display text-[9px] font-semibold text-zinc-950 sm:text-[10px]">
              Mes <span className="italic text-zinc-600">clients</span>
            </p>
          </div>
          <button type="button" className={cn(previewBtn, "shrink-0 self-start")} onClick={() => showLocked("Ajouter un client : après connexion.")}>
            <Plus className="h-2 w-2" /> Ajouter
          </button>
          <div className="shrink-0 border border-zinc-200 bg-white p-1">
            <p className="text-[5px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Filtres & recherche</p>
            <div className="mt-1 flex items-center gap-0.5 border border-zinc-200 bg-zinc-50 px-1 py-0.5">
              <Search className="h-2 w-2 shrink-0 text-zinc-400" />
              <span className="text-[5px] text-zinc-400">Rechercher…</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-1 py-0.5">
              <p className="text-[5px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Liste des clients</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-[5px] sm:text-[6px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[5px] font-semibold uppercase tracking-wider text-zinc-600">
                    <th className="px-1 py-0.5">Parent</th>
                    <th className="px-1 py-0.5">Enfant</th>
                    <th className="px-1 py-0.5">Stade</th>
                    <th className="px-1 py-0.5">Paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {mirrorClients.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50/80">
                      <td className="px-1 py-0.5 font-medium text-zinc-950">{c.parent}</td>
                      <td className="px-1 py-0.5 text-zinc-800">{c.child}</td>
                      <td className="px-1 py-0.5">
                        <span className="inline-flex items-center gap-0.5 border border-zinc-300 bg-zinc-50 px-0.5 py-px text-[5px] font-semibold uppercase">
                          {c.stade}
                        </span>
                      </td>
                      <td className="px-1 py-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 border px-0.5 py-px text-[5px] font-semibold uppercase",
                            c.payment === "paye" ? "border-zinc-800 bg-zinc-900 text-white" : "border-zinc-300 bg-zinc-100 text-zinc-800",
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
            <p className="text-[6px] font-medium uppercase tracking-[0.18em] text-zinc-500">CRM — Paiements</p>
            <p className="font-display text-[9px] text-zinc-950 sm:text-[10px]">
              Historique des <span className="italic text-zinc-600">paiements</span>
            </p>
          </div>
          <button type="button" className={cn(previewBtn, "inline-flex shrink-0 gap-0.5 self-start")} onClick={() => showLocked("Export CSV : après connexion.")}>
            Exporter
          </button>
          <div className="shrink-0 border border-zinc-200 bg-white p-1">
            <p className="text-[5px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Filtres et recherche</p>
            <div className="mt-0.5 flex items-center gap-0.5 border border-zinc-200 bg-zinc-50 px-1 py-0.5">
              <Search className="h-2 w-2 text-zinc-400" />
              <span className="text-[5px] text-zinc-400">Rechercher…</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-[5px] sm:text-[6px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[5px] font-semibold uppercase tracking-wider text-zinc-600">
                    <th className="px-1 py-0.5">Parent</th>
                    <th className="px-1 py-0.5">Enfant</th>
                    <th className="px-1 py-0.5">Montant</th>
                    <th className="px-1 py-0.5">Date</th>
                    <th className="px-1 py-0.5">Mode</th>
                    <th className="px-1 py-0.5">Reçu</th>
                    <th className="px-1 py-0.5">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {mirrorPaymentRows.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/80">
                      <td className="px-1 py-0.5 font-medium text-zinc-950">{r.parent}</td>
                      <td className="px-1 py-0.5 text-zinc-800">{r.enfant}</td>
                      <td className="px-1 py-0.5 font-semibold tabular-nums">{r.montant} MAD</td>
                      <td className="px-1 py-0.5 tabular-nums text-zinc-800">{r.date}</td>
                      <td className="px-1 py-0.5">
                        <span className="inline-flex items-center gap-0.5 border border-zinc-800 bg-zinc-900 px-0.5 py-px text-[5px] font-semibold uppercase text-white">
                          {r.mode}
                        </span>
                      </td>
                      <td className="px-1 py-0.5 font-mono text-[5px] text-zinc-800">{r.recu}</td>
                      <td className="px-1 py-0.5">
                        <span className="border border-zinc-300 bg-zinc-50 px-0.5 py-px text-[5px] text-zinc-800">
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
              <p className="text-[6px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Demandes — CRM</p>
              <p className="font-display text-[9px] text-zinc-900 sm:text-[10px]">
                <span className="font-semibold">Gestion des </span>
                <span className="font-medium italic text-zinc-600">rendez-vous</span>
              </p>
            </div>
            <button type="button" className={cn(previewBtn, "gap-0.5")} onClick={() => showLocked("Exporter CSV : après connexion.")}>
              CSV
            </button>
          </div>
          <div className="shrink-0 border border-zinc-200 bg-white p-1">
            <div className="flex items-center gap-0.5 border border-zinc-200 bg-zinc-50 px-1 py-0.5">
              <Search className="h-2 w-2 text-zinc-500" />
              <span className="text-[5px] text-zinc-400">Rechercher…</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[260px] text-left text-[5px] sm:text-[6px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {["Nom", "Email", "Date", "Sujet"].map((h) => (
                      <th key={h} className="px-1 py-0.5 text-[5px] font-semibold uppercase tracking-wider text-zinc-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mirrorDemandes.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-100">
                      <td className="px-1 py-0.5 font-medium text-zinc-900">{r.nom}</td>
                      <td className="max-w-[4rem] truncate px-1 py-0.5 text-zinc-700">{r.email}</td>
                      <td className="px-1 py-0.5 tabular-nums">{r.dateTable}</td>
                      <td className="max-w-[4rem] truncate px-1 py-0.5 text-zinc-600">{r.sujet}</td>
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
            <p className="text-[6px] font-medium uppercase tracking-[0.22em] text-zinc-500">Équipe — CRM</p>
            <p className="font-display text-[9px] leading-tight text-zinc-950 sm:text-[10px]">
              <span className="font-semibold">Affiches</span> <span className="font-normal italic text-zinc-500">et personnel</span>
            </p>
            <p className="text-[5px] text-zinc-600 sm:text-[6px]">Liste des employés et leur statut (démo).</p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-1 py-0.5">
              <p className="text-[5px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Liste des employés</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-[5px] sm:text-[6px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[5px] font-semibold uppercase tracking-wider text-zinc-600">
                    <th className="px-1 py-0.5">Nom</th>
                    <th className="px-1 py-0.5">Poste</th>
                    <th className="px-1 py-0.5">Département</th>
                    <th className="px-1 py-0.5">Contact</th>
                    <th className="px-1 py-0.5">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {mirrorEmployes.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/80">
                      <td className="px-1 py-0.5 font-medium text-zinc-950">{e.nomComplet}</td>
                      <td className="px-1 py-0.5 text-zinc-800">{e.poste}</td>
                      <td className="px-1 py-0.5 text-zinc-700">{e.departement}</td>
                      <td className="px-1 py-0.5 text-zinc-700">
                        <span className="block truncate max-w-[5rem]">{e.email}</span>
                        <span className="mt-px block text-[5px] text-zinc-500">{e.tel}</span>
                      </td>
                      <td className="px-1 py-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 border px-0.5 py-px text-[5px] font-semibold uppercase",
                            e.statut === "actif" ? "border-zinc-800 bg-zinc-900 text-white" : "border-zinc-300 bg-zinc-50 text-zinc-800",
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

    case "rapports":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
          <div className="shrink-0">
            <p className="text-[6px] font-medium uppercase tracking-[0.22em] text-zinc-500">Analyse — CRM</p>
            <p className="font-display text-[9px] leading-tight text-zinc-950 sm:text-[10px]">
              <span className="font-semibold">Rapports</span> <span className="font-normal italic text-zinc-500">et indicateurs</span>
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-0.5">
            <button
              type="button"
              className="relative block border border-zinc-200 bg-white p-1.5 text-left border-t-2 border-t-zinc-600 sm:p-2"
              onClick={() => showLocked("Liste familles payées : modal dans l'app connectée.")}
            >
              <p className="pr-6 text-[5px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[6px]">01 — Payé</p>
              <div className="mt-0.5 flex items-start justify-between gap-1">
                <p className="font-display text-[11px] font-semibold text-zinc-950 sm:text-xs">{mirrorRapportsPayeCount}</p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-zinc-300 bg-zinc-100 text-zinc-800">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                </span>
              </div>
              <p className="mt-0.5 text-[5px] text-zinc-600 sm:text-[6px]">Familles avec paiement à jour</p>
            </button>
            <button
              type="button"
              className="relative block border border-zinc-200 bg-white p-1.5 text-left border-t-2 border-t-zinc-800 sm:p-2"
              onClick={() => showLocked("Liste familles impayées : modal dans l'app connectée.")}
            >
              <p className="pr-6 text-[5px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[6px]">02 — Impayé</p>
              <div className="mt-0.5 flex items-start justify-between gap-1">
                <p className="font-display text-[11px] font-semibold text-zinc-950 sm:text-xs">{mirrorRapportsImpayeCount}</p>
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-zinc-400 bg-zinc-200 text-zinc-900">
                  <XCircle className="h-2.5 w-2.5" />
                </span>
              </div>
              <p className="mt-0.5 text-[5px] text-zinc-600 sm:text-[6px]">Sans règlement ou dette ouverte</p>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col border border-zinc-200 bg-white p-1 sm:p-1.5">
            <p className="text-[5px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-[6px]">Graphique</p>
            <h2 className="mt-0.5 font-display text-[8px] text-zinc-950 sm:text-[9px]">
              Inscriptions <span className="font-normal italic text-zinc-500">par mois</span>
            </h2>
            <div className="mt-1 min-h-0 flex-1" style={{ minHeight: "4rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...mirrorRapportsChart]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
                  <XAxis dataKey="m" stroke="#52525b" tick={{ fontSize: 7 }} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 7 }} width={14} />
                  <Tooltip contentStyle={chartTooltipBar} />
                  <Bar dataKey="v" fill="#18181b" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
