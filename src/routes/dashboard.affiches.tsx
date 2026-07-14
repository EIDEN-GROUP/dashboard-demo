import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CalendarDays, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, type EmployeeInput } from "@/lib/server-employees";
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
  primaryPill,
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
  /** Salaire mensuel brut, en MAD. */
  salaire: number;
  /** Congés posés   dates ISO (AAAA-MM-JJ). Vides = aucun congé planifié. */
  congeDebut: string;
  congeFin: string;
  statut: StatutEmploye;
};

type CongeState = "en_cours" | "a_venir" | "termine" | "aucun";

/** Un congé n'existe que si les deux bornes sont renseignées. */
function aConge(e: Employe) {
  return e.congeDebut.trim() !== "" && e.congeFin.trim() !== "";
}

/** Date ISO -> JJ/MM/AAAA. */
function formatDateFr(iso: string) {
  if (!iso.trim()) return " ";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

/** Durée du congé, bornes incluses. */
function joursConge(e: Employe) {
  const start = new Date(e.congeDebut);
  const end = new Date(e.congeFin);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

/** Position du congé par rapport à aujourd'hui. */
function congeState(e: Employe): CongeState {
  if (!aConge(e)) return "aucun";
  const today = new Date().toISOString().slice(0, 10);
  if (today < e.congeDebut) return "a_venir";
  if (today > e.congeFin) return "termine";
  return "en_cours";
}

const CONGE_TONE: Record<Exclude<CongeState, "aucun">, { label: string; chip: string }> = {
  en_cours: { label: "En congé", chip: "bg-[#F4E3C0] text-[#8A5A16]" },
  a_venir: { label: "Congé à venir", chip: "bg-[#EAE6BC]/70 text-[#7A6E2E]" },
  termine: { label: "Congé passé", chip: "bg-muted text-muted-foreground" },
};

/** Formate un salaire en MAD (séparateur d'espace fine, comme le reste du CRM). */
function formatSalaire(v: number) {
  return v.toLocaleString("fr-FR").replace(/ | /g, " ");
}

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

function dbToEmploye(db: Record<string, unknown>): Employe {
  return {
    id: db.id as string,
    nomComplet: (db.full_name as string) ?? "",
    poste: (db.position as string) ?? "",
    departement: (db.department as string) ?? "",
    email: (db.email as string) ?? "",
    emailPerso: (db.personal_email as string) ?? "",
    tel: (db.phone as string) ?? "",
    tel2: (db.phone2 as string) ?? "",
    cin: (db.cin as string) ?? "",
    dateNaissance: (db.birth_date as string) ?? "",
    dateEmbauche: (db.hire_date as string) ?? "",
    adresse: (db.address as string) ?? "",
    contrat: (db.contract_type as string) ?? "",
    salaire: Number(db.salary ?? 0),
    congeDebut: (db.leave_start as string) ?? "",
    congeFin: (db.leave_end as string) ?? "",
    statut: (db.status as StatutEmploye) ?? "actif",
  };
}

function employeToInput(emp: Partial<Employe>): Partial<EmployeeInput> {
  return {
    full_name: emp.nomComplet,
    position: emp.poste,
    department: emp.departement,
    email: emp.email,
    personal_email: emp.emailPerso,
    phone: emp.tel,
    phone2: emp.tel2,
    cin: emp.cin,
    birth_date: emp.dateNaissance,
    hire_date: emp.dateEmbauche,
    address: emp.adresse,
    contract_type: emp.contrat,
    salary: emp.salaire,
    leave_start: emp.congeDebut || null,
    leave_end: emp.congeFin || null,
    status: emp.statut,
  };
}

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
            <Field id="emp-salaire" label="Salaire mensuel brut">
              <p className="text-sm font-semibold text-foreground">
                {formatSalaire(employe.salaire)} {t.common.mad}
              </p>
            </Field>
            <Field id="emp-conge" label="Congés">
              <p className="text-sm font-semibold text-foreground">
                {aConge(employe)
                  ? `Du ${formatDateFr(employe.congeDebut)} au ${formatDateFr(employe.congeFin)}   ${joursConge(employe)} j`
                  : "Aucun congé planifié"}
              </p>
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
                salaire: Number(fd.get("salaire") ?? employe.salaire),
                congeDebut: String(fd.get("congeDebut") ?? employe.congeDebut),
                congeFin: String(fd.get("congeFin") ?? employe.congeFin),
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
              <Field id="ed-salaire" label={`Salaire mensuel brut (${t.common.mad})`}>
                <Input
                  id="ed-salaire"
                  name="salaire"
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={employe.salaire}
                  className={inputClass}
                />
              </Field>
              <Field id="ed-conge-debut" label="Congé   début">
                <Input
                  id="ed-conge-debut"
                  name="congeDebut"
                  type="date"
                  defaultValue={employe.congeDebut}
                  className={inputClass}
                />
              </Field>
              <Field id="ed-conge-fin" label="Congé   fin">
                <Input
                  id="ed-conge-fin"
                  name="congeFin"
                  type="date"
                  defaultValue={employe.congeFin}
                  className={inputClass}
                />
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

function AddEmployeDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (employe: Employe) => void;
}) {
  const { t } = useDashboardI18n();
  const f = t.form;
  const [statut, setStatut] = useState<StatutEmploye>("actif");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[560px]")}>
        <DialogDescription className="sr-only">Ajouter un nouvel employé à l'équipe</DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Équipe</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
              Ajouter un employé
            </DialogTitle>
          </div>
          <form
            className="max-h-[65vh] space-y-4 overflow-y-auto scroll-touch px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onCreate({
                id: `e-${Date.now()}`,
                nomComplet: String(fd.get("nomComplet") || "Nouvel employé"),
                poste: String(fd.get("poste") || ""),
                departement: String(fd.get("departement") || ""),
                email: String(fd.get("email") || ""),
                emailPerso: "",
                tel: String(fd.get("tel") || ""),
                tel2: "",
                cin: String(fd.get("cin") || ""),
                dateNaissance: "",
                dateEmbauche: String(fd.get("dateEmbauche") || ""),
                adresse: "",
                contrat: String(fd.get("contrat") || "CDI"),
                salaire: Number(fd.get("salaire") || 0),
                congeDebut: String(fd.get("congeDebut") || ""),
                congeFin: String(fd.get("congeFin") || ""),
                statut,
              });
              onOpenChange(false);
              setStatut("actif");
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="ae-nom" label={f.fullName}>
                <Input id="ae-nom" name="nomComplet" required className={inputClass} />
              </Field>
              <Field id="ae-statut" label={t.common.status}>
                <Select value={statut} onValueChange={(v) => setStatut(v as StatutEmploye)}>
                  <SelectTrigger id="ae-statut" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={softSelectContent}>
                    <SelectItem value="actif">{t.status.actif}</SelectItem>
                    <SelectItem value="inactif">{t.status.inactif}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="ae-poste" label={t.common.position}>
                <Input id="ae-poste" name="poste" className={inputClass} placeholder="Ex. Professeur des écoles" />
              </Field>
              <Field id="ae-dept" label={t.common.department}>
                <Input id="ae-dept" name="departement" className={inputClass} placeholder="Ex. Pédagogie" />
              </Field>
              <Field id="ae-email" label={f.workEmail}>
                <Input id="ae-email" name="email" type="email" className={inputClass} />
              </Field>
              <Field id="ae-tel" label={f.phone1}>
                <Input id="ae-tel" name="tel" type="tel" className={inputClass} />
              </Field>
              <Field id="ae-cin" label={f.cinPassport}>
                <Input id="ae-cin" name="cin" className={inputClass} />
              </Field>
              <Field id="ae-embauche" label={f.hireDate}>
                <Input id="ae-embauche" name="dateEmbauche" className={inputClass} placeholder="JJ/MM/AAAA" />
              </Field>
              <Field id="ae-contrat" label={f.contractType}>
                <Input id="ae-contrat" name="contrat" defaultValue="CDI" className={inputClass} />
              </Field>
              <Field id="ae-salaire" label={`Salaire mensuel brut (${t.common.mad})`}>
                <Input
                  id="ae-salaire"
                  name="salaire"
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
              <Field id="ae-conge-debut" label="Congé   début">
                <Input id="ae-conge-debut" name="congeDebut" type="date" className={inputClass} />
              </Field>
              <Field id="ae-conge-fin" label="Congé   fin">
                <Input id="ae-conge-fin" name="congeFin" type="date" className={inputClass} />
              </Field>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t.common.cancel}
              </button>
              <button type="submit" className={cn(primaryPill, "px-5 py-2")}>
                Ajouter l'employé
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Popup des dates de congé d'un employé. */
function CongeDialog({
  employe,
  open,
  onOpenChange,
}: {
  employe: Employe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useDashboardI18n();

  if (!employe) return null;
  const st = congeState(employe);
  const tone = st === "aucun" ? null : CONGE_TONE[st];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[460px]")}>
        <DialogDescription className="sr-only">Congés de {employe.nomComplet}</DialogDescription>
        <div className="border-t-4 border-t-[#CFC27A]">
          <div className="flex items-start justify-between gap-3 border-b border-border px-6 pb-4 pt-6 pr-14">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Congés</p>
              <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
                {employe.nomComplet}
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">{employe.poste}</p>
            </div>
            {tone ? (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  tone.chip,
                )}
              >
                {tone.label}
              </span>
            ) : null}
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/60 px-4 py-3">
                <p className={labelClass}>Date de début</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatDateFr(employe.congeDebut)}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 px-4 py-3">
                <p className={labelClass}>Date de fin</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatDateFr(employe.congeFin)}</p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#7A6E2E]" />
              {joursConge(employe)} jour{joursConge(employe) > 1 ? "s" : ""} de congé
            </p>
          </div>

          <div className="flex justify-end border-t border-border px-6 py-4">
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

function DeleteEmployeDialog({
  employe,
  open,
  onOpenChange,
  onConfirm,
}: {
  employe: Employe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useDashboardI18n();

  if (!employe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-w-[440px]")}>
        <DialogDescription className="sr-only">Confirmer la suppression de {employe.nomComplet}</DialogDescription>
        <div className="border-t-4 border-t-[#E25C5C]">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Équipe</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
              Supprimer cet employé ?
            </DialogTitle>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-start gap-3 rounded-2xl bg-[#F6D8D8]/50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9A2F2F]" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">{employe.nomComplet}</span>   {employe.poste} sera retiré de la liste du
                personnel. Cette action est irréversible.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-[#28396C]/15 bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 rounded-full bg-[#E25C5C] px-5 py-2 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(226,92,92,0.8)] transition hover:brightness-105"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AffichesPage() {
  const { t } = useDashboardI18n();
  const a = t.affiches;
  const queryClient = useQueryClient();
  const { data: employes = [], refetch: refetchEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const db = await listEmployees();
      return db.map(dbToEmploye);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...fields }: { id: string } & Partial<EmployeeInput>) =>
      updateEmployee({ data: { id, ...fields } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employé mis à jour"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee({ data: input }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employé ajouté"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployee({ data: id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Employé supprimé"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [congeId, setCongeId] = useState<string | null>(null);

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
  const deleting = deleteId ? employes.find((e) => e.id === deleteId) ?? null : null;
  const conge = congeId ? employes.find((e) => e.id === congeId) ?? null : null;

  return (
    <div className="space-y-8">
      <DetailEmployeDialog employe={selected} open={Boolean(selected)} onOpenChange={(o) => !o && setDetailId(null)} />
      <EditEmployeDialog
        employe={editing}
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditId(null)}
        onSave={(next) => {
          updateMutation.mutate({ id: next.id, ...employeToInput(next) });
          setEditId(null);
        }}
      />
      <AddEmployeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(emp) => {
          createMutation.mutate(employeToInput(emp) as EmployeeInput);
          setAddOpen(false);
        }}
      />
      <DeleteEmployeDialog
        employe={deleting}
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
      />
      <CongeDialog employe={conge} open={Boolean(conge)} onOpenChange={(o) => !o && setCongeId(null)} />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{a.eyebrow}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-foreground">
              <span className="font-semibold">{a.titleBold}</span>{" "}
              <span className="font-normal italic text-muted-foreground">{a.titleItalic}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{a.subtitle}</p>
          </div>
          <button type="button" onClick={() => setAddOpen(true)} className={cn(primaryPill, "shrink-0")}>
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </button>
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
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{a.table.name}</th>
                <th className="px-4 py-3">{a.table.position}</th>
                <th className="px-4 py-3">{a.table.department}</th>
                <th className="px-4 py-3">{a.table.contact}</th>
                <th className="px-4 py-3">Salaire</th>
                <th className="px-4 py-3">{a.table.status}</th>
                <th className="px-4 py-3 w-28">{a.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => {
                    setDetailId(e.id);
                    setEditId(null);
                  }}
                  className="cursor-pointer transition-colors hover:bg-[#B5E18B]/10"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{e.nomComplet}</td>
                  <td className="px-4 py-3 text-foreground/90">{e.poste}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.departement}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="block">{e.email}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{e.tel}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                    {formatSalaire(e.salaire)} <span className="text-xs font-normal text-muted-foreground">{t.common.mad}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={e.statut === "actif" ? "dark" : "neutral"}>
                        {e.statut === "actif" ? t.status.actif : t.status.inactif}
                      </Badge>
                      {(() => {
                        const st = congeState(e);
                        if (st === "aucun") return null;
                        const tone = CONGE_TONE[st];
                        return (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setCongeId(e.id);
                            }}
                            aria-label={`Congés de ${e.nomComplet}`}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition hover:brightness-95",
                              tone.chip,
                            )}
                          >
                            <CalendarDays className="h-3 w-3" />
                            {tone.label}
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                    <div className="flex gap-1">
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
                      <button
                        type="button"
                        onClick={() => setDeleteId(e.id)}
                        className={cn(
                          iconButton,
                          "hover:border-[#E25C5C]/40 hover:bg-[#F6D8D8] hover:text-[#9A2F2F]",
                        )}
                        aria-label={`Supprimer ${e.nomComplet}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
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
