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
import { interpolate, useDashboardI18n } from "@/lib/landing-i18n";
import {
  softCard,
  softInput as inputClass,
  softSelectTrigger as selectTriggerClass,
  softSelectContent,
  dialogSurface,
  labelClass,
  iconButton,
} from "@/lib/dash-ui";

export const Route = createFileRoute("/dashboard/affiches")({
  head: () => ({ meta: [{ title: "Affiches   Équipe" }] }),
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        variant === "dark"
          ? "bg-[#B5E18B]/30 text-[#3E6420]"
          : "bg-muted text-foreground/70",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", variant === "dark" ? "bg-[#6BA53A]" : "bg-current")} aria-hidden />
      {children}
    </span>
  );
}

/** Tag seul (sans libellé « Statut ») pour la fiche employé */
function StatutTag({ actif }: { actif: boolean }) {
  const { t } = useDashboardI18n();
  return (
    <span
      role="status"
      className={cn(
        "inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider",
        actif ? "bg-[#B5E18B]/30 text-[#3E6420]" : "bg-muted text-muted-foreground",
      )}
    >
      {actif ? t.status.actif : t.status.inactif}
    </span>
  );
}

function dash(v: string) {
  return v.trim() === "" ? " " : v;
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
    adresse: " ",
    contrat: "CDD   12 mois",
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
    contrat: "CDD   6 mois",
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
  const { t } = useDashboardI18n();
  const f = t.form;
  const a = t.affiches;

  if (!employe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface}>
        <DialogDescription className="sr-only">
          {interpolate(a.detailModal.srDesc, { name: employe.nomComplet })}
        </DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.team}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
              {a.detailModal.title}
            </DialogTitle>
          </div>
          <div className="grid max-h-[60vh] grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto scroll-touch px-6 py-5 sm:grid-cols-2">
            <Field id="emp-nom" label={f.fullName}>
              <p className="text-sm font-semibold text-foreground">{employe.nomComplet}</p>
            </Field>
            <div className="flex items-end justify-start sm:justify-end">
              <StatutTag actif={employe.statut === "actif"} />
            </div>
            <Field id="emp-naissance" label={f.birthDate}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.dateNaissance)}</p>
            </Field>
            <Field id="emp-embauche" label={f.hireDate}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.dateEmbauche)}</p>
            </Field>
            <Field id="emp-cin" label={f.cinPassport}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.cin)}</p>
            </Field>
            <Field id="emp-contrat" label={f.contractType}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.contrat)}</p>
            </Field>
            <Field id="emp-email" label={f.workEmail}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.email)}</p>
            </Field>
            <Field id="emp-email-perso" label={f.personalEmail}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.emailPerso)}</p>
            </Field>
            <Field id="emp-tel1" label={f.phone1}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.tel)}</p>
            </Field>
            <Field id="emp-tel2" label={f.phone2}>
              <p className="text-sm font-semibold text-foreground">{dash(employe.tel2)}</p>
            </Field>
            <Field id="emp-poste" label={t.common.position}>
              <p className="text-sm font-semibold text-foreground">{employe.poste}</p>
            </Field>
            <Field id="emp-dept" label={t.common.department}>
              <p className="text-sm font-semibold text-foreground">{employe.departement}</p>
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="emp-adresse" className={labelClass}>
                {t.common.address}
              </Label>
              <p id="emp-adresse" className="text-sm font-semibold text-foreground">
                {dash(employe.adresse)}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap justify-end border-t border-border px-6 py-4">
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
  const { t } = useDashboardI18n();
  const f = t.form;
  const a = t.affiches;
  const [statut, setStatut] = useState<StatutEmploye>("actif");

  useEffect(() => {
    if (employe) setStatut(employe.statut);
  }, [employe?.id, employe?.statut]);

  if (!employe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[560px]")}>
        <DialogDescription className="sr-only">
          {interpolate(a.editModal.srDesc, { name: employe.nomComplet })}
        </DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{a.editModal.eyebrow}</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
              {a.editModal.title}
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
              <Field id="ed-nom" label={f.fullName}>
                <Input id="ed-nom" name="nomComplet" defaultValue={employe.nomComplet} required className={inputClass} />
              </Field>
              <Field id="ed-statut" label={t.common.status}>
                <Select value={statut} onValueChange={(v) => setStatut(v as StatutEmploye)}>
                  <SelectTrigger id="ed-statut" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="actif">{t.status.actif}</SelectItem>
                    <SelectItem value="inactif">{t.status.inactif}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="ed-poste" label={t.common.position}>
                <Input id="ed-poste" name="poste" defaultValue={employe.poste} className={inputClass} />
              </Field>
              <Field id="ed-dept" label={t.common.department}>
                <Input id="ed-dept" name="departement" defaultValue={employe.departement} className={inputClass} />
              </Field>
              <Field id="ed-email" label={f.workEmail}>
                <Input id="ed-email" name="email" type="email" defaultValue={employe.email} className={inputClass} />
              </Field>
              <Field id="ed-email-perso" label={f.personalEmail}>
                <Input id="ed-email-perso" name="emailPerso" type="email" defaultValue={employe.emailPerso} className={inputClass} />
              </Field>
              <Field id="ed-tel" label={f.phone1}>
                <Input id="ed-tel" name="tel" type="tel" defaultValue={employe.tel} className={inputClass} />
              </Field>
              <Field id="ed-tel2" label={f.phone2}>
                <Input id="ed-tel2" name="tel2" type="tel" defaultValue={employe.tel2} className={inputClass} />
              </Field>
              <Field id="ed-naissance" label={f.birthDate}>
                <Input id="ed-naissance" name="dateNaissance" defaultValue={employe.dateNaissance} className={inputClass} />
              </Field>
              <Field id="ed-embauche" label={f.hireDate}>
                <Input id="ed-embauche" name="dateEmbauche" defaultValue={employe.dateEmbauche} className={inputClass} />
              </Field>
              <Field id="ed-cin" label={f.cinPassport}>
                <Input id="ed-cin" name="cin" defaultValue={employe.cin} className={inputClass} />
              </Field>
              <Field id="ed-contrat" label={f.contractType}>
                <Input id="ed-contrat" name="contrat" defaultValue={employe.contrat} className={inputClass} />
              </Field>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="ed-adresse" className={labelClass}>
                  {t.common.address}
                </Label>
                <Input id="ed-adresse" name="adresse" defaultValue={employe.adresse} className={inputClass} />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#B5E18B] px-5 py-2 text-sm font-bold text-[#28396C] shadow-[0_14px_30px_-14px_rgba(107,165,58,0.7)] transition hover:brightness-105"
              >
                {t.common.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AffichesPage() {
  const { t } = useDashboardI18n();
  const a = t.affiches;
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
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{a.eyebrow}</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-foreground">
            <span className="font-semibold">{a.titleBold}</span>{" "}
            <span className="font-normal italic text-muted-foreground">{a.titleItalic}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{a.subtitle}</p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={a.searchPlaceholder}
              className={cn(inputClass, "pl-9")}
              aria-label={a.searchAria}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length === 1
            ? a.employeesCountOne
            : interpolate(a.employeesCountMany, { count: filtered.length })}
        </p>
      </section>

      <section className={cn(softCard, "overflow-hidden")}>
        <div className="border-b border-[#28396C]/10 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{a.employeeList}</p>
        </div>
        <div className="overflow-x-auto scroll-touch">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{a.table.name}</th>
                <th className="px-4 py-3">{a.table.position}</th>
                <th className="px-4 py-3">{a.table.department}</th>
                <th className="px-4 py-3">{a.table.contact}</th>
                <th className="px-4 py-3">{a.table.status}</th>
                <th className="px-4 py-3 w-28">{a.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-muted/80">
                  <td className="px-4 py-3 font-medium text-foreground">{e.nomComplet}</td>
                  <td className="px-4 py-3 text-foreground/90">{e.poste}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.departement}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="block">{e.email}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{e.tel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={e.statut === "actif" ? "dark" : "neutral"}>
                      {e.statut === "actif" ? t.status.actif : t.status.inactif}
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
                        className={iconButton}
                        aria-label={interpolate(a.viewAria, { name: e.nomComplet })}
                      >
                        <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(e.id);
                          setDetailId(null);
                        }}
                        className={iconButton}
                        aria-label={interpolate(a.editAria, { name: e.nomComplet })}
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
