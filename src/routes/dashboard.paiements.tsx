import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  dialogSurface,
  dashTooltip,
  labelClass,
  ghostPill,
  statusPill,
  STATUS_COLORS,
  renderPieLabel,
} from "@/lib/dash-ui";

export const Route = createFileRoute("/dashboard/paiements")({
  head: () => ({ meta: [{ title: "Paiements   CRM" }] }),
  component: CrmPaiementsPage,
});

type RecuStat = "envoye" | "non_envoye";
type PaymentStatus = "paye" | "impaye" | "retard";

type PaymentRow = {
  id: string;
  parent: string;
  enfant: string;
  niveau: string;
  email: string;
  telephone: string;
  montant: number;
  /** Remise fratrie appliquée (%) */
  remise: number;
  date: string;
  mode: string;
  /** Clé du mois de rattachement (voir MONTHS) */
  periode: string;
  services: string[];
  recu: string;
  /** Envoi du reçu de paiement au parent */
  recuEnvoye: RecuStat;
  statut: PaymentStatus;
  note?: string;
};

const MONTHS: { key: string; label: string }[] = [
  { key: "2026-01", label: "Janvier 2026" },
  { key: "2026-02", label: "Février 2026" },
  { key: "2026-03", label: "Mars 2026" },
  { key: "2026-04", label: "Avril 2026" },
  { key: "2026-05", label: "Mai 2026" },
  { key: "2026-06", label: "Juin 2026" },
];
const DEFAULT_MONTH = "2026-05";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  paye: "Payé",
  impaye: "Impayé",
  retard: "En retard",
};

const rowsSeed: PaymentRow[] = [
  {
    id: "1",
    parent: "Famille Alami",
    enfant: "Yasmine Alami",
    niveau: "CM2",
    email: "karim.alami@example.com",
    telephone: "0661122334",
    montant: 1620,
    remise: 10,
    date: "05/05/2026",
    mode: "ESPÈCES",
    periode: "2026-05",
    services: ["Transport", "Cantine", "Garderie", "Activités"],
    recu: "EDU-20260505-115",
    recuEnvoye: "envoye",
    statut: "paye",
    note: "Remise fratrie appliquée (3 enfants scolarisés).",
  },
  {
    id: "2",
    parent: "Tazi / Mehdi",
    enfant: "Mehdi Tazi",
    niveau: "1ère année collège",
    email: "hicham.tazi@example.com",
    telephone: "0622334455",
    montant: 1530,
    remise: 15,
    date: "05/05/2026",
    mode: "VIREMENT",
    periode: "2026-05",
    services: ["Transport", "Garderie"],
    recu: "EDU-20260505-253",
    recuEnvoye: "non_envoye",
    statut: "paye",
    note: "Remise fratrie appliquée (4 enfants scolarisés).",
  },
  {
    id: "3",
    parent: "Benjelloun / Sara",
    enfant: "Sara Benjelloun",
    niveau: "CE1",
    email: "omar.benjelloun@example.com",
    telephone: "0611223344",
    montant: 1600,
    remise: 0,
    date: "  ",
    mode: "CHÈQUE",
    periode: "2026-05",
    services: ["Cantine", "Activités"],
    recu: "EDU-20260505-311",
    recuEnvoye: "non_envoye",
    statut: "retard",
    note: "Échéance du 10/05 dépassée   relance envoyée le 14/05.",
  },
  {
    id: "4",
    parent: "rztest / testss",
    enfant: "testss",
    niveau: "1ère année collège",
    email: "tehgdgh@test.com",
    telephone: "0614020520",
    montant: 0,
    remise: 0,
    date: "  ",
    mode: "ESPÈCES",
    periode: "2026-05",
    services: [],
    recu: "EDU-20260505-402",
    recuEnvoye: "non_envoye",
    statut: "impaye",
    note: "Inscription en attente de validation.",
  },
  {
    id: "5",
    parent: "Famille Alami",
    enfant: "Yasmine Alami",
    niveau: "CM2",
    email: "karim.alami@example.com",
    telephone: "0661122334",
    montant: 1620,
    remise: 10,
    date: "04/04/2026",
    mode: "CARTE",
    periode: "2026-04",
    services: ["Transport", "Cantine", "Garderie", "Activités"],
    recu: "EDU-20260404-098",
    recuEnvoye: "envoye",
    statut: "paye",
  },
  {
    id: "6",
    parent: "Tazi / Mehdi",
    enfant: "Mehdi Tazi",
    niveau: "1ère année collège",
    email: "hicham.tazi@example.com",
    telephone: "0622334455",
    montant: 1530,
    remise: 15,
    date: "03/04/2026",
    mode: "VIREMENT",
    periode: "2026-04",
    services: ["Transport", "Garderie"],
    recu: "EDU-20260403-077",
    recuEnvoye: "envoye",
    statut: "paye",
  },
  {
    id: "7",
    parent: "Benjelloun / Sara",
    enfant: "Sara Benjelloun",
    niveau: "CE1",
    email: "omar.benjelloun@example.com",
    telephone: "0611223344",
    montant: 1600,
    remise: 0,
    date: "  ",
    mode: "CHÈQUE",
    periode: "2026-04",
    services: ["Cantine", "Activités"],
    recu: "EDU-20260404-150",
    recuEnvoye: "non_envoye",
    statut: "impaye",
  },
  {
    id: "8",
    parent: "Famille Alami",
    enfant: "Yasmine Alami",
    niveau: "CM2",
    email: "karim.alami@example.com",
    telephone: "0661122334",
    montant: 1620,
    remise: 10,
    date: "06/06/2026",
    mode: "ESPÈCES",
    periode: "2026-06",
    services: ["Transport", "Cantine", "Garderie", "Activités"],
    recu: "EDU-20260606-011",
    recuEnvoye: "non_envoye",
    statut: "paye",
  },
];

function dash(v: string) {
  return v.trim() === "" ? " " : v;
}

/** Badge d'envoi du reçu de paiement. */
function RecuBadge({ stat }: { stat: RecuStat }) {
  const sent = stat === "envoye";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        sent ? "bg-[#B5E18B]/30 text-[#3E6420]" : "bg-muted text-foreground/70",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", sent ? "bg-[#6BA53A]" : "bg-current")} aria-hidden />
      {sent ? "Envoyé" : "Non envoyé"}
    </span>
  );
}

function CrmPaiementsPage() {
  const { t } = useDashboardI18n();
  const [rows] = useState<PaymentRow[]>(rowsSeed);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [modeFilter, setModeFilter] = useState("tous");
  const [recuFilter, setRecuFilter] = useState("tous");
  const [detailId, setDetailId] = useState<string | null>(null);

  const monthLabel = MONTHS.find((m) => m.key === month)?.label ?? "";

  // Lignes du mois sélectionné   base du graphique circulaire
  const monthRows = useMemo(() => rows.filter((r) => r.periode === month), [rows, month]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthRows.filter((r) => {
      if (modeFilter !== "tous" && r.mode.toLowerCase() !== modeFilter.toLowerCase()) return false;
      if (recuFilter !== "tous" && r.recuEnvoye !== recuFilter) return false;
      if (!q) return true;
      const blob = `${r.parent} ${r.enfant} ${r.recu} ${r.niveau}`.toLowerCase();
      return blob.includes(q);
    });
  }, [monthRows, search, modeFilter, recuFilter]);

  // Répartition du mois par statut de paiement (payé / impayé / en retard)
  const donut = useMemo(() => {
    const counts: Record<PaymentStatus, number> = { paye: 0, impaye: 0, retard: 0 };
    const amounts: Record<PaymentStatus, number> = { paye: 0, impaye: 0, retard: 0 };
    monthRows.forEach((r) => {
      counts[r.statut] += 1;
      amounts[r.statut] += r.montant;
    });
    return (["paye", "impaye", "retard"] as PaymentStatus[]).map((k) => ({
      key: k,
      name: STATUS_LABEL[k],
      value: counts[k],
      montant: amounts[k],
      color: STATUS_COLORS[k],
    }));
  }, [monthRows]);

  const donutTotal = donut.reduce((s, d) => s + d.value, 0);
  const encaisse = donut.find((d) => d.key === "paye")?.montant ?? 0;

  const detail = detailId ? rows.find((r) => r.id === detailId) : null;

  function exportCsv(lines: PaymentRow[]) {
    const header = [
      t.paiements.table.parent,
      "Élève",
      "Niveau",
      "Email",
      `${t.paiements.table.amount} (${t.common.mad})`,
      "Remise (%)",
      t.paiements.table.date,
      t.paiements.table.mode,
      t.paiements.table.period,
      "N° de reçu",
      "Reçu de paiement",
      "Statut",
    ];
    const body = lines.map((r) =>
      [
        r.parent,
        r.enfant,
        r.niveau,
        r.email,
        String(r.montant),
        String(r.remise),
        r.date,
        r.mode,
        MONTHS.find((m) => m.key === r.periode)?.label ?? r.periode,
        r.recu,
        r.recuEnvoye === "envoye" ? "Envoyé" : "Non envoyé",
        STATUS_LABEL[r.statut],
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
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Suivi mensuel des encaissements   cliquez une ligne pour ouvrir le détail du paiement.
          </p>
        </div>
        <button type="button" onClick={() => exportCsv(filtered)} className={ghostPill}>
          <Download className="h-4 w-4" />
          {t.common.export}
        </button>
      </header>

      {/* Filtres mensuels + analyse circulaire du mois */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className={cn(softCard, "p-5 lg:col-span-2")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Filtres   vue mensuelle</p>
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className={labelClass}>Mois</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par mois">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.key} value={m.key}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelClass}>Mode de paiement</Label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label={t.paiements.paymentModeAria}>
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
              </div>
              <div>
                <Label className={labelClass}>Reçu de paiement</Label>
                <Select value={recuFilter} onValueChange={setRecuFilter}>
                  <SelectTrigger className={cn(selectTriggerClass, "mt-1.5")} aria-label="Filtrer par reçu de paiement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="tous">Tous les reçus</SelectItem>
                    <SelectItem value="non_envoye">Non envoyé</SelectItem>
                    <SelectItem value="envoye">Envoyé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} paiement{filtered.length > 1 ? "s" : ""} en {monthLabel}   {encaisse} {t.common.mad} encaissés
          </p>
        </section>

        {/* Camembert plein   part de chaque statut, % inscrit dans la part */}
        <section className={cn(softCard, "flex flex-col p-5")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Analyse   {monthLabel}</p>
          <div className="mx-auto mt-2 h-48 w-full max-w-[15rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="95%"
                  stroke="none"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {donut.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={dashTooltip}
                  formatter={(v: number, n) => [`${v} paiement${v > 1 ? "s" : ""}`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {donut.map((d) => (
              <li key={d.key} className="flex items-center justify-between gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {d.value}   {d.montant} {t.common.mad}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={cn(softCard, "overflow-hidden")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#28396C]/10 bg-muted/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{t.paiements.table.parent}</th>
                <th className="px-4 py-3">Élève</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">{t.paiements.table.amount}</th>
                <th className="px-4 py-3">{t.paiements.table.date}</th>
                <th className="px-4 py-3">{t.paiements.table.mode}</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">N° de reçu</th>
                <th className="px-4 py-3">Reçu de paiement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28396C]/8">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setDetailId(r.id)}
                  className="cursor-pointer transition-colors hover:bg-[#B5E18B]/10"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{r.parent}</td>
                  <td className="px-4 py-3 text-foreground/90">{r.enfant}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.niveau}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                    {r.montant} {t.common.mad}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">{dash(r.date)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#28396C]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#28396C]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#28396C]" aria-hidden />
                      {r.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusPill(r.statut)}>{STATUS_LABEL[r.statut]}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/90">{r.recu}</td>
                  <td className="px-4 py-3">
                    <RecuBadge stat={r.recuEnvoye} />
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

      {detail ? (
        <PaymentDetailDialog
          row={detail}
          monthLabel={MONTHS.find((m) => m.key === detail.periode)?.label ?? ""}
          open={!!detailId}
          onOpenChange={(o) => !o && setDetailId(null)}
        />
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className={labelClass}>{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PaymentDetailDialog({
  row,
  monthLabel,
  open,
  onOpenChange,
}: {
  row: PaymentRow;
  monthLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useDashboardI18n();
  const brut = row.remise > 0 ? Math.round(row.montant / (1 - row.remise / 100)) : row.montant;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "w-[min(100vw-1.5rem,640px)] max-w-[640px]")}>
        <DialogDescription className="sr-only">Détail du paiement {row.recu}</DialogDescription>
        <div className="border-t-4 border-t-[#B5E18B]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#28396C]/10 px-6 pb-4 pt-6 pr-14">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Paiement   {monthLabel}
              </p>
              <DialogTitle className="mt-1 text-left font-display text-xl font-semibold tracking-tight text-foreground">
                {row.parent} <span className="font-normal text-muted-foreground">· {row.enfant}</span>
              </DialogTitle>
            </div>
            <span className={statusPill(row.statut)}>{STATUS_LABEL[row.statut]}</span>
          </div>

          <div className="max-h-[62vh] overflow-y-auto scroll-touch px-6 py-5">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <InfoRow label="Élève" value={row.enfant} />
              <InfoRow label="Niveau" value={row.niveau} />
              <InfoRow label="Email du parent" value={dash(row.email)} />
              <InfoRow label="Téléphone" value={dash(row.telephone)} />

              <InfoRow label="Montant brut" value={`${brut} ${t.common.mad}`} />
              <InfoRow label="Remise fratrie" value={row.remise > 0 ? `${row.remise}%` : "Aucune"} />
              <InfoRow label="Montant réglé" value={`${row.montant} ${t.common.mad}`} />
              <InfoRow label="Mode de paiement" value={row.mode} />
              <InfoRow label="Date de paiement" value={dash(row.date)} />
              <InfoRow label="Période" value={monthLabel} />
              <InfoRow label="N° de reçu" value={row.recu} />
              <div className="space-y-0.5">
                <p className={labelClass}>Reçu de paiement</p>
                <div className="pt-0.5">
                  <RecuBadge stat={row.recuEnvoye} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className={labelClass}>Services facturés</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {row.services.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Aucun service</span>
                  ) : (
                    row.services.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-[#28396C]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#28396C]"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {row.note ? (
                <div className="sm:col-span-2">
                  <p className={labelClass}>Note</p>
                  <p className="mt-1 text-sm text-foreground/90">{row.note}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#28396C]/10 px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
