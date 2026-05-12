import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm/paiements")({
  head: () => ({ meta: [{ title: "Paiements   CRM" }] }),
  component: CrmPaiementsPage,
});

type FactureStat = "envoye" | "non_envoye";

type PaymentRow = {
  id: string;
  parent: string;
  enfant: string;
  montant: number;
  date: string;
  mode: string;
  periode: string;
  recu: string;
  facture: FactureStat;
};

const inputClass =
  "rounded-none border-zinc-300 bg-white shadow-none focus-visible:border-zinc-950 focus-visible:ring-0";

const selectTriggerClass =
  "h-10 rounded-none border-zinc-300 bg-white shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-zinc-400";

const rowsSeed: PaymentRow[] = [
  {
    id: "1",
    parent: "essafar basma",
    enfant: "Enfant de 13 ans",
    montant: 1800,
    date: "05/05/2026",
    mode: "ESPÈCES",
    periode: "mai 2026",
    recu: "EDU-20260505-115",
    facture: "non_envoye",
  },
  {
    id: "2",
    parent: "essafar basma",
    enfant: "Enfant de 13 ans",
    montant: 1800,
    date: "05/05/2026",
    mode: "ESPÈCES",
    periode: "mai 2026",
    recu: "EDU-20260505-253",
    facture: "non_envoye",
  },
];

function exportCsv(lines: PaymentRow[]) {
  const header = ["Parent", "Enfant", "Montant (MAD)", "Date", "Mode", "Période", "Reçu", "Facture"];
  const body = lines.map((r) =>
    [
      r.parent,
      r.enfant,
      String(r.montant),
      r.date,
      r.mode,
      r.periode,
      r.recu,
      r.facture === "non_envoye" ? "Non envoyé" : "Envoyé",
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "paiements-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function CrmPaiementsPage() {
  const [rows] = useState<PaymentRow[]>(rowsSeed);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("tous");
  const [factureFilter, setFactureFilter] = useState("tous");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (modeFilter !== "tous" && r.mode.toLowerCase() !== modeFilter.toLowerCase()) return false;
      if (factureFilter === "envoye" && r.facture !== "envoye") return false;
      if (factureFilter === "non_envoye" && r.facture !== "non_envoye") return false;
      if (!q) return true;
      const blob = `${r.parent} ${r.recu}`.toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search, modeFilter, factureFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">CRM — Paiements</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-zinc-950 md:text-4xl">
            Historique des <span className="italic text-zinc-600">paiements</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">Historique et gestion des paiements parents</p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          <Download className="h-4 w-4" />
          Exporter
        </button>
      </header>

      <section className="border border-zinc-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Filtres et recherche</p>
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par parent, reçu…"
              className={cn(inputClass, "pl-10")}
              aria-label="Recherche paiements"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className={selectTriggerClass} aria-label="Mode de paiement">
                <SelectValue placeholder="Tous les modes" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-zinc-200">
                <SelectItem value="tous">Tous les modes</SelectItem>
                <SelectItem value="espèces">Espèces</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="carte">Carte</SelectItem>
                <SelectItem value="chèque">Chèque</SelectItem>
              </SelectContent>
            </Select>
            <Select value={factureFilter} onValueChange={setFactureFilter}>
              <SelectTrigger className={selectTriggerClass} aria-label="Facture">
                <SelectValue placeholder="Tous les factures" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-zinc-200">
                <SelectItem value="tous">Tous les factures</SelectItem>
                <SelectItem value="non_envoye">Non envoyé</SelectItem>
                <SelectItem value="envoye">Envoyé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Enfant</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Reçu</th>
                <th className="px-4 py-3">Facture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium text-zinc-950">{r.parent}</td>
                  <td className="px-4 py-3 text-zinc-800">{r.enfant}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-zinc-950">{r.montant} MAD</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-800">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      <span className="h-1 w-1 shrink-0 bg-white" aria-hidden />
                      {r.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-800">{r.periode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-800">{r.recu}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        r.facture === "non_envoye"
                          ? "border-zinc-300 bg-zinc-50 text-zinc-800"
                          : "border-zinc-800 bg-zinc-200 text-zinc-900",
                      )}
                    >
                      <span className="h-1 w-1 shrink-0 bg-current" aria-hidden />
                      {r.facture === "non_envoye" ? "Non envoyé" : "Envoyé"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">Aucun paiement ne correspond aux filtres.</p>
        ) : null}
      </section>
    </div>
  );
}
