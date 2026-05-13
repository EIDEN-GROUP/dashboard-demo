import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Users,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "CRM   Plateforme" }] }),
  component: CrmDash,
});

const funnel = [
  { m: "Sept", v: 22 },
  { m: "Oct", v: 31 },
  { m: "Nov", v: 28 },
  { m: "Déc", v: 18 },
  { m: "Jan", v: 42 },
  { m: "Fév", v: 51 },
  { m: "Mar", v: 47 },
];

const filterTags = ["CLIENTS", "PAIEMENTS", "DETTE", "COLLECTE"] as const;

const metrics = [
  {
    k: "01",
    label: "TOTAL CLIENTS",
    value: "4",
    sub: "1 actif",
    badge: "Actif",
    borderClass: "border-t-zinc-900",
    icon: Users,
    to: "/dashboard/familles",
  },
  {
    k: "02",
    label: "PAYÉS CE MOIS",
    value: "2",
    sub: "1 en attente",
    badge: "Actif",
    borderClass: "border-t-zinc-600",
    icon: CreditCard,
    to: "/dashboard/familles",
  },
  {
    k: "03",
    label: "DETTE TOTALE",
    value: "0 MAD",
    sub: "Calculé dynamiquement",
    badge: "Actif",
    borderClass: "border-t-zinc-400",
    icon: AlertCircle,
    to: "/dashboard/rapports",
  },
  {
    k: "04",
    label: "TAUX DE COLLECTE",
    value: "200%",
    sub: "Ce mois",
    badge: "Actif",
    borderClass: "border-t-zinc-300",
    icon: TrendingUp,
    to: "/dashboard/rapports",
  },
] as const;

const inputClass =
  "rounded-none border-zinc-300 bg-white shadow-none focus-visible:border-zinc-950 focus-visible:ring-0";

const selectTriggerClass =
  "h-10 rounded-none border-zinc-300 bg-white shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-zinc-400";

type QuickAction =
  | { kind: "link"; to: string; title: string; desc: string; icon: typeof Users }
  | { kind: "add-client"; title: string; desc: string; icon: typeof Plus };

const quickActions: QuickAction[] = [
  {
    kind: "link",
    to: "/dashboard/familles",
    title: "Gérer les clients",
    desc: "Voir et modifier les informations des clients.",
    icon: Users,
  },
  {
    kind: "link",
    to: "/dashboard/familles",
    title: "Enregistrer un paiement",
    desc: "Sélectionner un parent et enregistrer.",
    icon: CreditCard,
  },
  {
    kind: "link",
    to: "/dashboard/leads",
    title: "Clients en retard",
    desc: "Voir les clients avec des paiements en retard.",
    icon: Clock,
  },
  {
    kind: "add-client",
    title: "Ajouter un client",
    desc: "Créer un nouveau client depuis le dashboard.",
    icon: Plus,
  },
];

const tagClass =
  "inline-flex items-center border border-zinc-300 bg-zinc-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-800";

const badgeClass =
  "absolute right-4 top-4 border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-700";

const labelClass = "text-[10px] font-medium uppercase tracking-wider text-zinc-500";

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

function NouveauClientModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden border border-zinc-200 bg-white p-0 shadow-none sm:rounded-none rounded-none",
          "max-h-[min(90vh,860px)] w-[min(100vw-1.5rem,640px)] max-w-[min(100vw-1.5rem,640px)] translate-y-[-50%] sm:max-w-[640px]",
          "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-zinc-300 [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-zinc-100 [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0",
        )}
      >
        <DialogDescription className="sr-only">
          Formulaire pour créer un nouveau client dans le CRM.
        </DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— Ajouter un client</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-zinc-950">
              Nouveau client CRM
            </DialogTitle>
          </div>
          <form
            className="max-h-[calc(90vh-12rem)] overflow-y-auto px-6 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="crm-eleve" label="Nom d'élève">
                <Input id="crm-eleve" name="eleve" autoComplete="name" className={inputClass} />
              </Field>
              <Field id="crm-dob" label="Date de naissance">
                <div className="relative">
                  <Input
                    id="crm-dob"
                    name="naissance"
                    placeholder="jj/mm/aaaa"
                    className={cn(inputClass, "pr-10")}
                  />
                  <Calendar
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    aria-hidden
                  />
                </div>
              </Field>
              <Field id="crm-pere" label="Nom du père">
                <Input id="crm-pere" name="pere" autoComplete="additional-name" className={inputClass} />
              </Field>
              <Field id="crm-mere" label="Nom de mère">
                <Input id="crm-mere" name="mere" autoComplete="additional-name" className={inputClass} />
              </Field>
              <Field id="crm-cin" label="CIN ou passeport">
                <Input id="crm-cin" name="cin" className={inputClass} />
              </Field>
              <Field id="crm-niveau" label="Niveau">
                <Select name="niveau">
                  <SelectTrigger id="crm-niveau" className={selectTriggerClass}>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-zinc-200">
                    <SelectItem value="ps">Petite section</SelectItem>
                    <SelectItem value="ms">Moyenne section</SelectItem>
                    <SelectItem value="gs">Grande section</SelectItem>
                    <SelectItem value="cp">CP</SelectItem>
                    <SelectItem value="ce1">CE1</SelectItem>
                    <SelectItem value="ce2">CE2</SelectItem>
                    <SelectItem value="cm1">CM1</SelectItem>
                    <SelectItem value="cm2">CM2</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="crm-email1" label="Email 1">
                <Input id="crm-email1" name="email1" type="email" autoComplete="email" className={inputClass} />
              </Field>
              <Field id="crm-email2" label="Email 2">
                <Input id="crm-email2" name="email2" type="email" className={inputClass} />
              </Field>
              <Field id="crm-tel1" label="Téléphone 1">
                <Input id="crm-tel1" name="tel1" type="tel" autoComplete="tel" className={inputClass} />
              </Field>
              <Field id="crm-tel2" label="Téléphone 2">
                <Input id="crm-tel2" name="tel2" type="tel" className={inputClass} />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="crm-profil" label="Profil">
                <Select name="profil">
                  <SelectTrigger id="crm-profil" className={selectTriggerClass}>
                    <SelectValue placeholder="Sélectionner le profil" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-zinc-200">
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="tuteur">Tuteur légal</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="hidden sm:block" aria-hidden />
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-5">
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

function CrmDash() {
  const [addClientOpen, setAddClientOpen] = useState(false);

  const quickRowClass =
    "group flex w-full items-start gap-3 border border-transparent p-3 text-left transition hover:border-zinc-200 hover:bg-zinc-50";

  return (
    <div className="space-y-8">
      <NouveauClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Vue d&apos;ensemble — CRM
        </p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-zinc-950">
            <span className="font-semibold">Tableau</span>{" "}
            <span className="font-normal italic text-zinc-500">de bord</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Vue d&apos;ensemble de votre gestion de la relation client
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterTags.map((label) => (
            <span key={label} className={tagClass}>
              {label}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((card) => (
          <Link
            key={card.k}
            to={card.to}
            aria-label={`${card.label}: ${card.value}. Ouvrir`}
            className={
              "relative block overflow-hidden border border-zinc-200 bg-white p-5 text-left text-inherit no-underline outline-none transition-colors hover:border-zinc-300 hover:bg-zinc-50/60 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 " +
              card.borderClass +
              " border-t-4"
            }
          >
            <span className={badgeClass}>{card.badge}</span>
            <p className="pr-16 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {card.k} — {card.label}
            </p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="font-display text-3xl font-semibold tracking-tight text-zinc-950">{card.value}</p>
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-800">
                <card.icon className="h-5 w-5" />
              </span>
            </div>
            {card.sub && <p className="mt-1 text-xs text-zinc-600">{card.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="border border-zinc-200 bg-white p-6 lg:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Prospects (total)</p>
          <p className="mt-1 font-display text-2xl font-semibold text-zinc-950">47</p>
          <p className="mt-0.5 text-xs text-zinc-600">Évolution des prospects sur la saison</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
                <XAxis dataKey="m" stroke="#52525b" fontSize={12} />
                <YAxis stroke="#52525b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #d4d4d8",
                    borderRadius: 0,
                    color: "#09090b",
                  }}
                />
                <Line type="monotone" dataKey="v" stroke="#171717" strokeWidth={2} dot={{ r: 3, fill: "#171717" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-6 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Actions rapides</p>
          <h2 className="mt-1 font-display text-xl text-zinc-950">
            Navigation <span className="font-normal italic text-zinc-500">rapide</span>
          </h2>
          <ul className="mt-5 space-y-2">
            {quickActions.map((a) => {
              const QIcon = a.icon;
              const inner = (
                <>
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-800">
                    <QIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-950">{a.title}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-zinc-950" />
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-600">{a.desc}</span>
                  </span>
                </>
              );
              if (a.kind === "add-client") {
                return (
                  <li key={a.title}>
                    <button type="button" onClick={() => setAddClientOpen(true)} className={quickRowClass}>
                      {inner}
                    </button>
                  </li>
                );
              }
              return (
                <li key={a.title}>
                  <Link to={a.to} className={quickRowClass}>
                    {inner}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
