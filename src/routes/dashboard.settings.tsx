import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listLevels, createLevel, updateLevel, deleteLevel,
  getSettings, updateSetting,
} from "@/lib/server-settings";
import { toast } from "sonner";
import { Plus, Trash2, Save, Bus, Percent, Calendar, Package } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Paramètres - CRM" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 p-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Configuration</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">Paramètres</h1>
      </div>
      <LevelsSection />
      <ServicesSection />
      <SiblingDiscountSection />
      <PaymentDueSection />
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
    <section className="rounded-none border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Niveaux scolaires</h2>
        <p className="text-xs text-muted-foreground">Définissez les niveaux et leurs frais mensuels</p>
      </div>
      <div className="divide-y divide-border">
        {levels?.map((l) => (
          <div key={l.id} className="flex items-center gap-3 px-6 py-3">
            {editId === l.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-40 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
                <input value={editFee} onChange={(e) => setEditFee(e.target.value)} type="number" className="h-8 w-24 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
                <button onClick={() => update.mutate({ id: l.id, name: editName, monthly_fee: Number(editFee) })} className="ml-auto grid h-8 w-8 place-items-center border border-border bg-primary text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 text-sm text-foreground">{l.name}</span>
                <span className="text-sm font-medium tabular-nums text-foreground">{l.monthly_fee} MAD</span>
                <button onClick={() => { setEditId(l.id); setEditName(l.name); setEditFee(String(l.monthly_fee)); }} className="text-xs text-muted-foreground underline hover:text-foreground">Modifier</button>
                <button onClick={() => { if (confirm("Supprimer ce niveau ?")) remove.mutate(l.id); }} className="grid h-8 w-8 place-items-center text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-border px-6 py-3">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du niveau" className="h-8 w-40 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
        <input value={newFee} onChange={(e) => setNewFee(e.target.value)} type="number" placeholder="Frais mensuels" className="h-8 w-24 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
        <button onClick={() => { if (newName && newFee) create.mutate({ name: newName, monthly_fee: Number(newFee) }); }} className="flex items-center gap-1 border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Ajouter</button>
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
    <section className="rounded-none border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">Services</h2>
        </div>
        <p className="text-xs text-muted-foreground">Gérez les services proposés et leurs tarifs mensuels</p>
      </div>
      <div className="divide-y divide-border">
        {services.map((svc, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3">
            <input
              type="checkbox"
              checked={svc.enabled}
              onChange={() => toggleEnabled(i)}
              className="h-4 w-4"
              title="Activer / désactiver"
            />
            <input
              value={svc.name}
              onChange={(e) => updateName(i, e.target.value)}
              className="h-8 min-w-0 flex-1 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={svc.price}
              onChange={(e) => updatePrice(i, Number(e.target.value))}
              type="number"
              className="h-8 w-24 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground shrink-0">MAD</span>
            <button
              onClick={() => removeService(i)}
              className="grid h-8 w-8 shrink-0 place-items-center text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-border px-6 py-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom du service"
          className="h-8 w-48 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          type="number"
          placeholder="Prix"
          className="h-8 w-24 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary"
        />
        <span className="text-xs text-muted-foreground">MAD</span>
        <button
          onClick={addService}
          className="flex items-center gap-1 border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter
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

  const save = useMutation({
    mutationFn: (val: any) => updateSetting({ data: { key: "sibling_discount", value: val } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Réduction mise à jour"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  if (!settings) return null;

  return (
    <section className="rounded-none border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">Réduction fratrie</h2>
        </div>
        <p className="text-xs text-muted-foreground">Réduction pour les parents avec plusieurs enfants</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-6 py-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
          Activer la réduction
        </label>
        <input value={value} onChange={(e) => setValue(e.target.value)} type="number" placeholder="% réduction" className="h-8 w-20 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
        <span className="text-xs text-muted-foreground">% de réduction par enfant supplémentaire</span>
        <input value={maxKids} onChange={(e) => setMaxKids(e.target.value)} type="number" placeholder="Max" className="h-8 w-16 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
        <span className="text-xs text-muted-foreground">max enfants</span>
        <button onClick={() => save.mutate({ enabled, type: "percentage", value: Number(value), max_kids: Number(maxKids) })} className="ml-auto flex items-center gap-1 border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Save className="h-3.5 w-3.5" /> Enregistrer</button>
      </div>
    </section>
  );
}

function PaymentDueSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const due = settings?.payment_due ?? { day: 5, grace_days: 5 };
  const [day, setDay] = useState("5");
  const [graceDays, setGraceDays] = useState("5");

  const save = useMutation({
    mutationFn: (val: any) => updateSetting({ data: { key: "payment_due", value: val } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Échéance mise à jour"); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  if (!settings) return null;

  return (
    <section className="rounded-none border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">Échéance des paiements</h2>
        </div>
        <p className="text-xs text-muted-foreground">Jour d'échéance et délai de grâce avant passage en impayé</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-6 py-4">
        <span className="text-sm text-foreground">Paiement dû le jour</span>
        <input value={day} onChange={(e) => setDay(e.target.value)} type="number" min="1" max="28" className="h-8 w-16 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
        <span className="text-sm text-foreground">du mois</span>
        <span className="text-sm text-foreground ml-4">Délai de grâce</span>
        <input value={graceDays} onChange={(e) => setGraceDays(e.target.value)} type="number" min="0" className="h-8 w-16 rounded-none border border-border bg-background px-2 text-sm outline-none focus:border-primary" />
        <span className="text-sm text-foreground">jours</span>
        <button onClick={() => save.mutate({ day: Number(day), grace_days: Number(graceDays) })} className="ml-auto flex items-center gap-1 border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Save className="h-3.5 w-3.5" /> Enregistrer</button>
      </div>
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <p className="text-xs text-muted-foreground">Un client sera marqué <strong>impayé</strong> si son dernier paiement date d'avant le jour d'échéance + délai de grâce.</p>
      </div>
    </section>
  );
}