import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Search, Download, Eye, X, ChevronDown, Reply, CheckCircle, Send } from "lucide-react";

export const Route = createFileRoute("/dashboard/rendez-vous")({
  head: () => ({ meta: [{ title: "Rendez-vous — CRM" }] }),
  component: CrmRendezVous,
});

type DemandeType = "contact" | "rdv";
type DemandeStatut = "nouveau" | "contacte" | "converti";

type Demande = {
  id: string;
  nom: string;
  email: string;
  phone: string;
  sujet: string;
  type: DemandeType;
  status: DemandeStatut;
  dateTable: string;
  dateDetail: string;
  ageEnfant: string;
  profilEnfant: string;
  message: string;
};

const TYPE_LABEL: Record<DemandeType, string> = {
  contact: "Contact",
  rdv: "Rendez-vous",
};

const STATUT_LABEL: Record<DemandeStatut, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  converti: "Converti",
};

const DEMO_DEMANDES: Demande[] = [
  {
    id: "0",
    nom: "essafar basma",
    email: "basmaess11@gmail.com",
    phone: "0528555555",
    sujet: "Visite et bilan",
    type: "rdv",
    status: "converti",
    dateTable: "05/05/2026",
    dateDetail: "5 mai 2026",
    ageEnfant: "13 ans",
    profilEnfant: "Enfant TDAH",
    message: "molay thami",
  },
  { id: "1", nom: "Alami Youssef", email: "y.alami@mail.com", phone: "0611223344", sujet: "Question inscription", type: "contact", status: "nouveau", dateTable: "04/05/2026", dateDetail: "4 mai 2026", ageEnfant: "7 ans", profilEnfant: "TSA", message: "Disponibilités été ?" },
  { id: "2", nom: "Benani Salma", email: "salma.b@gmail.com", phone: "0666778899", sujet: "RDV direction", type: "rdv", status: "contacte", dateTable: "03/05/2026", dateDetail: "3 mai 2026", ageEnfant: "5 ans", profilEnfant: "HP", message: "Premier contact." },
  { id: "3", nom: "Cherkaoui Omar", email: "omar.c@outlook.fr", phone: "0520112233", sujet: "Atelier", type: "rdv", status: "nouveau", dateTable: "02/05/2026", dateDetail: "2 mai 2026", ageEnfant: "9 ans", profilEnfant: "Dyslexie", message: "Mercredi après-midi." },
  { id: "4", nom: "Idrissi Kenza", email: "kenza.i@yahoo.com", phone: "0633445566", sujet: "Infos tarifs", type: "contact", status: "converti", dateTable: "01/05/2026", dateDetail: "1 mai 2026", ageEnfant: "6 ans", profilEnfant: "TDAH", message: "Budget famille." },
  { id: "5", nom: "Fassi Mehdi", email: "mehdi.fassi@mail.com", phone: "0677889900", sujet: "Rappel", type: "contact", status: "contacte", dateTable: "30/04/2026", dateDetail: "30 avril 2026", ageEnfant: "11 ans", profilEnfant: "Anxiété", message: "Suite à notre échange." },
  { id: "6", nom: "Tazi Ilham", email: "ilham.tazi@gmail.com", phone: "0655001122", sujet: "Visite guidée", type: "rdv", status: "nouveau", dateTable: "29/04/2026", dateDetail: "29 avril 2026", ageEnfant: "4 ans", profilEnfant: "TSA", message: "Parents + enfant." },
  { id: "7", nom: "Berrada Hicham", email: "h.berrada@mail.com", phone: "0520998877", sujet: "Contact général", type: "contact", status: "nouveau", dateTable: "28/04/2026", dateDetail: "28 avril 2026", ageEnfant: "8 ans", profilEnfant: "TDAH", message: "Horaires accueil." },
  { id: "8", nom: "Amrani Sofia", email: "sofia.amrani@gmail.com", phone: "0644332211", sujet: "Bilan pédagogique", type: "rdv", status: "contacte", dateTable: "27/04/2026", dateDetail: "27 avril 2026", ageEnfant: "10 ans", profilEnfant: "Dyspraxie", message: "Documents à fournir." },
  { id: "9", nom: "Lahlou Karim", email: "karim.lahlou@outlook.com", phone: "0619988776", sujet: "Réorientation", type: "contact", status: "converti", dateTable: "26/04/2026", dateDetail: "26 avril 2026", ageEnfant: "12 ans", profilEnfant: "HP", message: "Transfert depuis autre établissement." },
  { id: "10", nom: "Mouline Nora", email: "nora.mouline@mail.com", phone: "0665544332", sujet: "Rendez-vous suivi", type: "rdv", status: "nouveau", dateTable: "25/04/2026", dateDetail: "25 avril 2026", ageEnfant: "6 ans", profilEnfant: "TSA", message: "Compte-rendu trimestre." },
];

type TypeFilter = "tous" | DemandeType;
type StatutFilter = "tous_statuts" | DemandeStatut;

type ModalState =
  | { kind: "detail"; row: Demande }
  | { kind: "crm"; row: Demande }
  | { kind: "reply"; row: Demande }
  | null;

function CrmRendezVous() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("tous");
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("tous_statuts");
  const [rows, setRows] = useState<Demande[]>(DEMO_DEMANDES);
  const [modal, setModal] = useState<ModalState>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.nom.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.sujet.toLowerCase().includes(q);
      const matchT = typeFilter === "tous" || r.type === typeFilter;
      const matchS = statutFilter === "tous_statuts" || r.status === statutFilter;
      return matchQ && matchT && matchS;
    });
  }, [rows, query, typeFilter, statutFilter]);

  const exportCsv = useCallback(() => {
    const header = ["Nom", "Email", "Type", "Statut", "Date", "Sujet"];
    const lines = filtered.map((r) =>
      [r.nom, r.email, TYPE_LABEL[r.type], STATUT_LABEL[r.status], r.dateTable, r.sujet].map(csvEscape).join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rendez-vous.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modal]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Demandes — CRM
          </p>
          <h1 className="mt-2 font-display text-3xl text-zinc-900 md:text-4xl">
            <span className="font-semibold">Gestion des </span>
            <span className="font-medium italic text-zinc-600">rendez-vous</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{afficheDemandes(filtered.length)}</p>
        </header>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex shrink-0 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      <div className="flex flex-col gap-4 border border-zinc-200 bg-white p-4">
        <div className="relative min-w-0 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou sujet..."
            className="w-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Type</span>
            {(
              [
                { key: "tous" as const, label: "Tous" },
                { key: "contact" as const, label: "Contact" },
                { key: "rdv" as const, label: "Rendez-vous" },
              ] as const
            ).map(({ key, label }) => (
              <FilterBtn key={key} active={typeFilter === key} onClick={() => setTypeFilter(key)} label={label} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Statut</span>
            {(
              [
                { key: "tous_statuts" as const, label: "Tous statuts" },
                { key: "nouveau" as const, label: "Nouveau" },
                { key: "contacte" as const, label: "Contacté" },
                { key: "converti" as const, label: "Converti" },
              ] as const
            ).map(({ key, label }) => (
              <FilterBtn key={key} active={statutFilter === key} onClick={() => setStatutFilter(key)} label={label} />
            ))}
          </div>
        </div>
      </div>

      <div className="border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                {["Nom", "Email", "Type", "Statut", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                    Aucune demande ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-4 font-semibold text-zinc-900">{r.nom}</td>
                    <td className="px-4 py-4 text-zinc-600">{r.email}</td>
                    <td className="px-4 py-4">
                      <TypePill type={r.type} />
                    </td>
                    <td className="px-4 py-4">
                      <StatutSelect
                        value={r.status}
                        onChange={(next) => {
                          setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
                          setModal((m) =>
                            m && (m.kind === "detail" || m.kind === "crm" || m.kind === "reply") && m.row.id === r.id
                              ? { ...m, row: { ...m.row, status: next } }
                              : m,
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-zinc-600">{r.dateTable}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setModal({ kind: "detail", row: r })}
                          className="grid h-9 w-9 place-items-center border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                          aria-label="Voir le détail"
                        >
                          <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ kind: "reply", row: r })}
                          className="grid h-9 w-9 place-items-center border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                          aria-label="Répondre"
                        >
                          <Reply className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ kind: "crm", row: r })}
                          className="grid h-9 w-9 place-items-center border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                          aria-label="Convertir CRM"
                        >
                          <CheckCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {filtered.length} résultat{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-1.5" aria-hidden>
            {[0.35, 0.5, 0.65, 0.8].map((op, i) => (
              <span key={i} className="h-1 w-6 bg-zinc-300" style={{ opacity: op }} />
            ))}
          </div>
        </div>
      </div>

      {modal?.kind === "detail" ? <DetailModal row={modal.row} onClose={() => setModal(null)} onCrm={() => setModal({ kind: "crm", row: modal.row })} /> : null}
      {modal?.kind === "crm" ? <CrmModal row={modal.row} onClose={() => setModal(null)} onConfirm={() => { setRows((p) => p.map((x) => (x.id === modal.row.id ? { ...x, status: "converti" } : x))); setModal(null); }} /> : null}
      {modal?.kind === "reply" ? <ReplyModal row={modal.row} onClose={() => setModal(null)} /> : null}
    </div>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors " +
        (active
          ? "border-zinc-400 bg-zinc-200 text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50")
      }
    >
      {label}
    </button>
  );
}

function TypePill({ type }: { type: DemandeType }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800">
      <span className="h-1.5 w-1.5 shrink-0 bg-zinc-600" aria-hidden />
      {TYPE_LABEL[type]}
    </span>
  );
}

function StatutSelect({ value, onChange }: { value: DemandeStatut; onChange: (v: DemandeStatut) => void }) {
  return (
    <label className="inline-flex min-w-[9.5rem] cursor-pointer items-center gap-2 border border-zinc-200 bg-zinc-100 px-2 py-1.5">
      <span className="h-1.5 w-1.5 shrink-0 bg-zinc-600" aria-hidden />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DemandeStatut)}
        className="min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0.5 pr-1 text-sm text-zinc-800 outline-none"
      >
        {(Object.keys(STATUT_LABEL) as DemandeStatut[]).map((k) => (
          <option key={k} value={k}>
            {STATUT_LABEL[k]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
    </label>
  );
}

function DetailModal({ row, onClose, onCrm }: { row: Demande; onClose: () => void; onCrm: () => void }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">— Détail — Rendez-vous</p>
          <h2 className="mt-2 font-display text-xl font-bold text-zinc-900 md:text-2xl">{row.nom}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <TypePill type={row.type} />
            <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800">
              <span className="h-1.5 w-1.5 shrink-0 bg-zinc-600" aria-hidden />
              {STATUT_LABEL[row.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-5">
        <div className="grid grid-cols-1 border border-zinc-200 sm:grid-cols-2">
          {(
            [
              { label: "Email", value: row.email },
              { label: "Téléphone", value: row.phone },
              { label: "Type", value: TYPE_LABEL[row.type] },
              { label: "Date", value: row.dateDetail },
              { label: "Âge de l'enfant", value: row.ageEnfant },
              { label: "Profil de l'enfant", value: row.profilEnfant },
            ] as const
          ).map((f, i) => (
            <div
              key={f.label}
              className={
                "border-zinc-200 px-4 py-3 " +
                (i < 6 ? "border-b " : "") +
                (i < 4 ? "sm:border-b " : "sm:border-b-0 ") +
                (i % 2 === 0 ? "sm:border-r " : "")
              }
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{f.label}</p>
              <p className="mt-1 text-sm text-zinc-900">{f.value}</p>
            </div>
          ))}
          <div className="border-t border-zinc-200 px-4 py-3 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Message</p>
            <p className="mt-1 text-sm text-zinc-800">{row.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onCrm();
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <CheckCircle className="h-4 w-4" />
          Confirmer la conversion CRM
        </button>
      </div>
    </ModalShell>
  );
}

function CrmModal({
  row,
  onClose,
  onConfirm,
}: {
  row: Demande;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const prenom = row.nom.trim().split(/\s+/)[0] ?? row.nom;
  const canConfirm = a && b;

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Conversion CRM</p>
          <h2 className="mt-2 font-display text-xl font-bold text-zinc-900">
            Convertir <span className="font-semibold">{prenom}</span>
          </h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center border border-zinc-200 hover:bg-zinc-50" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">
        <p className="border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-800">
          Ce client sera ajouté ou mis à jour dans le CRM avec le statut <strong>Converti</strong>.
        </p>
        <div className="mt-6 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 border border-zinc-200 p-3 hover:bg-zinc-50">
            <input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} className="mt-0.5 h-4 w-4 border-zinc-400" />
            <span className="text-sm text-zinc-900">Ajouter ce client au CRM</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 border border-zinc-200 p-3 hover:bg-zinc-50">
            <input type="checkbox" checked={b} onChange={(e) => setB(e.target.checked)} className="mt-0.5 h-4 w-4 border-zinc-400" />
            <span className="text-sm text-zinc-900">Le client a déjà payé</span>
          </label>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className={
              "inline-flex flex-1 min-w-[8rem] items-center justify-center gap-2 border px-4 py-2.5 text-sm font-medium " +
              (canConfirm
                ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400")
            }
          >
            <CheckCircle className="h-4 w-4" />
            Confirmer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 min-w-[8rem] items-center justify-center border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ReplyModal({ row, onClose }: { row: Demande; onClose: () => void }) {
  const [sujet, setSujet] = useState(`Re: ${row.sujet}`);
  const [msg, setMsg] = useState("");
  const replyTo = row.nom.trim().split(/\s+/)[0] ?? row.nom;

  return (
    <ModalShell onClose={onClose} wide>
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">— Réponse — Email</p>
          <h2 className="mt-2 font-display text-xl font-bold text-zinc-900">Répondre à {replyTo}</h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center border border-zinc-200 hover:bg-zinc-50" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Destinataire</p>
          <input readOnly value={row.email} className="mt-1 w-full border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-800" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Sujet</p>
          <input
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Sujet de votre réponse..."
            className="mt-1 w-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Message</p>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            rows={6}
            className="mt-1 w-full resize-y border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Send className="h-4 w-4" />
          Envoyer la réponse
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-zinc-900/50" onClick={onClose} aria-label="Fermer" />
      <div
        role="dialog"
        aria-modal="true"
        className={
          "relative z-10 flex max-h-[min(92vh,40rem)] w-full flex-col border border-zinc-200 bg-white shadow-xl " +
          (wide ? "max-w-xl" : "max-w-md")
        }
      >
        {children}
      </div>
    </div>
  );
}

function csvEscape(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function afficheDemandes(n: number) {
  if (n === 0) return "Aucune demande affichée";
  if (n === 1) return "1 demande affichée";
  return `${n} demandes affichées`;
}
