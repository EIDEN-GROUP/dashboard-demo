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
import { useDashboardI18n } from "@/lib/landing-i18n";
import {
  softCard,
  softInput as inputClass,
  softSelectTrigger as selectTriggerClass,
  softSelectContent,
  ghostPill,
} from "@/lib/dash-ui";

export const Route = createFileRoute("/dashboard/paiements")({
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

function CrmPaiementsPage() {
  const { t } = useDashboardI18n();
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

  function exportCsv(lines: PaymentRow[]) {
    const header = [
      t.paiements.table.parent,
      t.paiements.table.child,
      `${t.paiements.table.amount} (${t.common.mad})`,
      t.paiements.table.date,
      t.paiements.table.mode,
      t.paiements.table.period,
      t.paiements.table.receipt,
      t.paiements.table.invoice,
    ];
    const body = lines.map((r) =>
      [
        r.parent,
        r.enfant,
        String(r.montant),
        r.date,
        r.mode,
        r.periode,
        r.recu,
        r.facture === "non_envoye" ? t.status.notSent : t.status.sent,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t.paiements.csvFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t.paiements.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground md:text-4xl">
            {t.paiements.titleBold} <span className="italic text-muted-foreground">{t.paiements.titleItalic}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t.paiements.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          className={ghostPill}
        >
          <Download className="h-4 w-4" />
          {t.common.export}
        </button>
      </header>

      <section className={cn(softCard, "p-5")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t.common.filtersAndSearch}</p>
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.paiements.searchPlaceholder}
              className={cn(inputClass, "pl-10")}
              aria-label={t.paiements.searchAria}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className={selectTriggerClass} aria-label={t.paiements.paymentModeAria}>
                <SelectValue placeholder={t.common.allModes} />
              </SelectTrigger>
              <SelectContent className={softSelectContent}>
                <SelectItem value="tous">{t.common.allModes}</SelectItem>
                <SelectItem value="espèces">{t.form.paymentModes.cash}</SelectItem>
                <SelectItem value="virement">{t.form.paymentModes.transfer}</SelectItem>
                <SelectItem value="carte">{t.form.paymentModes.card}</SelectItem>
                <SelectItem value="chèque">{t.form.paymentModes.check}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={factureFilter} onValueChange={setFactureFilter}>
              <SelectTrigger className={selectTriggerClass} aria-label={t.paiements.invoiceAria}>
                <SelectValue placeholder={t.common.allInvoices} />
              </SelectTrigger>
              <SelectContent className={softSelectContent}>
                <SelectItem value="tous">{t.common.allInvoices}</SelectItem>
                <SelectItem value="non_envoye">{t.status.notSent}</SelectItem>
                <SelectItem value="envoye">{t.status.sent}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className={cn(softCard, "overflow-hidden")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{t.paiements.table.parent}</th>
                <th className="px-4 py-3">{t.paiements.table.child}</th>
                <th className="px-4 py-3">{t.paiements.table.amount}</th>
                <th className="px-4 py-3">{t.paiements.table.date}</th>
                <th className="px-4 py-3">{t.paiements.table.mode}</th>
                <th className="px-4 py-3">{t.paiements.table.period}</th>
                <th className="px-4 py-3">{t.paiements.table.receipt}</th>
                <th className="px-4 py-3">{t.paiements.table.invoice}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/80">
                  <td className="px-4 py-3 font-medium text-foreground">{r.parent}</td>
                  <td className="px-4 py-3 text-foreground/90">{r.enfant}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                    {r.montant} {t.common.mad}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#28396C]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#28396C]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#28396C]" aria-hidden />
                      {r.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/90">{r.periode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/90">{r.recu}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        r.facture === "non_envoye"
                          ? "bg-muted text-foreground/70"
                          : "bg-[#B5E18B]/30 text-[#3E6420]",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", r.facture === "non_envoye" ? "bg-current" : "bg-[#6BA53A]")} aria-hidden />
                      {r.facture === "non_envoye" ? t.status.notSent : t.status.sent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t.paiements.noMatch}</p>
        ) : null}
      </section>
    </div>
  );
}
