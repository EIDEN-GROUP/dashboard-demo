import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, Pencil, Search } from "lucide-react";
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

export const Route = createFileRoute("/dashboard/affiches")({
  head: () => ({ meta: [{ title: "Affiches — Équipe" }] }),
  component: AffichesPage,
});

type StatutEmploye = "actif" | "inactif";

type Employe = {
  id: string;
  nomComplet: string;
  poste: string;
  departement: string;
  email: string;
  emailPerso: string;
  tel: string;
  tel2: string;
  cin: string;
  dateNaissance: string;
  dateEmbauche: string;
  adresse: string;
  contrat: string;
  statut: StatutEmploye;
};

const dialogSurface =
  "gap-0 overflow-hidden border border-zinc-200 bg-white p-0 shadow-none sm:rounded-none rounded-none max-h-[min(90vh,720px)] w-[min(100vw-1.5rem,560px)] max-w-[min(100vw-1.5rem,560px)] [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-zinc-300 [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-zinc-100 [&>button]:focus:ring-0";

const labelClass = "text-[10px] font-medium uppercase tracking-wider text-zinc-500";

const inputClass =
  "rounded-none border-zinc-300 bg-white shadow-none focus-visible:border-zinc-950 focus-visible:ring-0";

const selectTriggerClass =
  "h-10 rounded-none border-zinc-300 bg-white shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-zinc-400";

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

/** Tag seul (sans libellé « Statut ») pour la fiche employé */
function StatutTag({ actif }: { actif: boolean }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex w-fit border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider",
        actif ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-zinc-100 text-zinc-700",
      )}
    >
      {actif ? "Actif" : "Inactif"}
    </span>
  );
}

function dash(v: string) {
  return v.trim() === "" ? "—" : v;
}

const initialEmployes: Employe[] = [
  {
    id: "e1",
    nomComplet: "Nadia El Mansouri",
    poste: "Responsable pédagogique",
    departement: "Pédagogie",
    email: "n.elmansouri@demo-crm.ma",
    emailPerso: "nadia.em@gmail.com",
    tel: "0661122001",
    tel2: "0522001122",
    cin: "AB901234",
    dateNaissance: "12/04/1985",
    dateEmbauche: "01/09/2019",
    adresse: "12 Rue Ibn Batouta, Rabat",
    contrat: "CDI",
    statut: "actif",
  },
  {
    id: "e2",
    nomComplet: "Karim Tazi",
    poste: "Comptable",
    departement: "Finance",
    email: "k.tazi@demo-crm.ma",
    emailPerso: "",
    tel: "0662233004",
    tel2: "",
    cin: "CD445566",
    dateNaissance: "03/11/1990",
    dateEmbauche: "15/01/2021",
    adresse: "Lotissement Al Andalous, Salé",
    contrat: "CDI",
    statut: "actif",
  },
  {
    id: "e3",
    nomComplet: "Sanae Benjelloun",
    poste: "Assistante administrative",
    departement: "Administration",
    email: "s.benjelloun@demo-crm.ma",
    emailPerso: "sanae.b@outlook.com",
    tel: "0614020998",
    tel2: "0666007788",
    cin: "",
    dateNaissance: "22/07/1993",
    dateEmbauche: "10/06/2022",
    adresse: "—",
    contrat: "CDD — 12 mois",
    statut: "actif",
  },
  {
    id: "e4",
    nomComplet: "Omar Radi",
    poste: "Agent d'accueil",
    departement: "Accueil",
    email: "o.radi@demo-crm.ma",
    emailPerso: "",
    tel: "0622113344",
    tel2: "",
    cin: "EE778899",
    dateNaissance: "08/02/1988",
    dateEmbauche: "01/09/2023",
    adresse: "Hay Riad, Rabat",
    contrat: "CDI",
    statut: "inactif",
  },
  {
    id: "e5",
    nomComplet: "Leila Chraibi",
    poste: "Psychologue scolaire",
    departement: "Soutien",
    email: "l.chraibi@demo-crm.ma",
    emailPerso: "leila.chraibi@proton.me",
    tel: "0669988776",
    tel2: "",
    cin: "FF112233",
    dateNaissance: "30/01/1987",
    dateEmbauche: "01/03/2020",
    adresse: "Avenue Allal Ben Abdellah, Rabat",
    contrat: "CDI",
    statut: "actif",
  },
  {
    id: "e6",
    nomComplet: "Hicham Filali",
    poste: "Technicien IT",
    departement: "Systèmes",
    email: "h.filali@demo-crm.ma",
    emailPerso: "",
    tel: "0611223344",
    tel2: "0522110099",
    cin: "GG556677",
    dateNaissance: "14/09/1991",
    dateEmbauche: "01/11/2024",
    adresse: "Temara",
    contrat: "CDD — 6 mois",
    statut: "inactif",
  },
];

function DetailEmployeDialog({
  employe,
  open,
  onOpenChange,
}: {
  employe: Employe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!employe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface}>
        <DialogDescription className="sr-only">Détails de l&apos;employé {employe.nomComplet}</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">Équipe</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-zinc-950">
              Détails de l&apos;employé
            </DialogTitle>
          </div>
          <div className="grid max-h-[60vh] grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto scroll-touch px-6 py-5 sm:grid-cols-2">
            <Field id="emp-nom" label="Nom complet">
              <p className="text-sm font-semibold text-zinc-950">{employe.nomComplet}</p>
            </Field>
            <div className="flex items-end justify-start sm:justify-end">
              <StatutTag actif={employe.statut === "actif"} />
            </div>
            <Field id="emp-naissance" label="Date de naissance">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.dateNaissance)}</p>
            </Field>
            <Field id="emp-embauche" label="Date d'embauche">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.dateEmbauche)}</p>
            </Field>
            <Field id="emp-cin" label="CIN ou passeport">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.cin)}</p>
            </Field>
            <Field id="emp-contrat" label="Type de contrat">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.contrat)}</p>
            </Field>
            <Field id="emp-email" label="Email professionnel">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.email)}</p>
            </Field>
            <Field id="emp-email-perso" label="Email personnel">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.emailPerso)}</p>
            </Field>
            <Field id="emp-tel1" label="Téléphone 1">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.tel)}</p>
            </Field>
            <Field id="emp-tel2" label="Téléphone 2">
              <p className="text-sm font-semibold text-zinc-950">{dash(employe.tel2)}</p>
            </Field>
            <Field id="emp-poste" label="Poste">
              <p className="text-sm font-semibold text-zinc-950">{employe.poste}</p>
            </Field>
            <Field id="emp-dept" label="Département">
              <p className="text-sm font-semibold text-zinc-950">{employe.departement}</p>
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="emp-adresse" className={labelClass}>
                Adresse
              </Label>
              <p id="emp-adresse" className="text-sm font-semibold text-zinc-950">
                {dash(employe.adresse)}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap justify-end border-t border-zinc-200 px-6 py-4">
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

function EditEmployeDialog({
  employe,
  open,
  onOpenChange,
  onSave,
}: {
  employe: Employe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (next: Employe) => void;
}) {
  const [statut, setStatut] = useState<StatutEmploye>("actif");

  useEffect(() => {
    if (employe) setStatut(employe.statut);
  }, [employe?.id, employe?.statut]);

  if (!employe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[560px]")}>
        <DialogDescription className="sr-only">Modifier l&apos;employé {employe.nomComplet}</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— Équipe</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-zinc-950">
              Modifier l&apos;employé
            </DialogTitle>
          </div>
          <form
            className="max-h-[65vh] space-y-4 overflow-y-auto scroll-touch px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSave({
                ...employe,
                nomComplet: String(fd.get("nomComplet") ?? employe.nomComplet),
                poste: String(fd.get("poste") ?? employe.poste),
                departement: String(fd.get("departement") ?? employe.departement),
                email: String(fd.get("email") ?? employe.email),
                emailPerso: String(fd.get("emailPerso") ?? employe.emailPerso),
                tel: String(fd.get("tel") ?? employe.tel),
                tel2: String(fd.get("tel2") ?? employe.tel2),
                cin: String(fd.get("cin") ?? employe.cin),
                dateNaissance: String(fd.get("dateNaissance") ?? employe.dateNaissance),
                dateEmbauche: String(fd.get("dateEmbauche") ?? employe.dateEmbauche),
                adresse: String(fd.get("adresse") ?? employe.adresse),
                contrat: String(fd.get("contrat") ?? employe.contrat),
                statut,
              });
              onOpenChange(false);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="ed-nom" label="Nom complet">
                <Input id="ed-nom" name="nomComplet" defaultValue={employe.nomComplet} required className={inputClass} />
              </Field>
              <Field id="ed-statut" label="Statut">
                <Select value={statut} onValueChange={(v) => setStatut(v as StatutEmploye)}>
                  <SelectTrigger id="ed-statut" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-zinc-200">
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="ed-poste" label="Poste">
                <Input id="ed-poste" name="poste" defaultValue={employe.poste} className={inputClass} />
              </Field>
              <Field id="ed-dept" label="Département">
                <Input id="ed-dept" name="departement" defaultValue={employe.departement} className={inputClass} />
              </Field>
              <Field id="ed-email" label="Email professionnel">
                <Input id="ed-email" name="email" type="email" defaultValue={employe.email} className={inputClass} />
              </Field>
              <Field id="ed-email-perso" label="Email personnel">
                <Input id="ed-email-perso" name="emailPerso" type="email" defaultValue={employe.emailPerso} className={inputClass} />
              </Field>
              <Field id="ed-tel" label="Téléphone 1">
                <Input id="ed-tel" name="tel" type="tel" defaultValue={employe.tel} className={inputClass} />
              </Field>
              <Field id="ed-tel2" label="Téléphone 2">
                <Input id="ed-tel2" name="tel2" type="tel" defaultValue={employe.tel2} className={inputClass} />
              </Field>
              <Field id="ed-naissance" label="Date de naissance">
                <Input id="ed-naissance" name="dateNaissance" defaultValue={employe.dateNaissance} className={inputClass} />
              </Field>
              <Field id="ed-embauche" label="Date d'embauche">
                <Input id="ed-embauche" name="dateEmbauche" defaultValue={employe.dateEmbauche} className={inputClass} />
              </Field>
              <Field id="ed-cin" label="CIN ou passeport">
                <Input id="ed-cin" name="cin" defaultValue={employe.cin} className={inputClass} />
              </Field>
              <Field id="ed-contrat" label="Type de contrat">
                <Input id="ed-contrat" name="contrat" defaultValue={employe.contrat} className={inputClass} />
              </Field>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="ed-adresse" className={labelClass}>
                  Adresse
                </Label>
                <Input id="ed-adresse" name="adresse" defaultValue={employe.adresse} className={inputClass} />
              </div>
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

function AffichesPage() {
  const [employes, setEmployes] = useState<Employe[]>(initialEmployes);
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employes;
    return employes.filter(
      (e) =>
        e.nomComplet.toLowerCase().includes(q) ||
        e.poste.toLowerCase().includes(q) ||
        e.departement.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q),
    );
  }, [search, employes]);

  const selected = detailId ? employes.find((e) => e.id === detailId) ?? null : null;
  const editing = editId ? employes.find((e) => e.id === editId) ?? null : null;

  return (
    <div className="space-y-8">
      <DetailEmployeDialog employe={selected} open={Boolean(selected)} onOpenChange={(o) => !o && setDetailId(null)} />
      <EditEmployeDialog
        employe={editing}
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditId(null)}
        onSave={(next) => {
          setEmployes((list) => list.map((row) => (row.id === next.id ? next : row)));
        }}
      />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Équipe — CRM</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-zinc-950">
            <span className="font-semibold">Affiches</span>{" "}
            <span className="font-normal italic text-zinc-500">et personnel</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Liste des employés et leur statut (données de démonstration).
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un employé…"
              className={cn(inputClass, "pl-9")}
              aria-label="Rechercher"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          {filtered.length} employé{filtered.length !== 1 ? "s" : ""}
        </p>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">— Liste des employés</p>
        </div>
        <div className="overflow-x-auto scroll-touch">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Poste</th>
                <th className="px-4 py-3">Département</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium text-zinc-950">{e.nomComplet}</td>
                  <td className="px-4 py-3 text-zinc-800">{e.poste}</td>
                  <td className="px-4 py-3 text-zinc-700">{e.departement}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    <span className="block">{e.email}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{e.tel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={e.statut === "actif" ? "dark" : "neutral"}>
                      {e.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailId(e.id);
                          setEditId(null);
                        }}
                        className="grid h-9 w-9 place-items-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                        aria-label={`Voir ${e.nomComplet}`}
                      >
                        <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(e.id);
                          setDetailId(null);
                        }}
                        className="grid h-9 w-9 place-items-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                        aria-label={`Modifier ${e.nomComplet}`}
                      >
                        <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
