import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Users,
  CreditCard,
  AlertCircle,
  Banknote,
  Clock,
  Plus,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { mirrorRapportsChart } from "@/lib/dashboard-mirror-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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

const filterTags = ["CLIENTS", "PAIEMENTS", "DETTE", "COLLECTE"] as const;

const metrics = [
  {
    k: "01",
    label: "TOTAL CLIENTS",
    value: "4",
    sub: "1 actif",
    badge: "Actif",
    borderClass: "border-t-primary",
    icon: Users,
    to: "/dashboard/familles",
  },
  {
    k: "02",
    label: "PAYÉS CE MOIS",
    value: "2",
    sub: "1 en attente",
    badge: "Actif",
    borderClass: "border-t-chart-4",
    icon: CreditCard,
    to: "/dashboard/familles",
  },
  {
    k: "03",
    label: "DETTE TOTALE",
    value: "0 MAD",
    sub: "Calculé dynamiquement",
    badge: "Actif",
    borderClass: "border-t-chart-2",
    icon: AlertCircle,
    to: "/dashboard/rapports",
  },
  {
    k: "04",
    label: "REVENU TOTAL",
    value: "12 600 MAD",
    sub: "Rapports & paiements (démo)",
    badge: "Actif",
    borderClass: "border-t-muted-foreground",
    icon: Banknote,
    to: "/dashboard/rapports",
  },
] as const;

const inputClass =
  "rounded-none border-border bg-card shadow-none focus-visible:border-primary focus-visible:ring-0";

const selectTriggerClass =
  "h-10 rounded-none border-border bg-card shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/70";

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
    to: "/dashboard/paiements",
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
  "inline-flex items-center border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/90";

const badgeClass =
  "absolute right-4 top-4 border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground";

const dashChartTooltip = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--foreground)",
} as const;

const labelClass = "text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

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
          "gap-0 overflow-hidden border border-border bg-card p-0 shadow-none sm:rounded-none rounded-none",
          "max-h-[min(90vh,860px)] w-[min(100vw-1.5rem,640px)] max-w-[min(100vw-1.5rem,640px)] translate-y-[-50%] sm:max-w-[640px]",
          "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:opacity-100 [&>button]:hover:bg-muted [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0",
        )}
      >
        <DialogDescription className="sr-only">
          Formulaire pour créer un nouveau client dans le CRM.
        </DialogDescription>
        <div className="border-t-4 border-t-primary">
          <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">— Ajouter un client</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold tracking-tight text-foreground">
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
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
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
                  <SelectContent className="rounded-none border-border">
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
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
    "group flex w-full items-start gap-3 border border-transparent p-3 text-left transition hover:border-border hover:bg-muted";

  return (
    <div className="space-y-8">
      <NouveauClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />

      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Vue d&apos;ensemble — CRM
        </p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-foreground">
            <span className="font-semibold">Tableau</span>{" "}
            <span className="font-normal italic text-muted-foreground">de bord</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
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
              "relative block overflow-hidden border border-border bg-card p-5 text-left text-inherit no-underline outline-none transition-colors hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
              card.borderClass +
              " border-t-4"
            }
          >
            <span className={badgeClass}>{card.badge}</span>
            <p className="pr-16 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {card.k} — {card.label}
            </p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-muted text-foreground/90">
                <card.icon className="h-5 w-5" />
              </span>
            </div>
            {card.sub && <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 w-full flex-col border border-border bg-card p-6 lg:min-w-0 lg:flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Graphique</p>
          <h2 className="mt-1 font-display text-xl text-foreground">
            Inscriptions <span className="font-normal italic text-muted-foreground">par mois</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Volume mensuel (données de démonstration, alignées sur les rapports).</p>
          <div className="mt-4 h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...mirrorRapportsChart]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={dashChartTooltip} />
                <Bar dataKey="v" fill="var(--primary)" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Link
            to="/dashboard/rapports"
            className="mt-4 inline-flex w-fit shrink-0 items-center gap-1.5 border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Voir les rapports
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="flex shrink-0 flex-col gap-4 lg:w-[min(100%,22rem)] lg:max-w-sm">
          <div className="flex flex-col border border-border bg-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Actions rapides</p>
            <h2 className="mt-1 font-display text-xl text-foreground">
              Navigation <span className="font-normal italic text-muted-foreground">rapide</span>
            </h2>
            <ul className="mt-5 space-y-2">
              {quickActions.map((a) => {
                const QIcon = a.icon;
                const inner = (
                  <>
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-border bg-muted text-foreground/90">
                      <QIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{a.title}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{a.desc}</span>
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
    </div>
  );
}
