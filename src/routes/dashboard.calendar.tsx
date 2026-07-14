import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Star,
  Sun,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { softInput as inputClass, dialogSurface, labelClass } from "@/lib/dash-ui";

export const Route = createFileRoute("/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Calendrier   CRM" }] }),
  component: CrmCalendrier,
});

// ─────────────────────────────────────────────
// Jours fériés au Maroc (civils   chaque année)
// ─────────────────────────────────────────────
const FERIES_CIVILS: Record<string, string> = {
  "01-01": "Nouvel An",
  "01-11": "Manifeste de l'Indépendance",
  "01-14": "Nouvel An Amazigh",
  "05-01": "Fête du Travail",
  "07-30": "Fête du Trône",
  "08-14": "Allégeance Oued Eddahab",
  "08-20": "Révolution du Roi et du Peuple",
  "08-21": "Fête de la Jeunesse",
  "11-06": "Marche Verte",
  "11-18": "Fête de l'Indépendance",
};

// Fêtes religieuses (dates approximatives, selon l'observation lunaire)
const FERIES_RELIGIEUX: Record<string, string> = {
  // 2025
  "2025-03-30": "Aïd al-Fitr",
  "2025-03-31": "Aïd al-Fitr (2e jour)",
  "2025-06-06": "Aïd al-Adha",
  "2025-06-07": "Aïd al-Adha (2e jour)",
  "2025-06-26": "1er Moharram",
  "2025-09-04": "Aïd al-Mawlid",
  "2025-09-05": "Aïd al-Mawlid (2e jour)",
  // 2026
  "2026-03-20": "Aïd al-Fitr",
  "2026-03-21": "Aïd al-Fitr (2e jour)",
  "2026-05-27": "Aïd al-Adha",
  "2026-05-28": "Aïd al-Adha (2e jour)",
  "2026-06-16": "1er Moharram",
  "2026-08-25": "Aïd al-Mawlid",
  "2026-08-26": "Aïd al-Mawlid (2e jour)",
  // 2027
  "2027-03-09": "Aïd al-Fitr",
  "2027-03-10": "Aïd al-Fitr (2e jour)",
  "2027-05-16": "Aïd al-Adha",
  "2027-05-17": "Aïd al-Adha (2e jour)",
  "2027-06-06": "1er Moharram",
  "2027-08-14": "Aïd al-Mawlid",
  "2027-08-15": "Aïd al-Mawlid (2e jour)",
};

// ─────────────────────────────────────────────
// Vacances scolaires au Maroc (dates indicatives)
// ─────────────────────────────────────────────
type Vacance = { start: string; end: string; label: string };

const VACANCES_SCOLAIRES: Vacance[] = [
  { start: "2025-10-19", end: "2025-10-26", label: "Vacances de la 1ère période" },
  { start: "2025-12-07", end: "2025-12-14", label: "Vacances de la 2e période" },
  { start: "2026-01-25", end: "2026-02-01", label: "Vacances inter-semestres" },
  { start: "2026-03-15", end: "2026-03-22", label: "Vacances de la 3e période" },
  { start: "2026-05-10", end: "2026-05-17", label: "Vacances de la 4e période" },
  { start: "2026-07-05", end: "2026-08-31", label: "Vacances d'été" },
  { start: "2026-10-18", end: "2026-10-25", label: "Vacances de la 1ère période" },
  { start: "2026-12-06", end: "2026-12-13", label: "Vacances de la 2e période" },
];

// ─────────────────────────────────────────────
// Exceptions saisies par l'école (texte libre)
// ─────────────────────────────────────────────
type Exception = { label: string };

/** Exceptions de démonstration   remplacées par les saisies de l'utilisateur. */
const EXCEPTIONS_INITIALES: Record<string, Exception> = {
  "2026-07-09": { label: "Réunion pédagogique" },
};

const MOIS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function ferieName(y: number, m: number, d: number): string | null {
  return FERIES_RELIGIEUX[isoKey(y, m, d)] ?? FERIES_CIVILS[`${pad(m + 1)}-${pad(d)}`] ?? null;
}

function vacanceLabel(y: number, m: number, d: number): string | null {
  const key = isoKey(y, m, d);
  for (const v of VACANCES_SCOLAIRES) {
    if (key >= v.start && key <= v.end) return v.label;
  }
  return null;
}

function formatIsoFr(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MOIS_FR[m - 1].toLowerCase()} ${y}`;
}

const cardClass =
  "rounded-3xl border border-[#28396C]/10 bg-card shadow-[0_18px_45px_-28px_rgba(40,57,108,0.35)]";

type Cell = {
  day: number;
  iso: string;
  ferie: string | null;
  vacance: string | null;
  isOutside: boolean;
  isToday: boolean;
};

/** Hachures des jours hors du mois affiché. */
const hatched =
  "bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(40,57,108,0.05)_5px,rgba(40,57,108,0.05)_6px)]";

/** Pastille d'événement : filet coloré à gauche, intitulé, puis type en légende. */
function EventChip({
  title,
  kind,
  accent,
  dot,
}: {
  title: string;
  kind: string;
  accent: string;
  dot: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[4px] border border-[#28396C]/10 border-l-[3px] bg-card px-2 py-1 shadow-[0_1px_2px_rgba(40,57,108,0.06)]",
        accent,
      )}
    >
      <p className="truncate text-[11px] font-semibold leading-tight text-foreground">{title}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[10px] leading-tight text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden />
        <span className="truncate">{kind}</span>
      </p>
    </div>
  );
}

function CrmCalendrier() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [exceptions, setExceptions] = useState<Record<string, Exception>>(EXCEPTIONS_INITIALES);
  /** Jour ouvert dans la modale d'exception (clé ISO), null si fermée. */
  const [openIso, setOpenIso] = useState<string | null>(null);

  const saveException = (iso: string, ex: Exception) =>
    setExceptions((prev) => ({ ...prev, [iso]: ex }));

  const removeException = (iso: string) =>
    setExceptions((prev) => {
      const next = { ...prev };
      delete next[iso];
      return next;
    });

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Cellules du mois (semaine commence lundi)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Une cellule par jour affiché, débords des mois voisins compris (grisés).
    const make = (dt: Date, isOutside: boolean): Cell => {
      const y = dt.getFullYear();
      const m = dt.getMonth();
      const d = dt.getDate();
      return {
        day: d,
        iso: isoKey(y, m, d),
        ferie: ferieName(y, m, d),
        vacance: vacanceLabel(y, m, d),
        isOutside,
        isToday: d === today.getDate() && m === today.getMonth() && y === today.getFullYear(),
      };
    };

    const list: Cell[] = [];
    for (let i = offset; i > 0; i--) list.push(make(new Date(year, month, 1 - i), true));
    for (let d = 1; d <= daysInMonth; d++) list.push(make(new Date(year, month, d), false));
    let tail = 1;
    while (list.length % 7 !== 0) list.push(make(new Date(year, month + 1, tail++), true));
    return list;
  }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prochains jours fériés (à partir d'aujourd'hui)
  const prochainsFeries = useMemo(() => {
    const todayKey = isoKey(today.getFullYear(), today.getMonth(), today.getDate());
    const out: Array<{ iso: string; label: string }> = [];
    const start = new Date(today);
    for (let i = 0; i < 400 && out.length < 6; i++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      const name = ferieName(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const iso = isoKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
      if (name && iso >= todayKey) out.push({ iso, label: name });
    }
    return out;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const feriesDuMois = cells.filter((c) => !c.isOutside && c.ferie);
  const exceptionsDuMois = cells
    .filter((c) => !c.isOutside && exceptions[c.iso])
    .map((c) => ({ ...c, ex: exceptions[c.iso] }));
  const vacancesVisibles = VACANCES_SCOLAIRES.filter((v) => {
    const [vy, vm] = v.start.split("-").map(Number);
    const [ey, em] = v.end.split("-").map(Number);
    const cur = year * 12 + month;
    return cur >= vy * 12 + vm - 1 && cur <= ey * 12 + em - 1;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Calendrier
        </p>
        <h1 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
          <span className="font-semibold">Jours fériés</span>{" "}
          <span className="font-medium italic text-muted-foreground">& vacances scolaires</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Calendrier officiel du Maroc fêtes nationales, religieuses et vacances scolaires (dates
          indicatives).
        </p>
      </header>

      {/* Légende */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#B5E18B]/30 px-3 py-1.5 text-xs font-semibold text-[#3E6420]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6BA53A]" /> Jour férié
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#EAE6BC]/60 px-3 py-1.5 text-xs font-semibold text-[#7A6E2E]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#CFC27A]" /> Vacances scolaires
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#28396C]/10 px-3 py-1.5 text-xs font-semibold text-[#28396C]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#28396C]" /> Aujourd'hui
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#D2624A]/15 px-3 py-1.5 text-xs font-semibold text-[#9C3B26]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D2624A]" /> Exception
        </span>
        <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
          <AlertCircle className="h-3.5 w-3.5" />
          Cliquez sur un jour pour ajouter une exception.
        </span>
      </div>

      <div className="space-y-4">
        {/* Calendrier   pleine largeur */}
        <div className={cn(cardClass, "min-w-0 p-4 sm:p-6")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Mois précédent"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#28396C]/15 text-[#28396C] transition hover:bg-[#B5E18B]/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Mois suivant"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#28396C]/15 text-[#28396C] transition hover:bg-[#B5E18B]/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                {MOIS_FR[month]} <span className="font-normal text-muted-foreground">{year}</span>
              </h2>
            </div>

            <button
              type="button"
              onClick={goToday}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#28396C] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_-14px_rgba(40,57,108,0.6)] transition hover:bg-[#1B2A55]"
            >
              <CalendarDays className="h-4 w-4" />
              Aujourd'hui
            </button>
          </div>

          {/* Grille continue   trame d'un vrai calendrier (filets fins, pas de pastilles flottantes) */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#28396C]/10">
            <div className="grid grid-cols-7 border-b border-[#28396C]/10 bg-muted/40">
              {JOURS_FR.map((j) => (
                <div
                  key={j}
                  className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]"
                >
                  {j}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#28396C]/[0.07]">
              {cells.map((c) => {
                const ex = exceptions[c.iso];
                return (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => setOpenIso(c.iso)}
                    aria-label={`${c.day} ${MOIS_FR[month]} ${year}   ${ex ? `exception : ${ex.label}` : "ajouter une exception"}`}
                    className={cn(
                      "group relative flex min-h-[4.5rem] flex-col items-stretch gap-1 p-1.5 text-left transition sm:min-h-[7.5rem] sm:p-2",
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#28396C]",
                      c.isOutside ? cn("bg-card", hatched) : "bg-card hover:bg-muted/40",
                      // Seul le jour courant reste teinté : le reste se lit via les pastilles.
                      c.isToday && "bg-[#28396C]/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        c.isToday
                          ? "bg-[#28396C] text-white"
                          : c.isOutside
                            ? "text-muted-foreground/50"
                            : "text-foreground/80",
                      )}
                    >
                      {c.day}
                    </span>

                    <div className="hidden flex-col gap-1 sm:flex">
                      {ex && (
                        <EventChip
                          title={ex.label}
                          kind="Exception"
                          accent="border-l-[#D2624A]"
                          dot="bg-[#D2624A]"
                        />
                      )}
                      {c.ferie && (
                        <EventChip
                          title={c.ferie}
                          kind="Jour férié"
                          accent="border-l-[#6BA53A]"
                          dot="bg-[#6BA53A]"
                        />
                      )}
                      {c.vacance && !c.ferie && !ex && (
                        <EventChip
                          title={c.vacance}
                          kind="Vacances scolaires"
                          accent="border-l-[#CFC27A]"
                          dot="bg-[#CFC27A]"
                        />
                      )}
                    </div>

                    {/* Points colorés sur mobile, faute de place pour les pastilles */}
                    {(ex || c.ferie || c.vacance) && (
                      <span
                        className={cn(
                          "absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full sm:hidden",
                          ex ? "bg-[#D2624A]" : c.ferie ? "bg-[#6BA53A]" : "bg-[#CFC27A]",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Événements du mois */}
          {(feriesDuMois.length > 0 ||
            vacancesVisibles.length > 0 ||
            exceptionsDuMois.length > 0) && (
            <div className="mt-5 space-y-2 border-t border-[#28396C]/10 pt-4">
              {exceptionsDuMois.map((c) => {
                return (
                  <p key={`x-${c.day}`} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#D2624A]/15 text-[10px] font-bold text-[#9C3B26]">
                      {c.day}
                    </span>
                    <span className="font-medium">{c.ex.label}</span>
                    <span className="text-xs text-muted-foreground">exception</span>
                    <button
                      type="button"
                      onClick={() => removeException(c.iso)}
                      aria-label={`Supprimer l'exception du ${c.day} ${MOIS_FR[month]}`}
                      className="ml-auto grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-[#D2624A]/10 hover:text-[#9C3B26]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </p>
                );
              })}
              {feriesDuMois.map((c) => (
                <p key={`f-${c.day}`} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#B5E18B]/40 text-[10px] font-bold text-[#3E6420]">
                    {c.day}
                  </span>
                  <span className="font-medium">{c.ferie}</span>
                  <span className="text-xs text-muted-foreground"> jour férié</span>
                </p>
              ))}
              {vacancesVisibles.map((v) => (
                <p key={v.start} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EAE6BC]/70 text-[#7A6E2E]">
                    <Sun className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">{v.label}</span>
                  <span className="text-xs text-muted-foreground">
                    du {formatIsoFr(v.start)} au {formatIsoFr(v.end)}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Cartes d'information   sous le calendrier */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={cn(cardClass, "min-w-0 p-5")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              À venir
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
              Prochains jours fériés
            </h3>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {prochainsFeries.map((f) => (
                <li
                  key={f.iso}
                  className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#B5E18B]/30 text-[#3E6420]">
                    <Star className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {f.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatIsoFr(f.iso)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(cardClass, "min-w-0 overflow-hidden")}>
            <div className="bg-[#28396C] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B5E18B]">
                Année scolaire
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold">Vacances scolaires</h3>
              <p className="mt-1 text-xs text-white/70">Enseignement public dates indicatives</p>
            </div>
            <ul className="grid gap-1 p-4 sm:grid-cols-2">
              {VACANCES_SCOLAIRES.map((v) => (
                <li
                  key={v.start}
                  className="rounded-2xl px-3 py-2 transition hover:bg-[#EAE6BC]/40"
                >
                  <p className="text-sm font-medium text-foreground">{v.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Du {formatIsoFr(v.start)} au {formatIsoFr(v.end)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ExceptionDialog
        iso={openIso}
        existing={openIso ? (exceptions[openIso] ?? null) : null}
        onClose={() => setOpenIso(null)}
        onSave={(ex) => {
          if (openIso) saveException(openIso, ex);
          setOpenIso(null);
        }}
        onDelete={() => {
          if (openIso) removeException(openIso);
          setOpenIso(null);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Modale d'exception   ouverte au clic sur un jour
// ─────────────────────────────────────────────
function ExceptionDialog({
  iso,
  existing,
  onClose,
  onSave,
  onDelete,
}: {
  iso: string | null;
  existing: Exception | null;
  onClose: () => void;
  onSave: (ex: Exception) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState("");

  // Recharger le champ à chaque jour ouvert.
  const [loadedIso, setLoadedIso] = useState<string | null>(null);
  if (iso !== loadedIso) {
    setLoadedIso(iso);
    setLabel(existing?.label ?? "");
  }

  return (
    <Dialog open={iso !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(dialogSurface, "max-w-[460px]")}>
        <DialogDescription className="sr-only">
          Ajouter ou modifier une exception au calendrier.
        </DialogDescription>
        <div className="border-t-4 border-t-[#D2624A]">
          <div className="px-6 pb-2 pt-5">
            <DialogTitle className="font-display text-xl font-semibold text-foreground">
              {existing ? "Modifier l'exception" : "Ajouter une exception"}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">{iso ? formatIsoFr(iso) : ""}</p>
          </div>

          <form
            className="space-y-4 px-6 pb-6 pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              const clean = label.trim();
              if (!clean) return;
              onSave({ label: clean });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="ex-label" className={labelClass}>
                Intitulé
              </Label>
              <Input
                id="ex-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex. : Journée portes ouvertes"
                className={inputClass}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              {existing && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D2624A]/30 px-4 py-2 text-sm font-medium text-[#9C3B26] transition hover:bg-[#D2624A]/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!label.trim()}
                className="rounded-full bg-[#28396C] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1B2A55] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
