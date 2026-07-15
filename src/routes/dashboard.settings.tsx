import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  getSettings,
  updateSetting,
} from "@/lib/server-settings";
import { cn } from "@/lib/utils";
import {
  softCard,
  softInput,
  labelClass,
  eyebrowClass,
  primaryPill,
  ghostPill,
  iconButton,
} from "@/lib/dash-ui";
import { toast } from "sonner";
import { Plus, Trash2, Save, Percent, Calendar, Package, GraduationCap, X, BadgeDollarSign, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Paramètres - CRM" }] }),
  component: SettingsPage,
});

type Service = { name: string; price: number; enabled: boolean };

/** Row shell: wraps on narrow screens, single line from `sm` up. */
const rowClass =
  "flex flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3.5 sm:flex-nowrap sm:gap-x-4 sm:px-6";

/** Every field in this page is a bare <input>, so it needs the full input token. */
const fieldClass = cn(softInput, "h-10 px-3 text-sm outline-none");

const checkboxClass =
  "h-4 w-4 shrink-0 accent-[#6BA53A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5E18B]/60";

function Section({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: {
  icon: any;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={cn(softCard, "overflow-hidden")}>
      <div className="border-b border-[#28396C]/10 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      {footer}
    </section>
  );
}

function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-8 sm:space-y-8">
      <header>
        <p className={eyebrowClass}>Configuration</p>
        <h1 className="mt-1.5 font-display text-2xl tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Paramètres
        </h1>
      </header>
      <div className="space-y-4 sm:space-y-6">
        <LevelsSection />
        <ServicesSection />
        <FraisSection />
        <SiblingDiscountSection />
        <PaymentDueSection />
      </div>
    </div>
  );
}

function ComboboxInput({
  value,
  onChange,
  options,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter((o) => o !== value && o.toLowerCase().includes(value.toLowerCase()));
  const show = open && filtered.length > 0;

  // Panel is portaled to <body> (fixed-positioned off the input's own rect) so it
  // isn't clipped by the settings card's `overflow-hidden`, same as every other
  // dropdown on this page (which portal via the shared shadcn Select).
  useLayoutEffect(() => {
    if (!show || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [show]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setFocused(true); }}
        onBlur={() => setTimeout(() => { setOpen(false); setFocused(false); }, 150)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(fieldClass, "w-full pr-8")}
      />
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-transform",
          focused && "rotate-180",
        )}
        aria-hidden
      />
      {show && rect
        ? createPortal(
            <div
              style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
              className="z-50 max-h-40 overflow-y-auto rounded-lg border border-[#28396C]/15 bg-popover shadow-lg"
            >
              {filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={() => { onChange(opt); setOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-[#B5E18B]/20"
                >
                  {opt}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function LevelsSection() {
  const queryClient = useQueryClient();
  const { data: levels } = useQuery({ queryKey: ["levels"], queryFn: listLevels });
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newCycle, setNewCycle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editCycle, setEditCycle] = useState("");

  const allCycles = useMemo(
    () => [...new Set((levels ?? []).map((l) => l.cycle).filter(Boolean))].sort(),
    [levels],
  );

  const create = useMutation({
    mutationFn: (input: { name: string; monthly_fee: number; cycle?: string }) => createLevel({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Niveau créé");
      setNewName("");
      setNewFee("");
      setNewCycle("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLevel({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Niveau supprimé");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const update = useMutation({
    mutationFn: (input: { id: string; name?: string; monthly_fee?: number; cycle?: string }) =>
      updateLevel({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Niveau mis à jour");
      setEditId(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const canAdd = newName.trim() !== "" && newFee !== "";

  return (
    <Section
      icon={GraduationCap}
      title="Niveaux scolaires"
      description="Définissez les niveaux, leur cycle/catégorie et leurs frais mensuels"
      footer={
        <div className={cn(rowClass, "flex-col gap-3 border-t border-[#28396C]/10 py-4 sm:flex-col")}>
          <div className="flex w-full flex-wrap items-end gap-3">
            <div className="flex-1 basis-full sm:basis-[180px]">
              <p className={cn(labelClass, "mb-1")}>Niveau</p>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex. CM2"
                aria-label="Nom du niveau"
                className={cn(fieldClass, "w-full")}
              />
            </div>
            <div className="flex-1 basis-full sm:basis-[180px]">
              <p className={cn(labelClass, "mb-1")}>Cycle / Catégorie</p>
              <ComboboxInput
                value={newCycle}
                onChange={setNewCycle}
                options={allCycles}
                placeholder="ex. Primaire"
                label="Cycle"
              />
            </div>
            <div className="flex-1 basis-full sm:basis-[140px]">
              <p className={cn(labelClass, "mb-1")}>Frais mensuels</p>
              <div className="flex items-center gap-2">
                <input
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Frais"
                  aria-label="Frais mensuels"
                  className={cn(fieldClass, "w-full")}
                />
                <span className="shrink-0 text-xs text-muted-foreground">MAD</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (canAdd) create.mutate({ name: newName.trim(), monthly_fee: Number(newFee), cycle: newCycle.trim() });
              }}
              disabled={!canAdd || create.isPending}
              className={cn(
                primaryPill,
                "w-full shrink-0 justify-center disabled:opacity-50 sm:ml-auto sm:w-auto",
              )}
            >
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          </div>
        </div>
      }
    >
      <div className="divide-y divide-[#28396C]/8">
        {levels?.map((l) =>
          editId === l.id ? (
            <div key={l.id} className={rowClass}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                aria-label="Nom du niveau"
                className={cn(fieldClass, "flex-1 basis-full sm:basis-auto")}
              />
              <div className="flex-1 basis-full sm:basis-[180px]">
                <ComboboxInput
                  value={editCycle}
                  onChange={setEditCycle}
                  options={allCycles}
                  placeholder="Cycle"
                  label="Cycle"
                />
              </div>
              <div className="flex flex-1 items-center gap-2 sm:flex-none">
                <input
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  aria-label="Frais mensuels"
                  className={cn(fieldClass, "sm:w-28")}
                />
                <span className="shrink-0 text-xs text-muted-foreground">MAD</span>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  onClick={() =>
                    update.mutate({ id: l.id, name: editName.trim(), monthly_fee: Number(editFee), cycle: editCycle.trim() })
                  }
                  disabled={update.isPending}
                  className={cn(primaryPill, "px-4 py-2 disabled:opacity-50")}
                >
                  <Save className="h-4 w-4" /> Enregistrer
                </button>
                <button onClick={() => setEditId(null)} className={iconButton} aria-label="Annuler">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div key={l.id} className={rowClass}>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {l.name}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {l.cycle || "—"}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {l.monthly_fee} MAD
              </span>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  onClick={() => {
                    setEditId(l.id);
                    setEditName(l.name);
                    setEditFee(String(l.monthly_fee));
                    setEditCycle(l.cycle);
                  }}
                  className={cn(ghostPill, "px-4 py-2 text-xs")}
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer le niveau « ${l.name} » ?`)) remove.mutate(l.id);
                  }}
                  className={cn(iconButton, "text-red-500 hover:bg-red-50 hover:text-red-600")}
                  aria-label={`Supprimer ${l.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ),
        )}
        {levels?.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
            Aucun niveau défini
          </p>
        ) : null}
      </div>
    </Section>
  );
}

function ServicesSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const saved: Service[] = settings?.services ?? [];

  // Edits are held locally and pushed on save. Writing on every keystroke would fire
  // one request (and one toast) per character, and the refetch could clobber the field.
  const [draft, setDraft] = useState<Service[] | null>(null);
  const services = draft ?? saved;
  const dirty = draft !== null;

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const save = useMutation({
    mutationFn: (value: Service[]) => updateSetting({ data: { key: "services", value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setDraft(null);
      toast.success("Services mis à jour");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const edit = (fn: (list: Service[]) => Service[]) => setDraft(fn(services));

  const addService = () => {
    if (!newName.trim() || !newPrice) return;
    edit((list) => [...list, { name: newName.trim(), price: Number(newPrice), enabled: true }]);
    setNewName("");
    setNewPrice("");
  };

  if (!settings) return null;

  const canAdd = newName.trim() !== "" && newPrice !== "";

  return (
    <Section
      icon={Package}
      title="Services"
      description="Gérez les services proposés et leurs tarifs mensuels"
      footer={
        <>
          <div className={cn(rowClass, "border-t border-[#28396C]/10 py-4")}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du service"
              aria-label="Nom du service"
              className={cn(fieldClass, "flex-1 basis-full sm:basis-auto")}
            />
            <div className="flex flex-1 items-center gap-2 sm:flex-none">
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Prix"
                aria-label="Prix du service"
                className={cn(fieldClass, "sm:w-28")}
              />
              <span className="shrink-0 text-xs text-muted-foreground">MAD</span>
            </div>
            <button
              onClick={addService}
              disabled={!canAdd}
              className={cn(
                ghostPill,
                "w-full shrink-0 justify-center disabled:opacity-50 sm:ml-auto sm:w-auto",
              )}
            >
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          </div>
          {dirty ? (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#28396C]/10 bg-muted/40 px-4 py-3 sm:px-6">
              <p className="mr-auto text-xs text-muted-foreground">
                Modifications non enregistrées
              </p>
              <button onClick={() => setDraft(null)} className={cn(ghostPill, "px-4 py-2 text-xs")}>
                Annuler
              </button>
              <button
                onClick={() => save.mutate(services)}
                disabled={save.isPending}
                className={cn(primaryPill, "px-4 py-2 text-xs disabled:opacity-50")}
              >
                <Save className="h-4 w-4" /> {save.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          ) : null}
        </>
      }
    >
      <div className="divide-y divide-[#28396C]/8">
        {services.map((svc, i) => (
          <div key={i} className={rowClass}>
            <input
              type="checkbox"
              checked={svc.enabled}
              onChange={() =>
                edit((list) =>
                  list.map((s, idx) => (idx === i ? { ...s, enabled: !s.enabled } : s)),
                )
              }
              className={checkboxClass}
              aria-label={`Activer ${svc.name}`}
            />
            <input
              value={svc.name}
              onChange={(e) =>
                edit((list) =>
                  list.map((s, idx) => (idx === i ? { ...s, name: e.target.value } : s)),
                )
              }
              aria-label="Nom du service"
              className={cn(fieldClass, "min-w-0 flex-1 basis-[10rem]")}
            />
            <div className="flex items-center gap-2">
              <input
                value={svc.price}
                onChange={(e) =>
                  edit((list) =>
                    list.map((s, idx) => (idx === i ? { ...s, price: Number(e.target.value) } : s)),
                  )
                }
                type="number"
                min="0"
                inputMode="numeric"
                aria-label="Prix du service"
                className={cn(fieldClass, "w-24")}
              />
              <span className="shrink-0 text-xs text-muted-foreground">MAD</span>
            </div>
            <button
              onClick={() => edit((list) => list.filter((_, idx) => idx !== i))}
              className={cn(
                iconButton,
                "ml-auto text-red-500 hover:bg-red-50 hover:text-red-600 sm:ml-0",
              )}
              aria-label={`Supprimer ${svc.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {services.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
            Aucun service défini
          </p>
        ) : null}
      </div>
    </Section>
  );
}

function FraisSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const saved: Service[] = settings?.frais ?? [];
  const [draft, setDraft] = useState<Service[] | null>(null);
  const frais = draft ?? saved;
  const dirty = draft !== null;
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const save = useMutation({
    mutationFn: (value: Service[]) => updateSetting({ data: { key: "frais", value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setDraft(null);
      toast.success("Frais mis à jour");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const edit = (fn: (list: Service[]) => Service[]) => setDraft(fn(frais));

  const addFrais = () => {
    if (!newName.trim() || !newPrice) return;
    edit((list) => [...list, { name: newName.trim(), price: Number(newPrice), enabled: true }]);
    setNewName("");
    setNewPrice("");
  };

  if (!settings) return null;

  const canAdd = newName.trim() !== "" && newPrice !== "";

  return (
    <Section
      icon={BadgeDollarSign}
      title="Les Frais"
      description="Frais supplémentaires sélectionnables par élève dans le wizard d'inscription"
      footer={
        <>
          <div className={cn(rowClass, "border-t border-[#28396C]/10 py-4")}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du frais"
              aria-label="Nom du frais"
              className={cn(fieldClass, "flex-1 basis-full sm:basis-auto")}
            />
            <div className="flex flex-1 items-center gap-2 sm:flex-none">
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Prix"
                aria-label="Prix du frais"
                className={cn(fieldClass, "sm:w-28")}
              />
              <span className="shrink-0 text-xs text-muted-foreground">MAD</span>
            </div>
            <button
              onClick={addFrais}
              disabled={!canAdd}
              className={cn(
                ghostPill,
                "w-full shrink-0 justify-center disabled:opacity-50 sm:ml-auto sm:w-auto",
              )}
            >
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          </div>
          {dirty ? (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#28396C]/10 bg-muted/40 px-4 py-3 sm:px-6">
              <p className="mr-auto text-xs text-muted-foreground">
                Modifications non enregistrées
              </p>
              <button onClick={() => setDraft(null)} className={cn(ghostPill, "px-4 py-2 text-xs")}>
                Annuler
              </button>
              <button
                onClick={() => save.mutate(frais)}
                disabled={save.isPending}
                className={cn(primaryPill, "px-4 py-2 text-xs disabled:opacity-50")}
              >
                <Save className="h-4 w-4" /> {save.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          ) : null}
        </>
      }
    >
      <div className="divide-y divide-[#28396C]/8">
        {frais.map((svc, i) => (
          <div key={i} className={rowClass}>
            <input
              type="checkbox"
              checked={svc.enabled}
              onChange={() =>
                edit((list) =>
                  list.map((s, idx) => (idx === i ? { ...s, enabled: !s.enabled } : s)),
                )
              }
              className={checkboxClass}
              aria-label={`Activer ${svc.name}`}
            />
            <input
              value={svc.name}
              onChange={(e) =>
                edit((list) =>
                  list.map((s, idx) => (idx === i ? { ...s, name: e.target.value } : s)),
                )
              }
              aria-label="Nom du frais"
              className={cn(fieldClass, "min-w-0 flex-1 basis-[10rem]")}
            />
            <div className="flex items-center gap-2">
              <input
                value={svc.price}
                onChange={(e) =>
                  edit((list) =>
                    list.map((s, idx) => (idx === i ? { ...s, price: Number(e.target.value) } : s)),
                  )
                }
                type="number"
                min="0"
                inputMode="numeric"
                aria-label="Prix du frais"
                className={cn(fieldClass, "w-24")}
              />
              <span className="shrink-0 text-xs text-muted-foreground">MAD</span>
            </div>
            <button
              onClick={() => edit((list) => list.filter((_, idx) => idx !== i))}
              className={cn(
                iconButton,
                "ml-auto text-red-500 hover:bg-red-50 hover:text-red-600 sm:ml-0",
              )}
              aria-label={`Supprimer ${svc.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {frais.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
            Aucun frais défini
          </p>
        ) : null}
      </div>
    </Section>
  );
}

function SiblingDiscountSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState("10");
  const [maxKids, setMaxKids] = useState("99");

  useEffect(() => {
    if (settings?.sibling_discount) {
      setEnabled(settings.sibling_discount.enabled ?? false);
      setValue(String(settings.sibling_discount.value ?? 10));
      setMaxKids(String(settings.sibling_discount.max_kids ?? 99));
    }
  }, [
    settings?.sibling_discount?.enabled,
    settings?.sibling_discount?.value,
    settings?.sibling_discount?.max_kids,
  ]);

  const save = useMutation({
    mutationFn: (val: any) => updateSetting({ data: { key: "sibling_discount", value: val } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Réduction mise à jour");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  if (!settings) return null;

  return (
    <Section
      icon={Percent}
      title="Réduction fratrie"
      description="Réduction pour les parents avec plusieurs enfants"
    >
      <div className="space-y-5 px-4 py-5 sm:px-6">
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className={checkboxClass}
          />
          Activer la réduction
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="sibling-value" className={labelClass}>
              Réduction par enfant supplémentaire
            </label>
            <div className="flex items-center gap-2">
              <input
                id="sibling-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="number"
                min="0"
                max="100"
                inputMode="numeric"
                disabled={!enabled}
                className={cn(fieldClass, "w-24 disabled:opacity-50")}
              />
              <span className="shrink-0 text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sibling-max" className={labelClass}>
              Nombre maximum d'enfants
            </label>
            <div className="flex items-center gap-2">
              <input
                id="sibling-max"
                value={maxKids}
                onChange={(e) => setMaxKids(e.target.value)}
                type="number"
                min="1"
                inputMode="numeric"
                disabled={!enabled}
                className={cn(fieldClass, "w-24 disabled:opacity-50")}
              />
              <span className="shrink-0 text-sm text-muted-foreground">enfants</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#28396C]/10 pt-4">
          <button
            onClick={() =>
              save.mutate({
                enabled,
                type: "percentage",
                value: Number(value),
                max_kids: Number(maxKids),
              })
            }
            disabled={save.isPending}
            className={cn(primaryPill, "w-full justify-center disabled:opacity-50 sm:w-auto")}
          >
            <Save className="h-4 w-4" /> {save.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Section>
  );
}

function PaymentDueSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [day, setDay] = useState("5");
  const [graceDays, setGraceDays] = useState("5");

  useEffect(() => {
    if (settings?.payment_due) {
      setDay(String(settings.payment_due.day ?? 5));
      setGraceDays(String(settings.payment_due.grace_days ?? 5));
    }
  }, [settings?.payment_due?.day, settings?.payment_due?.grace_days]);

  const save = useMutation({
    mutationFn: (val: any) => updateSetting({ data: { key: "payment_due", value: val } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Échéance mise à jour");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  if (!settings) return null;

  return (
    <Section
      icon={Calendar}
      title="Échéance des paiements"
      description="Jour d'échéance et délai de grâce avant passage en impayé"
      footer={
        <div className="border-t border-[#28396C]/10 bg-muted/40 px-4 py-3 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Un client sera marqué <strong className="text-foreground">impayé</strong> si son dernier
            paiement date d'avant le jour d'échéance + délai de grâce.
          </p>
        </div>
      }
    >
      <div className="space-y-5 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="due-day" className={labelClass}>
              Paiement dû le jour
            </label>
            <div className="flex items-center gap-2">
              <input
                id="due-day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                type="number"
                min="1"
                max="28"
                inputMode="numeric"
                className={cn(fieldClass, "w-24")}
              />
              <span className="shrink-0 text-sm text-muted-foreground">du mois</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="due-grace" className={labelClass}>
              Délai de grâce
            </label>
            <div className="flex items-center gap-2">
              <input
                id="due-grace"
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
                type="number"
                min="0"
                inputMode="numeric"
                className={cn(fieldClass, "w-24")}
              />
              <span className="shrink-0 text-sm text-muted-foreground">jours</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#28396C]/10 pt-4">
          <button
            onClick={() => save.mutate({ day: Number(day), grace_days: Number(graceDays) })}
            disabled={save.isPending}
            className={cn(primaryPill, "w-full justify-center disabled:opacity-50 sm:w-auto")}
          >
            <Save className="h-4 w-4" /> {save.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Section>
  );
}
