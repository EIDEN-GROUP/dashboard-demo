import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Calendar, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord   Plateforme" }] }),
  component: AdminDash,
});

/** Démo — alignée sur le tableau de bord admin EducazenKids (structure & libellés). */
const ordersEvolution = [
  { m: "Déc", v: 0 },
  { m: "Jan", v: 0 },
  { m: "Fév", v: 0 },
  { m: "Mar", v: 0 },
  { m: "Avr", v: 0 },
  { m: "Mai", v: 1 },
];

const chartTooltip = {
  background: "#ffffff",
  border: "1px solid #d4d4d8",
  borderRadius: 0,
  color: "#18181b",
} as const;

function AdminDash() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Chapitre 03 — Vue d&apos;ensemble
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-zinc-900">
              <span className="font-semibold">Tableau de </span>
              <span className="font-medium italic text-zinc-600">bord</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500">Vue d&apos;ensemble de votre activité</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center border border-zinc-300 bg-zinc-100 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-800">
              Commandes
            </span>
            <span className="inline-flex items-center border border-zinc-300 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Rendez-vous
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="group border border-zinc-200 bg-white p-6 transition hover:border-zinc-400">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">01 — Commandes</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-900">
              <ShoppingBag className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-zinc-900">1</p>
          <p className="mt-1 text-sm text-zinc-500">Total des commandes reçues</p>
          <span className="mt-4 inline-flex border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
            +100%
          </span>
          <Link
            to="/admin/commandes"
            className="mt-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:underline"
          >
            Voir le détail
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </article>

        <article className="group border border-zinc-200 bg-white p-6 transition hover:border-zinc-400">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">02 — Rendez-vous</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-900">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-zinc-900">11</p>
          <p className="mt-1 text-sm text-zinc-500">Demandes et créneaux</p>
          <span className="mt-4 inline-flex border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
            +100%
          </span>
          <Link
            to="/admin/rendez-vous"
            className="mt-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:underline"
          >
            Voir le détail
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      </section>

      <section className="border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">03 — Activité</p>
            <h2 className="mt-1 font-display text-xl text-zinc-900 md:text-2xl">
              <span className="font-semibold">Évolution des </span>
              <span className="font-medium italic text-zinc-600">commandes</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Sur les 6 derniers mois (démo)</p>
          </div>
          <div className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800">
            <span className="h-2 w-2 shrink-0 bg-zinc-900" />
            Commandes
          </div>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ordersEvolution}>
              <defs>
                <linearGradient id="adminOrdersGrayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#525252" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#525252" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="m" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
              <Tooltip contentStyle={chartTooltip} />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#171717"
                strokeWidth={2}
                fill="url(#adminOrdersGrayGrad)"
                dot={{ r: 3, fill: "#171717", strokeWidth: 0 }}
                activeDot={{ r: 4, fill: "#171717" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">04 — Navigation</p>
        <h2 className="mt-1 font-display text-2xl text-zinc-900">
          <span className="font-semibold">Actions </span>
          <span className="font-medium italic text-zinc-600">rapides</span>
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/commandes"
            className="group flex items-center justify-between gap-4 border border-zinc-200 bg-white p-5 transition hover:border-zinc-400"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-900">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-zinc-900">Voir les commandes</p>
                <p className="mt-0.5 text-sm text-zinc-500">Gérer les commandes clients</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:text-zinc-900" />
          </Link>
          <Link
            to="/admin/rendez-vous"
            className="group flex items-center justify-between gap-4 border border-zinc-200 bg-white p-5 transition hover:border-zinc-400"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-900">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-zinc-900">Voir les rendez-vous</p>
                <p className="mt-0.5 text-sm text-zinc-500">Répondre aux demandes</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:text-zinc-900" />
          </Link>
        </div>
      </section>
    </div>
  );
}
