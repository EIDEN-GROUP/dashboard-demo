import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm/familles")({
  head: () => ({ meta: [{ title: "Parents   CRM" }] }),
  component: CrmParentsPage,
});

type StadeCrm = "nouveau" | "converti";
type PaymentStatus = "impaye" | "paye";

type Client = {
  id: string;
  parent: string;
  child: string;
  childSubtitle?: string;
  email: string;
  phone: string;
  profil: string;
  stade: StadeCrm;
  payment: PaymentStatus;
  mensuel: number;
  dette: number;
  overdue: boolean;
  dob: string;
  pere: string;
  mere: string;
  cin: string;
  email2: string;
  tel2: string;
  niveau: string;
  jourPaiement?: number;
};

const inputClass =
  "rounded-none border-zinc-300 bg-white shadow-none focus-visible:border-zinc-950 focus-visible:ring-0";

const selectTriggerClass =
  "h-10 rounded-none border-zinc-300 bg-white shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-zinc-400";

const labelClass = "text-[10px] font-medium uppercase tracking-wider text-zinc-500";

const dialogSurface =
  "gap-0 overflow-hidden border border-zinc-200 bg-white p-0 shadow-none sm:rounded-none rounded-none max-h-[min(90vh,720px)] w-[min(100vw-1.5rem,560px)] max-w-[min(100vw-1.5rem,560px)] [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-zinc-300 [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-zinc-100 [&>button]:focus:ring-0";

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function Badge({ children, variant }: { children: ReactNode; variant: "neutral" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variant === "dark"
          ? "border-zinc-800 bg-zinc-900 text-white"
          : "border-zinc-300 bg-zinc-50 text-zinc-800",
      )}
    >
      <span className="h-1 w-1 shrink-0 bg-current" aria-hidden />
      {children}
    </span>
  );
}

const initialClients: Client[] = [
  {
    id: "1",
    parent: "rztest / testss",
    child: "testss",
    childSubtitle: "Enfant de 13 ans",
    email: "tehgdgh@test.com",
    phone: "0614020520",
    profil: "ENFANT DYS",
    stade: "nouveau",
    payment: "impaye",
    mensuel: 0,
    dette: 0,
    overdue: false,
    dob: "",
    pere: "testest",
    mere: "testst",
    cin: "",
    email2: "",
    tel2: "",
    niveau: "C2",
    jourPaiement: 1,
  },
  {
    id: "2",
    parent: "Famille Alami",
    child: "Yasmine",
    email: "contact.alami@example.com",
    phone: "0661122334",
    profil: "ENFANT TYPIQUE",
    stade: "converti",
    payment: "paye",
    mensuel: 1800,
    dette: 0,
    overdue: false,
    dob: "15/03/2012",
    pere: "Karim Alami",
    mere: "Sanae Alami",
    cin: "AB123456",
    email2: "",
    tel2: "",
    niveau: "CM2",
    jourPaiement: 5,
  },
  {
    id: "3",
    parent: "Benjelloun / Sara",
    child: "Sara",
    email: "sara.b@example.com",
    phone: "0611223344",
    profil: "ENFANT TDAH",
    stade: "nouveau",
    payment: "impaye",
    mensuel: 0,
    dette: 1200,
    overdue: true,
    dob: "—",
    pere: "Omar Benjelloun",
    mere: "Leila Idrissi",
    cin: "—",
    email2: "",
    tel2: "",
    niveau: "CE1",
    jourPaiement: 10,
  },
  {
    id: "4",
    parent: "Tazi / Mehdi",
    child: "Mehdi",
    email: "mehdi.parent@example.com",
    phone: "0622334455",
    profil: "ENFANT TYPIQUE",
    stade: "converti",
    payment: "paye",
    mensuel: 1800,
    dette: 0,
    overdue: false,
    dob: "02/11/2010",
    pere: "Hicham Tazi",
    mere: "Nadia Tazi",
    cin: "CD998877",
    email2: "second@example.com",
    tel2: "",
    niveau: "5e",
    jourPaiement: 1,
  },
];

function dash(v: string) {
  return v.trim() === "" ? "—" : v;
}

function CrmParentsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (overdueOnly && !c.overdue) return false;
      if (statusFilter === "nouveau" && c.stade !== "nouveau") return false;
      if (statusFilter === "converti" && c.stade !== "converti") return false;
      if (statusFilter === "impaye" && c.payment !== "impaye") return false;
      if (statusFilter === "paye" && c.payment !== "paye") return false;
      if (!q) return true;
      const blob = `${c.parent} ${c.child} ${c.email} ${c.phone}`.toLowerCase();
      return blob.includes(q);
    });
  }, [clients, search, statusFilter, overdueOnly]);

  const detail = detailId ? clients.find((c) => c.id === detailId) : null;
  const edit = editId ? clients.find((c) => c.id === editId) : null;
  const paymentClient = paymentId ? clients.find((c) => c.id === paymentId) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">CRM — Gestion</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-zinc-950 md:text-4xl">
            Mes <span className="italic text-zinc-600">clients</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Gérez vos clients et leur progression dans le pipeline de vente
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 border border-zinc-950 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-900"
        >
          <Plus className="h-4 w-4" />
          Ajouter un client
        </button>
      </header>

      <section className="border border-zinc-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">— Filtres & recherche</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, téléphone…"
              className={cn(inputClass, "pl-10")}
              aria-label="Recherche clients"
            />
          </div>
          <div className="w-full min-w-[11rem] lg:w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={selectTriggerClass} aria-label="Filtrer par statut">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-zinc-200">
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="nouveau">Stade : Nouveau</SelectItem>
                <SelectItem value="converti">Stade : Converti</SelectItem>
                <SelectItem value="impaye">Paiement : Impayé</SelectItem>
                <SelectItem value="paye">Paiement : Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800">
            <Checkbox
              checked={overdueOnly}
              onCheckedChange={(v) => setOverdueOnly(v === true)}
              className="rounded-none border-zinc-400 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white data-[state=checked]:border-zinc-900"
            />
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 bg-zinc-900" aria-hidden />
              En retard
            </span>
          </label>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {filtered.length} client{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
        </p>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">— Liste des clients</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Enfant</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Profil</th>
                <th className="px-4 py-3">Stade CRM</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mensuel</th>
                <th className="px-4 py-3">Dette</th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium text-zinc-950">{c.parent}</td>
                  <td className="px-4 py-3 text-zinc-800">
                    <span className="block">{c.child}</span>
                    {c.childSubtitle ? (
                      <span className="mt-0.5 block text-xs text-zinc-500">{c.childSubtitle}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    <span className="block">{c.email}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{c.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-700">{c.profil}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.stade === "converti" ? "dark" : "neutral"}>
                      {c.stade === "nouveau" ? "Nouveau" : "Converti"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.payment === "paye" ? "dark" : "neutral"}>
                      {c.payment === "impaye" ? "Impayé" : "Payé"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-800">{c.mensuel} MAD</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-800">{c.dette} MAD</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailId(c.id)}
                        className="grid h-9 w-9 place-items-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                        aria-label={`Voir ${c.child}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(c.id)}
                        className="grid h-9 w-9 place-items-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                        aria-label={`Modifier ${c.child}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">Aucun client ne correspond aux filtres.</p>
        ) : null}
      </section>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onCreated={(row) => setClients((p) => [...p, row])} />

      {detail ? (
        <DetailClientDialog
          client={detail}
          open={!!detailId}
          onOpenChange={(o) => !o && setDetailId(null)}
          onPayment={() => {
            setPaymentId(detail.id);
            setDetailId(null);
          }}
        />
      ) : null}

      {paymentClient ? (
        <PaymentDialog
          clientLabel={paymentClient.parent}
          open={!!paymentId}
          onOpenChange={(o) => {
            if (!o) setPaymentId(null);
          }}
        />
      ) : null}

      {edit ? (
        <EditClientDialog
          key={edit.id}
          client={edit}
          open={!!editId}
          onOpenChange={(o) => !o && setEditId(null)}
          onSave={(patch) => {
            setClients((prev) => prev.map((x) => (x.id === edit.id ? { ...x, ...patch } : x)));
            setEditId(null);
          }}
        />
      ) : null}
    </div>
  );
}

function AddClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (row: Client) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[640px]")}>
        <DialogDescription className="sr-only">Créer un nouveau client</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— Ajouter un client</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-zinc-950">
              Nouveau client CRM
            </DialogTitle>
          </div>
          <form
            className="max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const parent = String(fd.get("parent") || "Nouveau parent");
              const child = String(fd.get("child") || "Enfant");
              onCreated({
                id: `n-${Date.now()}`,
                parent,
                child,
                email: String(fd.get("email1") || ""),
                phone: String(fd.get("tel1") || ""),
                profil: "ENFANT TYPIQUE",
                stade: "nouveau",
                payment: "impaye",
                mensuel: 0,
                dette: 0,
                overdue: false,
                dob: "",
                pere: "",
                mere: "",
                cin: "",
                email2: "",
                tel2: "",
                niveau: String(fd.get("niveau") || ""),
                jourPaiement: 1,
              });
              onOpenChange(false);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="nc-parent" label="Parent (nom affiché)">
                <Input id="nc-parent" name="parent" required className={inputClass} placeholder="Nom / Nom" />
              </Field>
              <Field id="nc-child" label="Nom d'élève">
                <Input id="nc-child" name="child" required className={inputClass} />
              </Field>
              <Field id="nc-email" label="Email 1">
                <Input id="nc-email" name="email1" type="email" className={inputClass} />
              </Field>
              <Field id="nc-tel" label="Téléphone 1">
                <Input id="nc-tel" name="tel1" type="tel" className={inputClass} />
              </Field>
              <Field id="nc-niveau" label="Niveau">
                <Input id="nc-niveau" name="niveau" className={inputClass} placeholder="ex. CM2" />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                Ajouter le client
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailClientDialog({
  client,
  open,
  onOpenChange,
  onPayment,
}: {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface}>
        <DialogDescription className="sr-only">Détails du client {client.child}</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">CRM</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-zinc-950">
              Détails du client
            </DialogTitle>
          </div>
          <div className="grid max-h-[60vh] grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            <Field id="d-eleve" label="Nom d'élève">
              <p className="text-sm font-semibold text-zinc-950">{client.child}</p>
            </Field>
            <Field id="d-dob" label="Date de naissance">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.dob)}</p>
            </Field>
            <Field id="d-pere" label="Nom du père">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.pere)}</p>
            </Field>
            <Field id="d-mere" label="Nom de mère">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.mere)}</p>
            </Field>
            <Field id="d-cin" label="CIN ou passeport">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.cin)}</p>
            </Field>
            <Field id="d-email1" label="Email 1">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.email)}</p>
            </Field>
            <Field id="d-email2" label="Email 2">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.email2)}</p>
            </Field>
            <Field id="d-tel1" label="Téléphone 1">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.phone)}</p>
            </Field>
            <Field id="d-tel2" label="Téléphone 2">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.tel2)}</p>
            </Field>
            <Field id="d-niveau" label="Niveau">
              <p className="text-sm font-semibold text-zinc-950">{dash(client.niveau)}</p>
            </Field>
            <Field id="d-profil" label="Profil">
              <p className="text-sm font-semibold text-zinc-950">{client.profil}</p>
            </Field>
            <Field id="d-frais" label="Frais mensuels">
              <p className="text-sm font-semibold text-zinc-950">{client.mensuel} MAD</p>
            </Field>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                onPayment();
                onOpenChange(false);
              }}
              className="inline-flex items-center gap-2 border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
            >
              <Plus className="h-4 w-4" />
              Enregistrer un paiement
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({
  clientLabel,
  open,
  onOpenChange,
}: {
  clientLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[480px]")}>
        <DialogDescription className="sr-only">Enregistrer un paiement pour {clientLabel}</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— CRM</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-zinc-950">
              Enregistrer un paiement
            </DialogTitle>
          </div>
          <form
            className="space-y-4 px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <Field id="pay-montant" label="Montant (MAD)">
              <Input id="pay-montant" name="montant" type="number" defaultValue={0} min={0} className={inputClass} />
            </Field>
            <Field id="pay-date" label="Date de paiement">
              <Input id="pay-date" name="date" type="date" className={inputClass} defaultValue="2026-05-12" />
            </Field>
            <Field id="pay-mode" label="Mode de paiement">
              <Select name="mode" defaultValue="especes">
                <SelectTrigger id="pay-mode" className={selectTriggerClass}>
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-zinc-200">
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="carte">Carte</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                Confirmer le paiement
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditClientDialog({
  client,
  open,
  onOpenChange,
  onSave,
}: {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<Client>) => void;
}) {
  const [profil, setProfil] = useState(client.profil);
  const [stade, setStade] = useState<StadeCrm>(client.stade);

  useEffect(() => {
    setProfil(client.profil);
    setStade(client.stade);
  }, [client.id, client.profil, client.stade]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[560px]")}>
        <DialogDescription className="sr-only">Modifier le client {client.child}</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— CRM</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-zinc-950">
              Modifier le client
            </DialogTitle>
          </div>
          <form
            className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSave({
                parent: String(fd.get("parent") || client.parent),
                child: String(fd.get("child") || client.child),
                email: String(fd.get("email") || client.email),
                phone: String(fd.get("phone") || client.phone),
                profil,
                stade,
                mensuel: Number(fd.get("mensuel") ?? client.mensuel),
                jourPaiement: Number(fd.get("jour") ?? client.jourPaiement ?? 1),
              });
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="e-parent" label="Parent">
                <Input id="e-parent" name="parent" defaultValue={client.parent} className={inputClass} />
              </Field>
              <Field id="e-child" label="Enfant">
                <Input id="e-child" name="child" defaultValue={client.child} className={inputClass} />
              </Field>
              <Field id="e-email" label="Email">
                <Input id="e-email" name="email" type="email" defaultValue={client.email} className={inputClass} />
              </Field>
              <Field id="e-phone" label="Téléphone">
                <Input id="e-phone" name="phone" type="tel" defaultValue={client.phone} className={inputClass} />
              </Field>
              <Field id="e-profil" label="Profil">
                <Select value={profil} onValueChange={setProfil}>
                  <SelectTrigger id="e-profil" className={selectTriggerClass}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-zinc-200">
                    <SelectItem value="ENFANT DYS">Enfant Dys</SelectItem>
                    <SelectItem value="ENFANT TYPIQUE">Enfant typique</SelectItem>
                    <SelectItem value="ENFANT TDAH">Enfant TDAH</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-stade" label="Stade CRM">
                <Select value={stade} onValueChange={(v) => setStade(v as StadeCrm)}>
                  <SelectTrigger id="e-stade" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-zinc-200">
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="converti">Converti</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="e-mensuel" label="Frais mensuels (MAD)">
                <Input
                  id="e-mensuel"
                  name="mensuel"
                  type="number"
                  min={0}
                  defaultValue={client.mensuel}
                  className={inputClass}
                />
              </Field>
              <Field id="e-jour" label="Jour de paiement (1-31)">
                <Input
                  id="e-jour"
                  name="jour"
                  type="number"
                  min={1}
                  max={31}
                  defaultValue={client.jourPaiement ?? 1}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
