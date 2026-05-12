import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Users, Target, Wallet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const chartData = [
  { m: "Sept", v: 4 },
  { m: "Oct", v: 7 },
  { m: "Nov", v: 6 },
  { m: "Déc", v: 3 },
  { m: "Jan", v: 9 },
  { m: "Fév", v: 12 },
  { m: "Mar", v: 11 },
];

const metrics = [
  {
    k: "01",
    label: "INSCRIPTIONS (ANNÉE EN COURS)",
    value: "52",
    sub: "Depuis septembre",
    borderClass: "border-t-zinc-900",
    icon: Users,
  },
  {
    k: "02",
    label: "TAUX DE CONVERSION",
    value: "34 %",
    sub: "Prospects → familles inscrites",
    borderClass: "border-t-zinc-600",
    icon: Target,
  },
  {
    k: "03",
    label: "PROGRESSION MOIS / MOIS",
    value: "+18 %",
    sub: "Par rapport au mois précédent",
    borderClass: "border-t-zinc-400",
    icon: TrendingUp,
  },
  {
    k: "04",
    label: "REVENU PRÉVISIONNEL",
    value: "312 k MAD",
    sub: "Projection sur la saison",
    borderClass: "border-t-zinc-300",
    icon: Wallet,
  },
] as const;

const chartTooltip = {
  background: "#ffffff",
  border: "1px solid #d4d4d8",
  borderRadius: 0,
  color: "#09090b",
} as const;

export const Route = createFileRoute("/crm/rapports")({
  head: () => ({ meta: [{ title: "Rapports — CRM" }] }),
  component: () => (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Analyse — CRM</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-zinc-950">
            <span className="font-semibold">Rapports</span>{" "}
            <span className="font-normal italic text-zinc-500">et indicateurs</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Synthèse des inscriptions et de l&apos;activité commerciale (données de démonstration).
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.k}
              className={`relative overflow-hidden border border-zinc-200 bg-white p-5 ${card.borderClass} border-t-4`}
            >
              <p className="pr-14 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {card.k} — {card.label}
              </p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <p className="font-display text-3xl font-semibold tracking-tight text-zinc-950">{card.value}</p>
                <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-800">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              {card.sub && <p className="mt-1 text-xs text-zinc-600">{card.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="border border-zinc-200 bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Graphique</p>
        <h2 className="mt-1 font-display text-xl text-zinc-950">
          Inscriptions <span className="font-normal italic text-zinc-500">par mois</span>
        </h2>
        <p className="mt-1 text-xs text-zinc-600">Volume mensuel sur la période affichée (démo).</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
              <XAxis dataKey="m" stroke="#52525b" fontSize={12} />
              <YAxis stroke="#52525b" fontSize={12} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="v" fill="#18181b" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  ),
});
