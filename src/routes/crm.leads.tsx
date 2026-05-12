import { createFileRoute } from "@tanstack/react-router";

const stages = ["Nouveau", "Contacté", "Rendez-vous", "Visite effectuée"] as const;

const cards: Record<(typeof stages)[number], { n: string; e: string; p: string }[]> = {
  Nouveau: [
    { n: "Famille Alaoui", e: "5 ans · MS", p: "Site web" },
    { n: "Famille Cherkaoui", e: "8 ans · CE2", p: "Instagram" },
  ],
  Contacté: [{ n: "Famille Bennani", e: "6 ans · CP", p: "Bouche-à-oreille" }],
  "Rendez-vous": [{ n: "Famille Idrissi", e: "7 ans · CE1", p: "Partenaire" }],
  "Visite effectuée": [{ n: "Famille Tahiri", e: "4 ans · PS", p: "Site web" }],
};

export const Route = createFileRoute("/crm/leads")({
  head: () => ({ meta: [{ title: "Prospects — CRM" }] }),
  component: () => (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Fil commercial — CRM</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-zinc-950">
            <span className="font-semibold">Prospects</span>{" "}
            <span className="font-normal italic text-zinc-500">et pipeline</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Suivi des familles en cours d&apos;inscription, par étape du parcours (données de démonstration).
          </p>
        </div>
      </header>

      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
        <div className="flex min-w-max gap-4 lg:grid lg:min-w-0 lg:w-full lg:grid-cols-4">
          {stages.map((s) => (
            <div
              key={s}
              className="w-[min(17.5rem,calc(100vw-2.5rem))] shrink-0 border border-zinc-200 bg-white p-4 lg:w-auto lg:min-w-0"
            >
              <h3 className="border-b border-zinc-200 pb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {s}
              </h3>
              <div className="mt-3 space-y-3">
                {cards[s].map((c) => (
                  <div
                    key={c.n}
                    className="border border-zinc-200 bg-zinc-50 p-3 transition hover:border-zinc-400"
                  >
                    <p className="text-sm font-medium text-zinc-950">{c.n}</p>
                    <p className="mt-0.5 text-xs text-zinc-600">{c.e}</p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Source · {c.p}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});
