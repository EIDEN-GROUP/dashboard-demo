/**
 * Snapshot of demo data used on real dashboard routes   kept in sync for the landing miniature.
 * Source routes: dashboard.index, dashboard.familles, dashboard.paiements, dashboard.rendez-vous,
 * dashboard.affiches, dashboard.rapports.
 */
import type { LucideIcon } from "lucide-react";
import { Users, CreditCard, AlertCircle, Banknote, Plus, Clock } from "lucide-react";

export type DashboardMiniaturePageId =
  | "dashboard"
  | "familles"
  | "paiements"
  | "rendez-vous"
  | "affiches"
  | "rapports";

export const mirrorFilterTags = ["CLIENTS", "PAIEMENTS", "DETTE", "COLLECTE"] as const;

/**
 * Home dashboard snapshot   mirrors the reworked `dashboard.index` route:
 * 4 status cards + « Statistique générale » composed chart with a KPI column +
 * « Derniers paiements » activity list.
 */
export const mirrorDashboardMetrics: readonly {
  k: string;
  label: string;
  value: string;
  sub: string;
  accent: string;
  tint: string;
  icon: LucideIcon;
  to: string;
}[] = [
  { k: "01", label: "Total familles", value: "4", sub: "familles inscrites", accent: "#28396C", tint: "rgba(40,57,108,0.10)", icon: Users, to: "/dashboard/familles" },
  { k: "02", label: "Payé", value: "2", sub: "reçus ce mois", accent: "#6BA53A", tint: "rgba(107,165,58,0.14)", icon: CreditCard, to: "/dashboard/paiements" },
  { k: "03", label: "En retard", value: "1", sub: "relance conseillée", accent: "#E25C5C", tint: "rgba(226,92,92,0.12)", icon: Clock, to: "/dashboard/paiements" },
  { k: "04", label: "Impayé", value: "1", sub: "facture en attente", accent: "#E8A13C", tint: "rgba(232,161,60,0.14)", icon: AlertCircle, to: "/dashboard/paiements" },
];

/** Encaissé (k MAD) + paiements reçus   subset of `STAT_SERIES["2026"].semestre`. */
export const mirrorStatSeries: { mois: string; encaisse: number; paiements: number }[] = [
  { mois: "Jan", encaisse: 34, paiements: 22 },
  { mois: "Fév", encaisse: 42, paiements: 27 },
  { mois: "Mar", encaisse: 41, paiements: 26 },
  { mois: "Avr", encaisse: 33, paiements: 21 },
  { mois: "Mai", encaisse: 48, paiements: 31 },
  { mois: "Juin", encaisse: 44, paiements: 29 },
];

/** Side KPI column   same figures as `STAT_KPIS` on the real dashboard. */
export const mirrorStatKpis = [
  { label: "Total encaissé", value: "457k", delta: "+62k", up: true },
  { label: "Paiements reçus", value: "293", delta: "+24", up: true },
  { label: "Impayés", value: "38", delta: "+7", up: false },
  { label: "Inscriptions", value: "46", delta: "+12", up: true },
] as const;

/** « Derniers paiements » list   mirrors `LAST_PAYMENTS` on the real dashboard. */
export const mirrorLastPayments = [
  { who: "Famille Alami", note: "Frais mensuels · Yasmine", amount: "1 800", status: "paye" as const },
  { who: "Tazi / Mehdi", note: "Frais mensuels · Mehdi", amount: "1 800", status: "paye" as const },
  { who: "Benjelloun / Sara", note: "Échéance dépassée · Sara", amount: "1 200", status: "retard" as const },
] as const;


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
    borderClass: "border-t-primary",
    icon: Users,
  },
  {
    k: "02",
    label: "PAYÉS CE MOIS",
    value: "2",
    sub: "1 en attente",
    badge: "Actif",
    borderClass: "border-t-chart-4",
    icon: CreditCard,
  },
  {
    k: "03",
    label: "DETTE TOTALE",
    value: "0 MAD",
    sub: "Calculé dynamiquement",
    badge: "Actif",
    borderClass: "border-t-chart-2",
    icon: AlertCircle,
  },
  {
    k: "04",
    label: "REVENU TOTAL",
    value: "12 600 MAD",
    sub: "Rapports & paiements (démo)",
    badge: "Actif",
    borderClass: "border-t-muted-foreground",
    icon: Banknote,
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
export const mirrorRapportsTotalFamilles = mirrorRapportsPayeCount + mirrorRapportsImpayeCount;
