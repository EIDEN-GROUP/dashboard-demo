/**
 * Snapshot of demo data used on real dashboard routes — kept in sync for the landing miniature.
 * Source routes: dashboard.index, dashboard.familles, dashboard.paiements, dashboard.rendez-vous,
 * dashboard.leads, dashboard.parametres, dashboard.affiches, dashboard.rapports.
 */
import type { LucideIcon } from "lucide-react";
import { Users, CreditCard, AlertCircle, TrendingUp, Plus, Clock } from "lucide-react";

export type DashboardMiniaturePageId =
  | "dashboard"
  | "familles"
  | "paiements"
  | "rendez-vous"
  | "parametres"
  | "leads"
  | "affiches"
  | "rapports";

export const mirrorFunnel = [
  { m: "Sept", v: 22 },
  { m: "Oct", v: 31 },
  { m: "Nov", v: 28 },
  { m: "Déc", v: 18 },
  { m: "Jan", v: 42 },
  { m: "Fév", v: 51 },
  { m: "Mar", v: 47 },
] as const;

export const mirrorFilterTags = ["CLIENTS", "PAIEMENTS", "DETTE", "COLLECTE"] as const;

export const mirrorMetrics: readonly {
  k: string;
  label: string;
  value: string;
  sub: string;
  badge: string;
  borderClass: string;
  icon: LucideIcon;
}[] = [
  {
    k: "01",
    label: "TOTAL CLIENTS",
    value: "4",
    sub: "1 actif",
    badge: "Actif",
    borderClass: "border-t-zinc-900",
    icon: Users,
  },
  {
    k: "02",
    label: "PAYÉS CE MOIS",
    value: "2",
    sub: "1 en attente",
    badge: "Actif",
    borderClass: "border-t-zinc-600",
    icon: CreditCard,
  },
  {
    k: "03",
    label: "DETTE TOTALE",
    value: "0 MAD",
    sub: "Calculé dynamiquement",
    badge: "Actif",
    borderClass: "border-t-zinc-400",
    icon: AlertCircle,
  },
  {
    k: "04",
    label: "TAUX DE COLLECTE",
    value: "200%",
    sub: "Ce mois",
    badge: "Actif",
    borderClass: "border-t-zinc-300",
    icon: TrendingUp,
  },
];

export const mirrorQuickActions: readonly { title: string; desc: string; icon: LucideIcon }[] = [
  { title: "Gérer les clients", desc: "Voir et modifier les informations des clients.", icon: Users },
  { title: "Enregistrer un paiement", desc: "Sélectionner un parent et enregistrer.", icon: CreditCard },
  { title: "Clients en retard", desc: "Voir les clients avec des paiements en retard.", icon: Clock },
  { title: "Ajouter un client", desc: "Créer un nouveau client depuis le dashboard.", icon: Plus },
];

export const mirrorClients = [
  {
    id: "1",
    parent: "rztest / testss",
    child: "testss",
    email: "tehgdgh@test.com",
    phone: "0614020520",
    profil: "ENFANT DYS",
    stade: "nouveau",
    payment: "impaye",
    mensuel: 0,
    dette: 0,
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
  },
] as const;

export const mirrorPaymentRows = [
  {
    id: "1",
    parent: "essafar basma",
    enfant: "Enfant de 13 ans",
    montant: 1800,
    date: "05/05/2026",
    mode: "ESPÈCES",
    periode: "mai 2026",
    recu: "EDU-20260505-115",
    facture: "non_envoye" as const,
  },
  {
    id: "2",
    parent: "essafar basma",
    enfant: "Enfant de 13 ans",
    montant: 1800,
    date: "05/05/2026",
    mode: "ESPÈCES",
    periode: "mai 2026",
    recu: "EDU-20260505-253",
    facture: "non_envoye" as const,
  },
] as const;

export const mirrorDemandes = [
  {
    id: "0",
    nom: "essafar basma",
    email: "basmaess11@gmail.com",
    type: "rdv" as const,
    status: "converti" as const,
    dateTable: "05/05/2026",
    sujet: "Visite et bilan",
  },
  { id: "1", nom: "Alami Youssef", email: "y.alami@mail.com", type: "contact" as const, status: "nouveau" as const, dateTable: "04/05/2026", sujet: "Question inscription" },
  { id: "2", nom: "Benani Salma", email: "salma.b@gmail.com", type: "rdv" as const, status: "contacte" as const, dateTable: "03/05/2026", sujet: "RDV direction" },
  { id: "3", nom: "Cherkaoui Omar", email: "omar.c@outlook.fr", type: "rdv" as const, status: "nouveau" as const, dateTable: "02/05/2026", sujet: "Atelier" },
] as const;

export const mirrorLeadStages = ["Nouveau", "Contacté", "Rendez-vous", "Visite effectuée"] as const;

export const mirrorLeadCards: Record<(typeof mirrorLeadStages)[number], { n: string; e: string; p: string }[]> = {
  Nouveau: [
    { n: "Famille Alaoui", e: "5 ans · MS", p: "Site web" },
    { n: "Famille Cherkaoui", e: "8 ans · CE2", p: "Instagram" },
  ],
  Contacté: [{ n: "Famille Bennani", e: "6 ans · CP", p: "Bouche-à-oreille" }],
  "Rendez-vous": [{ n: "Famille Idrissi", e: "7 ans · CE1", p: "Partenaire" }],
  "Visite effectuée": [{ n: "Famille Tahiri", e: "4 ans · PS", p: "Site web" }],
};

export const mirrorUsers = [
  {
    id: "1",
    email: "admin@educazenkids.com",
    username: "admin",
    displayName: "Admin",
    role: "ADMIN",
  },
] as const;

export const mirrorEmployes = [
  {
    id: "e1",
    nomComplet: "Nadia El Mansouri",
    poste: "Responsable pédagogique",
    departement: "Pédagogie",
    email: "n.elmansouri@demo-crm.ma",
    tel: "0661122001",
    statut: "actif" as const,
  },
  {
    id: "e2",
    nomComplet: "Karim Tazi",
    poste: "Comptable",
    departement: "Finance",
    email: "k.tazi@demo-crm.ma",
    tel: "0662233004",
    statut: "actif" as const,
  },
  {
    id: "e3",
    nomComplet: "Sanae Benjelloun",
    poste: "Assistante administrative",
    departement: "Administration",
    email: "s.benjelloun@demo-crm.ma",
    tel: "0614020998",
    statut: "actif" as const,
  },
] as const;

export const mirrorRapportsChart = [
  { m: "Sept", v: 4 },
  { m: "Oct", v: 7 },
  { m: "Nov", v: 6 },
  { m: "Déc", v: 3 },
  { m: "Jan", v: 9 },
  { m: "Fév", v: 12 },
  { m: "Mar", v: 11 },
] as const;

/** Same counts as `FAMILLES_PAYEES.length` / `FAMILLES_IMPAYEES.length` in dashboard.rapports */
export const mirrorRapportsPayeCount = 22;
export const mirrorRapportsImpayeCount = 22;

export const TYPE_LABEL: Record<"contact" | "rdv", string> = {
  contact: "Contact",
  rdv: "Rendez-vous",
};

export const STATUT_LABEL: Record<"nouveau" | "contacte" | "converti", string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  converti: "Converti",
};
