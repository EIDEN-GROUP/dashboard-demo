import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listLevels, createLevel, updateLevel, deleteLevel,
  getSettings, updateSetting,
} from "@/lib/server-settings";
import { cn } from "@/lib/utils";
import {
  softCard, softInput, labelClass, eyebrowClass,
  primaryPill, ghostPill, iconButton,
} from "@/lib/dash-ui";
import { toast } from "sonner";
import { Plus, Trash2, Save, Percent, Calendar, Package } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Paramètres - CRM" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 px-4 pb-8 sm:space-y-8 sm:px-6 lg:px-8">
      <header>
        <p className={eyebrowClass}>Configuration</p>
        <h1 className="mt-1.5 font-display text-2xl tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Paramètres
        </h1>
      </header>
      <div className="space-y-4 sm:space-y-6">
        <LevelsSection />
        <ServicesSection />
        <SiblingDiscountSection />
        <PaymentDueSection />
      </div>
    </div>
  );
}

function LevelsSection() {
  const queryClient = useQueryClient();
  const { data: levels } = useQuery({ queryKey: ["levels"], queryFn: listLevels });
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");

  const create = useMutation({
    mutationFn: (input: { name: string; monthly_fee: number }) => createLevel({ data: input }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["levels"] }); toast.success("Niveau créé"); setNewName(""); setNewFee(""); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteLevel({ data: id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["levels"] }); toast.success("Niveau supprimé"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const update = useMutation({
    mutationFn: (input: { id: string; name?: string; monthly_fee?: number }) => updateLevel({ data: input }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["levels"] }); toast.success("Niveau mis à jour"); setEditId(null); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  return (
    <section className={cn(softCard, "overflow-hidden")}>
      <div className="border-b border-[#28396C]/10 px-4 py-4 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Niveaux scolaires</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Définissez les niveaux et leurs frais mensuels</p>
      </div>
      <div className="divide-y divide-[#28396C]/8">
        {levels?.map((l) => (
          <div key={l.id}>
            {editId === l.id ? (
              <div className="grid grid-cols-1 gap-2 px-4 py-3 sm:flex sm:items-center sm:gap-3 sm:px-6">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-40")}
                />
                <input
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  type="number"
                  className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-24")}
                />
                <button
                  onClick={() => update.mutate({ id: l.id, name: editName, monthly_fee: Number(editFee) })}
                  className="grid h-9 w-full place-items-center rounded-xl bg-[#28396C] text-white transition hover:bg-[#1B2A55] sm:w-9"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 sm:flex sm:items-center sm:gap-3 sm:px-6">
                <span className="text-sm text-foreground">{l.name}</span>
                <span className="justify-self-end text-sm font-medium tabular-nums text-foreground sm:justify-self-auto">{l.monthly_fee} MAD</span>
                <button
                  onClick={() => { setEditId(l.id); setEditName(l.name); setEditFee(String(l.monthly_fee)); }}
                  className="justify-self-end text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground sm:justify-self-auto"
                >
                  Modifier
                </button>
                <button
                  onClick={() => { if (confirm("Supprimer ce niveau ?")) remove.mutate(l.id); }}
                  className={cn(iconButton, "justify-self-end text-red-500 hover:bg-red-50 hover:text-red-600 sm:justify-self-auto")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 border-t border-[#28396C]/10 px-4 py-4 sm:flex sm:items-center sm:gap-3 sm:px-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom du niveau"
          className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-44")}
        />
        <input
          value={newFee}
          onChange={(e) => setNewFee(e.target.value)}
          type="number"
          placeholder="Frais mensuels"
          className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-28")}
        />
        <button
          onClick={() => { if (newName && newFee) create.mutate({ name: newName, monthly_fee: Number(newFee) }); }}
          className={cn(primaryPill, "justify-center")}
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>
    </section>
  );
}

function ServicesSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const services: Array<{ name: string; price: number; enabled: boolean }> = settings?.services ?? [];
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const save = useMutation({
    mutationFn: (value: any) => updateSetting({ data: { key: "services", value } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Services mis à jour"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const addService = () => {
    if (!newName.trim() || !newPrice) return;
    save.mutate([...services, { name: newName.trim(), price: Number(newPrice), enabled: true }]);
    setNewName("");
    setNewPrice("");
  };

  const removeService = (i: number) => {
    const next = services.filter((_, idx) => idx !== i);
    save.mutate(next);
  };

  const toggleEnabled = (i: number) => {
    const next = services.map((s, idx) => idx === i ? { ...s, enabled: !s.enabled } : s);
    save.mutate(next);
  };

  const updatePrice = (i: number, price: number) => {
    const next = services.map((s, idx) => idx === i ? { ...s, price } : s);
    save.mutate(next);
  };

  const updateName = (i: number, name: string) => {
    const next = services.map((s, idx) => idx === i ? { ...s, name } : s);
    save.mutate(next);
  };

  if (!settings) return null;

  return (
    <section className={cn(softCard, "overflow-hidden")}>
      <div className="border-b border-[#28396C]/10 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">Services</h2>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">Gérez les services proposés et leurs tarifs mensuels</p>
      </div>
      <div className="divide-y divide-[#28396C]/8">
        {services.map((svc, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 px-4 py-3 sm:flex sm:items-center sm:gap-3 sm:px-6">
            <input
              type="checkbox"
              checked={svc.enabled}
              onChange={() => toggleEnabled(i)}
              className="mt-1 h-4 w-4 self-start accent-[#6BA53A] sm:mt-0 sm:self-auto"
              title="Activer / désactiver"
            />
            <input
              value={svc.name}
              onChange={(e) => updateName(i, e.target.value)}
              className={cn(softInput, "h-9 min-w-0 px-3 text-sm outline-none")}
            />
            <input
              value={svc.price}
              onChange={(e) => updatePrice(i, Number(e.target.value))}
              type="number"
              className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-24")}
            />
            <span className="self-center text-xs text-muted-foreground">MAD</span>
            <button
              onClick={() => removeService(i)}
              className={cn(iconButton, "justify-self-end text-red-500 hover:bg-red-50 hover:text-red-600 sm:justify-self-auto")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 border-t border-[#28396C]/10 px-4 py-4 sm:flex sm:items-center sm:gap-3 sm:px-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom du service"
          className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-52")}
        />
        <input
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          type="number"
          placeholder="Prix"
          className={cn(softInput, "h-9 px-3 text-sm outline-none sm:w-24")}
        />
        <span className="text-xs text-muted-foreground">MAD</span>
        <button
          onClick={addService}
          className={cn(primaryPill, "justify-center")}
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>
    </section>
  );
}

function SiblingDiscountSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const disc = settings?.sibling_discount ?? { enabled: false, type: "percentage", value: 10, max_kids: 99 };
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState("10");
  const [maxKids, setMaxKids] = useState("99");

  useEffect(() => {
    if (settings?.sibling_discount) {
      setEnabled(settings.sibling_discount.enabled ?? false);
      setValue(String(settings.sibling_discount.value ?? 10));
      setMaxKids(String(settings.sibling_discount.max_kids ?? 99));
    }
  }, [settings?.sibling_discount?.enabled, settings?.sibling_discount?.value, settings?.sibling_discount?.max_kids]);

  const save = useMutation({
    mutationFn: (val: any) => updateSetting({ data: { key: "sibling_discount", value: val } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Réduction mise à jour"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  if (!settings) return null;

  return (
    <section className={cn(softCard, "overflow-hidden")}>
      <div className="border-b border-[#28396C]/10 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">Réduction fratrie</h2>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">Réduction pour les parents avec plusieurs enfants</p>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 py-5 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:px-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-[#6BA53A]"
          />
          Activer la réduction
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          placeholder="%"
          className={cn(softInput, "h-9 w-20 px-3 text-sm outline-none")}
        />
        <span className="text-sm text-muted-foreground">% de réduction par enfant supplémentaire</span>
        <input
          value={maxKids}
          onChange={(e) => setMaxKids(e.target.value)}
          type="number"
          placeholder="Max"
          className={cn(softInput, "h-9 w-16 px-3 text-sm outline-none")}
        />
        <span className="text-sm text-muted-foreground">max enfants</span>
        <button
          onClick={() => save.mutate({ enabled, type: "percentage", value: Number(value), max_kids: Number(maxKids) })}
          className={cn(primaryPill, "w-full justify-center sm:ml-auto sm:w-auto")}
        >
          <Save className="h-4 w-4" /> Enregistrer
        </button>
      </div>
    </section>
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Échéance mise à jour"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  if (!settings) return null;

  return (
    <section className={cn(softCard, "overflow-hidden")}>
      <div className="border-b border-[#28396C]/10 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">Échéance des paiements</h2>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">Jour d'échéance et délai de grâce avant passage en impayé</p>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 py-5 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:px-6">
        <span className={labelClass}>Paiement dû le jour</span>
        <input
          value={day}
          onChange={(e) => setDay(e.target.value)}
          type="number"
          min="1"
          max="28"
          className={cn(softInput, "h-9 w-16 px-3 text-sm outline-none")}
        />
        <span className="text-sm text-foreground">du mois</span>
        <span className={cn(labelClass, "sm:ml-4")}>Délai de grâce</span>
        <input
          value={graceDays}
          onChange={(e) => setGraceDays(e.target.value)}
          type="number"
          min="0"
          className={cn(softInput, "h-9 w-16 px-3 text-sm outline-none")}
        />
        <span className="text-sm text-foreground">jours</span>
        <button
          onClick={() => save.mutate({ day: Number(day), grace_days: Number(graceDays) })}
          className={cn(primaryPill, "w-full justify-center sm:ml-auto sm:w-auto")}
        >
          <Save className="h-4 w-4" /> Enregistrer
        </button>
      </div>
      <div className="border-t border-[#28396C]/10 bg-muted/40 px-4 py-3 sm:px-6">
        <p className="text-xs text-muted-foreground">Un client sera marqué <strong className="text-foreground">impayé</strong> si son dernier paiement date d'avant le jour d'échéance + délai de grâce.</p>
      </div>
    </section>
  );
}
