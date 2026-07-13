import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Star, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/rendez-vous")({
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

const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
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

function CrmCalendrier() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Cellules du mois (semaine commence lundi)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<{ day: number; ferie: string | null; vacance: string | null; isToday: boolean } | null> = [];
    for (let i = 0; i < offset; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({
        day: d,
        ferie: ferieName(year, month, d),
        vacance: vacanceLabel(year, month, d),
        isToday:
          d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
      });
    }
    while (list.length % 7 !== 0) list.push(null);
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

  const feriesDuMois = cells.filter((c) => c?.ferie).map((c) => c!);
  const vacancesVisibles = VACANCES_SCOLAIRES.filter((v) => {
    const [vy, vm] = v.start.split("-").map(Number);
    const [ey, em] = v.end.split("-").map(Number);
    const cur = year * 12 + month;
    return cur >= (vy * 12 + vm - 1) && cur <= (ey * 12 + em - 1);
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Calendrier</p>
          <h1 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
            <span className="font-semibold">Jours fériés</span>{" "}
            <span className="font-medium italic text-muted-foreground">& vacances scolaires</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Calendrier officiel du Maroc   fêtes nationales, religieuses et vacances scolaires (dates indicatives).
          </p>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#28396C] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_-14px_rgba(40,57,108,0.6)] transition hover:bg-[#1B2A55]"
        >
          <CalendarDays className="h-4 w-4" />
          Aujourd'hui
        </button>
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
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Calendrier */}
        <div className={cn(cardClass, "min-w-0 p-4 sm:p-6")}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              {MOIS_FR[month]} <span className="font-normal text-muted-foreground">{year}</span>
            </h2>
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
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-1.5">
            {JOURS_FR.map((j) => (
              <div key={j} className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                {j}
              </div>
            ))}
            {cells.map((c, i) =>
              c === null ? (
                <div key={`e-${i}`} />
              ) : (
                <div
                  key={c.day}
                  title={c.ferie ?? c.vacance ?? undefined}
                  className={cn(
                    "relative flex min-h-[3.1rem] flex-col items-center justify-start gap-0.5 rounded-xl border p-1 text-center transition sm:min-h-[4.6rem] sm:rounded-2xl sm:p-1.5",
                    c.ferie
                      ? "border-[#6BA53A]/30 bg-[#B5E18B]/30"
                      : c.vacance
                        ? "border-[#CFC27A]/40 bg-[#EAE6BC]/45"
                        : "border-transparent bg-muted/40 hover:bg-[#B5E18B]/10",
                    c.isToday && "ring-2 ring-[#28396C]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold sm:text-sm",
                      c.isToday ? "bg-[#28396C] text-white" : "text-foreground",
                    )}
                  >
                    {c.day}
                  </span>
                  {c.ferie ? (
                    <span className="hidden w-full truncate px-0.5 text-[9px] font-semibold leading-tight text-[#3E6420] sm:block">
                      {c.ferie}
                    </span>
                  ) : c.vacance ? (
                    <span className="hidden w-full truncate px-0.5 text-[9px] font-medium leading-tight text-[#7A6E2E] sm:block">
                      Vacances
                    </span>
                  ) : null}
                  {/* Point coloré sur mobile */}
                  {(c.ferie || c.vacance) && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full sm:hidden",
                        c.ferie ? "bg-[#6BA53A]" : "bg-[#CFC27A]",
                      )}
                    />
                  )}
                </div>
              ),
            )}
          </div>

          {/* Événements du mois */}
          {(feriesDuMois.length > 0 || vacancesVisibles.length > 0) && (
            <div className="mt-5 space-y-2 border-t border-[#28396C]/10 pt-4">
              {feriesDuMois.map((c) => (
                <p key={`f-${c.day}`} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#B5E18B]/40 text-[10px] font-bold text-[#3E6420]">
                    {c.day}
                  </span>
                  <span className="font-medium">{c.ferie}</span>
                  <span className="text-xs text-muted-foreground">  jour férié</span>
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

        {/* Panneau latéral */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className={cn(cardClass, "p-5")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">À venir</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-foreground">Prochains jours fériés</h3>
            <ul className="mt-4 space-y-2.5">
              {prochainsFeries.map((f) => (
                <li key={f.iso} className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#B5E18B]/30 text-[#3E6420]">
                    <Star className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{f.label}</span>
                    <span className="block text-xs text-muted-foreground">{formatIsoFr(f.iso)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(cardClass, "overflow-hidden")}>
            <div className="bg-[#28396C] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B5E18B]">Année scolaire</p>
              <h3 className="mt-1 font-display text-lg font-semibold">Vacances scolaires</h3>
              <p className="mt-1 text-xs text-white/70">Enseignement public   dates indicatives</p>
            </div>
            <ul className="space-y-1 p-4">
              {VACANCES_SCOLAIRES.map((v) => (
                <li key={v.start} className="rounded-2xl px-3 py-2 transition hover:bg-[#EAE6BC]/40">
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
    </div>
  );
}
