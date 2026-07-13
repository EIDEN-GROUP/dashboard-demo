import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDateFnsLocale, useDashboardI18n } from "@/lib/landing-i18n";
import { listPlanifications, createPlanification, deletePlanification } from "@/lib/server-planifications";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const START_HOUR = 8;
const END_HOUR = 18;
const SLOT_MINUTES = 30;
const SLOT_PX = 36;
const DEFAULT_DURATION_MIN = 60;
const START_MINUTES = START_HOUR * 60;
const END_MINUTES = END_HOUR * 60;
const SLOT_COUNT = (END_MINUTES - START_MINUTES) / SLOT_MINUTES;
const GRID_BODY_PX = SLOT_COUNT * SLOT_PX;
const inputClass = "rounded-none border-border bg-card shadow-none focus-visible:border-primary focus-visible:ring-0";
const selectTriggerClass = "h-10 rounded-none border-border bg-card shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/70";
const labelClass = "text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

const toneBlock: Record<string, string> = {
  violet: "border-l-[3px] border-l-violet-600 bg-violet-50/95 text-violet-950 shadow-sm",
  emerald: "border-l-[3px] border-l-emerald-600 bg-emerald-50/95 text-emerald-950 shadow-sm",
  amber: "border-l-[3px] border-l-amber-600 bg-amber-50/95 text-amber-950 shadow-sm",
  zinc: "border-l-[3px] border-l-primary/50 bg-muted/95 text-foreground shadow-sm",
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function planBlockStyle(plan: any) {
  const start = parseTimeToMinutes(plan.time);
  const end = start + DEFAULT_DURATION_MIN;
  const clippedStart = Math.max(start, START_MINUTES);
  const clippedEnd = Math.min(end, END_MINUTES);
  if (clippedStart >= clippedEnd) return null;
  const top = ((clippedStart - START_MINUTES) / SLOT_MINUTES) * SLOT_PX;
  const height = Math.max(((clippedEnd - clippedStart) / SLOT_MINUTES) * SLOT_PX, SLOT_PX * 0.75);
  return { top, height };
}

function slotLabel(slotIndex: number): string {
  const m = START_MINUTES + slotIndex * SLOT_MINUTES;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export const Route = createFileRoute("/dashboard/planifications")({
  head: () => ({ meta: [{ title: "Planifications — CRM" }] }),
  component: PlanificationsPage,
});

function AddPlanificationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createPlanification({
        data: {
          date: String(fd.get("date") || ""),
          time: String(fd.get("time") || "09:00"),
          title: String(fd.get("title") || "Nouvel événement"),
          detail: String(fd.get("detail") || ""),
          tone: (fd.get("tone") as any) || "zinc",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["planifications"] });
      toast.success("Événement créé");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none max-h-[min(90vh,480px)] w-[min(100vw-1.5rem,440px)] max-w-[min(100vw-1.5rem,440px)] [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0">
        <DialogDescription className="sr-only">Ajouter un événement au planning</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Planning</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-foreground">Nouvel événement</DialogTitle>
          </div>
          <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="plan-title" className={labelClass}>Titre</Label>
              <Input id="plan-title" name="title" required className={inputClass} />
            </div>
            <div>
              <Label htmlFor="plan-date" className={labelClass}>Date</Label>
              <Input id="plan-date" name="date" type="date" required className={inputClass} />
            </div>
            <div>
              <Label htmlFor="plan-time" className={labelClass}>Heure</Label>
              <Input id="plan-time" name="time" type="time" defaultValue="09:00" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="plan-detail" className={labelClass}>Détail</Label>
              <Input id="plan-detail" name="detail" className={inputClass} />
            </div>
            <div>
              <Label htmlFor="plan-tone" className={labelClass}>Couleur</Label>
              <Select name="tone" defaultValue="zinc">
                <SelectTrigger id="plan-tone" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  <SelectItem value="violet">Violet</SelectItem>
                  <SelectItem value="emerald">Emeraude</SelectItem>
                  <SelectItem value="amber">Ambre</SelectItem>
                  <SelectItem value="zinc">Zinc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button type="button" onClick={() => onOpenChange(false)} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Annuler</button>
              <button type="submit" disabled={busy} className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "..." : "Créer"}</button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanificationsPage() {
  const { t, locale } = useDashboardI18n();
  const dateFnsLocale = getDateFnsLocale(locale);
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: PLANS = [] } = useQuery({
    queryKey: ["planifications"],
    queryFn: listPlanifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlanification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planifications"] });
      toast.success("Événement supprimé");
      setSelectedPlanId(null);
    },
  });

  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) }), [weekStart]);

  const weekLabel = useMemo(() => {
    const a = weekDays[0]; const b = weekDays[6];
    if (!a || !b) return "";
    if (a.getMonth() === b.getMonth()) return `${format(a, "d", { locale: dateFnsLocale })} – ${format(b, "d MMMM yyyy", { locale: dateFnsLocale })}`;
    return `${format(a, "d MMM", { locale: dateFnsLocale })} – ${format(b, "d MMM yyyy", { locale: dateFnsLocale })}`;
  }, [weekDays, dateFnsLocale]);

  const plansInWeek = useMemo(() =>
    PLANS.filter((p: any) => { const d = parseISO(p.date); return d >= weekDays[0] && d <= weekDays[6]; })
      .sort((a: any, b: any) => { const da = parseISO(a.date).getTime() - parseISO(b.date).getTime(); return da !== 0 ? da : a.time.localeCompare(b.time); }),
    [PLANS, weekDays]);

  const monthPlans = useMemo(() =>
    PLANS.filter((p: any) => isSameMonth(parseISO(p.date), weekDays[0]))
      .sort((a: any, b: any) => { const da = parseISO(a.date).getTime() - parseISO(b.date).getTime(); return da !== 0 ? da : a.time.localeCompare(b.time); }),
    [PLANS, weekDays]);

  const selectedPlan = selectedPlanId ? PLANS.find((p: any) => p.id === selectedPlanId) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <AddPlanificationDialog open={addOpen} onOpenChange={setAddOpen} />
      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{t.planifications.eyebrow}</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-foreground md:text-[2.35rem]">
              <span className="font-semibold">{t.planifications.titleBold}</span>{" "}
              <span className="font-normal italic text-muted-foreground">{t.planifications.titleItalic}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.planifications.subtitle}</p>
          </div>
          <button type="button" onClick={() => setAddOpen(true)} className="inline-flex shrink-0 items-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />Ajouter
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <div className="border border-border/80 bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-foreground/90"><CalendarDays className="h-4 w-4" strokeWidth={1.75} /></span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.planifications.weekView}</p>
                <p className="text-sm font-medium capitalize text-foreground">{weekLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setWeekStart((w) => addWeeks(w, -1))} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground transition hover:bg-muted" aria-label={t.planifications.prevWeekAria}><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="border border-border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/85">Aujourd'hui</button>
              <button type="button" onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground transition hover:bg-muted" aria-label={t.planifications.nextWeekAria}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid border-b border-border bg-muted/80" style={{ gridTemplateColumns: `3.25rem repeat(7, minmax(0, 1fr))` }}>
                <div className="border-r border-border" />
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={format(day, "yyyy-MM-dd")} className={cn("border-r border-border px-1 py-2 text-center last:border-r-0", isToday && "bg-primary/5")}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{format(day, "EEE", { locale: dateFnsLocale })}</p>
                      <p className={cn("mt-0.5 font-display text-sm font-semibold tabular-nums", isToday && "text-foreground")}>{format(day, "d MMM", { locale: dateFnsLocale })}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid" style={{ gridTemplateColumns: `3.25rem repeat(7, minmax(0, 1fr))` }}>
                <div className="border-r border-border bg-muted/40">
                  {Array.from({ length: SLOT_COUNT }, (_, i) => (
                    <div key={i} className="border-b border-border pr-1.5 text-right text-[10px] font-medium tabular-nums text-muted-foreground/70" style={{ height: SLOT_PX, lineHeight: `${SLOT_PX}px` }}>{i % 2 === 0 ? slotLabel(i) : ""}</div>
                  ))}
                </div>
                {weekDays.map((day) => {
                  const dayPlans = PLANS.filter((p: any) => isSameDay(parseISO(p.date), day));
                  return (
                    <div key={format(day, "yyyy-MM-dd")} className={cn("relative border-r border-border last:border-r-0", isSameDay(day, new Date()) && "bg-primary/[0.02]")}>
                      <div className="pointer-events-none absolute inset-0">
                        {Array.from({ length: SLOT_COUNT }, (_, i) => (<div key={i} className="border-b border-border" style={{ height: SLOT_PX }} />))}
                      </div>
                      <div className="relative" style={{ height: GRID_BODY_PX }}>
                        {dayPlans.map((plan: any) => {
                          const layout = planBlockStyle(plan);
                          if (!layout) return null;
                          const active = selectedPlanId === plan.id;
                          return (
                            <button key={plan.id} type="button" onClick={() => setSelectedPlanId((id) => (id === plan.id ? null : plan.id))}
                              className={cn("absolute left-0.5 right-0.5 overflow-hidden border border-border/80 px-1.5 py-1 text-left transition", toneBlock[plan.tone], active && "ring-2 ring-primary ring-offset-1")}
                              style={{ top: layout.top, height: layout.height, zIndex: active ? 2 : 1 }}>
                              <p className="text-[10px] font-semibold leading-tight sm:text-[11px]">{plan.title}</p>
                              <p className="mt-0.5 flex items-center gap-0.5 text-[9px] font-medium tabular-nums opacity-90 sm:text-[10px]"><Clock className="h-2.5 w-2.5 shrink-0" aria-hidden />{plan.time}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <div className="border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.planifications.selectedSlot}</p>
            {selectedPlan ? (
              <div>
                <h2 className="mt-1 font-display text-lg text-foreground">{selectedPlan.title}</h2>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {format(parseISO(selectedPlan.date), "EEEE d MMMM yyyy", { locale: dateFnsLocale })} · {selectedPlan.time}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selectedPlan.detail}</p>
                <button type="button" onClick={() => { if (confirm("Supprimer ?")) deleteMutation.mutate({ data: selectedPlan.id }); }} className="mt-4 inline-flex items-center gap-2 border border-red-300 bg-card px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />Supprimer
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.planifications.selectSlotHint}</p>
            )}
          </div>

          <div className="border border-border/60 bg-muted/50 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.planifications.thisWeek}</p>
            <h3 className="mt-1 font-display text-lg text-foreground">{t.planifications.allSlots}</h3>
            <ul className="mt-4 max-h-[min(20rem,45vh)] space-y-2 overflow-y-auto pr-1">
              {plansInWeek.length === 0 ? <li className="text-xs text-muted-foreground">{t.planifications.noSlotsWeek}</li> :
                plansInWeek.map((p: any) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => { setSelectedPlanId(p.id); setWeekStart(startOfWeek(parseISO(p.date), { weekStartsOn: 1 })); }}
                      className={cn("flex w-full items-start justify-between gap-2 border border-border/80 bg-card px-2.5 py-2 text-left text-xs shadow-sm transition hover:border-border", selectedPlanId === p.id && "ring-1 ring-primary")}>
                      <div className="min-w-0"><p className="font-medium text-foreground">{p.title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{p.detail}</p></div>
                      <div className="shrink-0 text-right"><p className="font-medium tabular-nums text-foreground/90">{p.time}</p><p className="text-[10px] capitalize text-muted-foreground">{format(parseISO(p.date), "EEE d MMM", { locale: dateFnsLocale })}</p></div>
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <div className="border border-border/60 bg-card p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.planifications.monthView}</p>
            <ul className="mt-3 space-y-2 text-xs">
              {monthPlans.map((p: any) => (
                <li key={`m-${p.id}`} className="flex items-start justify-between gap-2 border-b border-border py-1.5 last:border-0">
                  <span className="font-medium text-foreground/90">{p.title}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{format(parseISO(p.date), "d/MM", { locale: dateFnsLocale })} {p.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
