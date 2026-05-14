import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useState } from "react";
import { CheckCircle2, Search, Users, XCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const chartData = [
  { m: "Sept", v: 4 },
  { m: "Oct", v: 7 },
  { m: "Nov", v: 6 },
  { m: "Déc", v: 3 },
  { m: "Jan", v: 9 },
  { m: "Fév", v: 12 },
  { m: "Mar", v: 11 },
];

type DemoFamily = {
  id: string;
  parent: string;
  child: string;
  email: string;
  phone: string;
  remarque: string;
};

const CHILD_NAMES = [
  "Yasmine",
  "Mehdi",
  "Sara",
  "Adam",
  "Lina",
  "Youssef",
  "Imane",
  "Rayan",
  "Salma",
  "Anas",
] as const;

const EXTRA_PAYE_SURNAMES = [
  "Amrani",
  "Chraibi",
  "Lahlou",
  "Berrada",
  "Mouline",
  "Ouazzani",
  "Sefrioui",
  "Zerhouni",
  "El Mansouri",
  "Bennani",
  "Cherkaoui",
  "Filali",
  "Hakimi",
  "Jabri",
  "Kettani",
  "Lamrani",
  "Nasri",
  "Ouahbi",
  "Rahmani",
  "Sabri",
  "Tahiri",
  "Zaïdi",
] as const;

const EXTRA_IMPAYE_SURNAMES = [
  "Abbassi",
  "Bouazza",
  "Dahmani",
  "El Idrissi",
  "Fikri",
  "Ghazi",
  "Hamidi",
  "Ibrahimi",
  "Jaafari",
  "Kabbaj",
  "Laâroussi",
  "Mahfoud",
  "Naciri",
  "Oualid",
  "Radi",
  "Saïdi",
  "Temsamani",
  "Umar",
  "Wahbi",
  "Yata",
] as const;

const IMPAYE_REMARQUES = [
  "Aucun règlement enregistré",
  "Dette 1 200 MAD — en retard",
  "Échéance dépassée (15 j.)",
  "Dette 800 MAD",
  "Paiement partiel — solde ouvert",
  "Relance envoyée — sans réponse",
  "Dette 2 400 MAD",
  "Mois en cours non réglé",
  "Dette 450 MAD",
  "Prélevé en erreur — à régulariser",
  "Dette 1 600 MAD — en retard",
  "Aucun mandat actif",
  "Dette 300 MAD",
  "Contrat suspendu — impayé",
  "Dette 950 MAD",
  "Deux mois impayés",
  "Dette 1 100 MAD",
  "En attente de virement",
  "Dette 720 MAD",
  "Justificatif manquant",
] as const;

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildFamillesPayees(): DemoFamily[] {
  const core: DemoFamily[] = [
    {
      id: "2",
      parent: "Famille Alami",
      child: "Yasmine",
      email: "contact.alami@example.com",
      phone: "0661122334",
      remarque: "Paiement à jour",
    },
    {
      id: "4",
      parent: "Tazi / Mehdi",
      child: "Mehdi",
      email: "mehdi.parent@example.com",
      phone: "0622334455",
      remarque: "Paiement à jour",
    },
  ];
  const extra = EXTRA_PAYE_SURNAMES.map((name, i) => ({
    id: `paye-gen-${i}`,
    parent: `Famille ${name}`,
    child: CHILD_NAMES[i % CHILD_NAMES.length],
    email: `famille.${slug(name)}@demo-crm.ma`,
    phone: `06${String(21000000 + i * 91357).padStart(8, "0").slice(0, 8)}`,
    remarque: "Paiement à jour",
  }));
  return [...core, ...extra];
}

function buildFamillesImpayees(): DemoFamily[] {
  const core: DemoFamily[] = [
    {
      id: "1",
      parent: "rztest / testss",
      child: "testss",
      email: "tehgdgh@test.com",
      phone: "0614020520",
      remarque: "Aucun règlement enregistré",
    },
    {
      id: "3",
      parent: "Benjelloun / Sara",
      child: "Sara",
      email: "sara.b@example.com",
      phone: "0611223344",
      remarque: "Dette 1 200 MAD — en retard",
    },
  ];
  const extra = EXTRA_IMPAYE_SURNAMES.map((name, i) => ({
    id: `impaye-gen-${i}`,
    parent: `Famille ${name}`,
    child: CHILD_NAMES[(i + 3) % CHILD_NAMES.length],
    email: `impaye.${slug(name)}@demo-crm.ma`,
    phone: `06${String(31000000 + i * 71717).padStart(8, "0").slice(0, 8)}`,
    remarque: IMPAYE_REMARQUES[i % IMPAYE_REMARQUES.length],
  }));
  return [...core, ...extra];
}

const FAMILLES_PAYEES = buildFamillesPayees();
const FAMILLES_IMPAYEES = buildFamillesImpayees();

const TOTAL_PAYE = FAMILLES_PAYEES.length;
const TOTAL_IMPAYE = FAMILLES_IMPAYEES.length;
const TOTAL_FAMILLES_RAPPORTS = TOTAL_PAYE + TOTAL_IMPAYE;

const chartTooltip = {
  background: "#ffffff",
  border: "1px solid #d4d4d8",
  borderRadius: 0,
  color: "#09090b",
} as const;

/** Même enveloppe que `NouveauClientModal` (dashboard.index) — min-w-0 pour scroll horizontal des tableaux sur mobile */
const listeDialogContent = cn(
  "grid min-w-0 grid-cols-1 gap-0 overflow-hidden border border-zinc-200 bg-white p-0 shadow-none sm:rounded-none rounded-none",
  "max-h-[min(90vh,860px)] w-[min(100vw-1.5rem,640px)] max-w-[min(100vw-1.5rem,640px)] translate-y-[-50%] sm:max-w-[640px]",
  "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-zinc-300 [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-zinc-100 [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0",
);

const cardClass =
  "relative block w-full overflow-hidden border border-zinc-200 bg-white p-5 text-left outline-none transition-colors hover:border-zinc-300 hover:bg-zinc-50/60 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 border-t-4";

const listeSearchInputClass =
  "h-10 rounded-none border-zinc-300 bg-white shadow-none focus-visible:border-zinc-950 focus-visible:ring-0";

function ListeFamillesModal({
  open,
  onOpenChange,
  title,
  eyebrow,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  eyebrow: string;
  rows: DemoFamily[];
}) {
  const searchFieldId = useId();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = [row.parent, row.child, row.email, row.phone, row.remarque].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={listeDialogContent}>
        <DialogDescription className="sr-only min-w-0">
          Liste des familles pour le statut de paiement sélectionné.
        </DialogDescription>
        <div className="min-w-0 max-w-full border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-zinc-950">
              {title}
            </DialogTitle>
            <p className="mt-1 text-xs text-zinc-600">
              {query.trim() ? (
                <>
                  {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} sur {rows.length} — démo
                </>
              ) : (
                <>
                  {rows.length} famille{rows.length > 1 ? "s" : ""} — démo
                </>
              )}
            </p>
          </div>
          <div className="border-b border-zinc-200 px-6 py-3">
            <label htmlFor={searchFieldId} className="sr-only">
              Rechercher dans la liste
            </label>
            <div className="relative min-w-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <Input
                id={searchFieldId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (parent, enfant, e-mail, téléphone…)"
                className={cn(listeSearchInputClass, "pl-10")}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="max-h-[calc(90vh-15.5rem)] min-w-0 w-full max-w-full overflow-x-auto overflow-y-auto scroll-touch border-b border-zinc-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Enfant</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Situation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">
                      Aucune famille ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3 font-medium text-zinc-950">{row.parent}</td>
                      <td className="px-4 py-3 text-zinc-800">{row.child}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        <span className="block">{row.email}</span>
                        <span className="mt-0.5 block text-xs text-zinc-500">{row.phone}</span>
                      </td>
                      <td className="max-w-[11rem] px-4 py-3 text-xs leading-snug text-zinc-600">{row.remarque}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RapportsPage() {
  const [modal, setModal] = useState<null | "paye" | "impaye">(null);

  return (
    <div className="space-y-8">
      <ListeFamillesModal
        open={modal === "paye"}
        onOpenChange={(o) => !o && setModal(null)}
        eyebrow="— Rapports / Paiements"
        title="Familles à jour (payé)"
        rows={FAMILLES_PAYEES}
      />
      <ListeFamillesModal
        open={modal === "impaye"}
        onOpenChange={(o) => !o && setModal(null)}
        eyebrow="— Rapports / Paiements"
        title="Familles impayées"
        rows={FAMILLES_IMPAYEES}
      />

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
          className={cn(
            cardClass,
            "border-t-zinc-900 sm:col-span-2 xl:col-span-1",
            "cursor-default hover:border-zinc-200 hover:bg-white",
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">03 — Synthèse</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Payé</p>
              <p className="font-display text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">{TOTAL_PAYE}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Impayé</p>
              <p className="font-display text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">{TOTAL_IMPAYE}</p>
            </div>
            <div className="min-w-[6rem] border-l border-zinc-200 pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Total familles</p>
              <p className="font-display text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums">{TOTAL_FAMILLES_RAPPORTS}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
            <p className="text-xs text-zinc-600">Somme des familles suivies dans ces deux statuts (démo).</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-300 bg-zinc-50 text-zinc-800" aria-hidden>
              <Users className="h-5 w-5" />
            </span>
          </div>
        </div>

        <button type="button" onClick={() => setModal("paye")} className={cn(cardClass, "border-t-zinc-600")}>
          <p className="pr-14 text-[11px] font-medium uppercase tracking-wider text-zinc-500">01 — Payé</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight text-zinc-950">{TOTAL_PAYE}</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-300 bg-zinc-100 text-zinc-800">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-600">Familles avec paiement à jour (mois en cours)</p>
        </button>

        <button type="button" onClick={() => setModal("impaye")} className={cn(cardClass, "border-t-zinc-800")}>
          <p className="pr-14 text-[11px] font-medium uppercase tracking-wider text-zinc-500">02 — Impayé</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight text-zinc-950">{TOTAL_IMPAYE}</p>
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-400 bg-zinc-200 text-zinc-900">
              <XCircle className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-600">Sans règlement ou avec dette ouverte</p>
        </button>

        
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
  );
}

export const Route = createFileRoute("/dashboard/rapports")({
  head: () => ({ meta: [{ title: "Rapports — CRM" }] }),
  component: RapportsPage,
});
