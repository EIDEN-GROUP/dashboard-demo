import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Search, Download, Eye, X, Reply, CheckCircle, Send } from "lucide-react";

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
  message: string;
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
    message: "molay thami",
  },
  { id: "1", nom: "Alami Youssef", email: "y.alami@mail.com", phone: "0611223344", sujet: "Question inscription", type: "contact", status: "nouveau", dateTable: "04/05/2026", dateDetail: "4 mai 2026", ageEnfant: "7 ans", message: "Disponibilités été ?" },
  { id: "2", nom: "Benani Salma", email: "salma.b@gmail.com", phone: "0666778899", sujet: "RDV direction", type: "rdv", status: "contacte", dateTable: "03/05/2026", dateDetail: "3 mai 2026", ageEnfant: "5 ans", message: "Premier contact." },
  { id: "3", nom: "Cherkaoui Omar", email: "omar.c@outlook.fr", phone: "0520112233", sujet: "Atelier", type: "rdv", status: "nouveau", dateTable: "02/05/2026", dateDetail: "2 mai 2026", ageEnfant: "9 ans", message: "Mercredi après-midi." },
  { id: "4", nom: "Idrissi Kenza", email: "kenza.i@yahoo.com", phone: "0633445566", sujet: "Infos tarifs", type: "contact", status: "converti", dateTable: "01/05/2026", dateDetail: "1 mai 2026", ageEnfant: "6 ans", message: "Budget famille." },
  { id: "5", nom: "Fassi Mehdi", email: "mehdi.fassi@mail.com", phone: "0677889900", sujet: "Rappel", type: "contact", status: "contacte", dateTable: "30/04/2026", dateDetail: "30 avril 2026", ageEnfant: "11 ans", message: "Suite à notre échange." },
  { id: "6", nom: "Tazi Ilham", email: "ilham.tazi@gmail.com", phone: "0655001122", sujet: "Visite guidée", type: "rdv", status: "nouveau", dateTable: "29/04/2026", dateDetail: "29 avril 2026", ageEnfant: "4 ans", message: "Parents + enfant." },
  { id: "7", nom: "Berrada Hicham", email: "h.berrada@mail.com", phone: "0520998877", sujet: "Contact général", type: "contact", status: "nouveau", dateTable: "28/04/2026", dateDetail: "28 avril 2026", ageEnfant: "8 ans", message: "Horaires accueil." },
  { id: "8", nom: "Amrani Sofia", email: "sofia.amrani@gmail.com", phone: "0644332211", sujet: "Bilan pédagogique", type: "rdv", status: "contacte", dateTable: "27/04/2026", dateDetail: "27 avril 2026", ageEnfant: "10 ans", message: "Documents à fournir." },
  { id: "9", nom: "Lahlou Karim", email: "karim.lahlou@outlook.com", phone: "0619988776", sujet: "Réorientation", type: "contact", status: "converti", dateTable: "26/04/2026", dateDetail: "26 avril 2026", ageEnfant: "12 ans", message: "Transfert depuis autre établissement." },
  { id: "10", nom: "Mouline Nora", email: "nora.mouline@mail.com", phone: "0665544332", sujet: "Rendez-vous suivi", type: "rdv", status: "nouveau", dateTable: "25/04/2026", dateDetail: "25 avril 2026", ageEnfant: "6 ans", message: "Compte-rendu trimestre." },
];

type ModalState =
  | { kind: "detail"; row: Demande }
  | { kind: "crm"; row: Demande }
  | { kind: "reply"; row: Demande }
  | null;

function CrmRendezVous() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Demande[]>(DEMO_DEMANDES);
  const [modal, setModal] = useState<ModalState>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.nom.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.sujet.toLowerCase().includes(q);
      return matchQ;
    });
  }, [rows, query]);

  const exportCsv = useCallback(() => {
    const header = ["Nom", "Email", "Téléphone", "Date", "Sujet"];
    const lines = filtered.map((r) =>
      [r.nom, r.email, r.phone, r.dateTable, r.sujet].map(csvEscape).join(","),
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
            placeholder="Rechercher par nom, email, téléphone ou sujet..."
            className="w-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
        </div>
      </div>

      <div className="border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                {["Nom", "Email", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-500">
                    Aucune demande ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-4 font-semibold text-zinc-900">{r.nom}</td>
                    <td className="px-4 py-4 text-zinc-600">{r.email}</td>
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

function DetailModal({ row, onClose, onCrm }: { row: Demande; onClose: () => void; onCrm: () => void }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">— Détail — Rendez-vous</p>
          <h2 className="mt-2 font-display text-xl font-bold text-zinc-900 md:text-2xl">{row.nom}</h2>
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
              { label: "Date", value: row.dateDetail },
              { label: "Âge de l'enfant", value: row.ageEnfant },
            ] as const
          ).map((f, i) => (
            <div
              key={f.label}
              className={
                "border-zinc-200 px-4 py-3 " +
                (i < 4 ? "border-b " : "") +
                (i < 2 ? "sm:border-b " : "sm:border-b-0 ") +
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
  const prenom = row.nom.trim().split(/\s+/)[0] ?? row.nom;
  const crmFieldClass = "text-[10px] font-semibold uppercase tracking-wider text-zinc-500";
  const crmInputClass =
    "mt-1 w-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400";
  const crmSelectClass = crmInputClass + " cursor-pointer bg-white";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parent = String(fd.get("parent") || "").trim();
    const eleve = String(fd.get("eleve") || "").trim();
    const email1 = String(fd.get("email1") || "").trim();
    if (parent.length < 2 || eleve.length < 1 || email1.length < 3) return;
    onConfirm();
  };

  return (
    <ModalShell onClose={onClose} wide>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Conversion CRM</p>
          <h2 className="mt-2 font-display text-xl font-bold text-zinc-900">
            Fiche client — <span className="font-semibold">{prenom}</span>
          </h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center border border-zinc-200 hover:bg-zinc-50" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex min-h-0 max-h-[min(85vh,34rem)] flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <p className="text-sm text-zinc-600">
            Complétez les informations manquantes pour créer le dossier dans le CRM. À l&apos;enregistrement, la
            demande passe en <strong>Converti</strong> (démo).
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor={`crm-rv-parent-${row.id}`} className={crmFieldClass}>
                Parent (nom affiché) <span className="text-zinc-900">*</span>
              </label>
              <input
                id={`crm-rv-parent-${row.id}`}
                name="parent"
                required
                minLength={2}
                defaultValue={row.nom}
                autoComplete="name"
                className={crmInputClass}
              />
            </div>
            <div>
              <label htmlFor={`crm-rv-eleve-${row.id}`} className={crmFieldClass}>
                Nom d&apos;élève <span className="text-zinc-900">*</span>
              </label>
              <input id={`crm-rv-eleve-${row.id}`} name="eleve" required minLength={1} className={crmInputClass} placeholder="Prénom et nom" />
            </div>
            <div>
              <label htmlFor={`crm-rv-naissance-${row.id}`} className={crmFieldClass}>
                Date de naissance
              </label>
              <input id={`crm-rv-naissance-${row.id}`} name="naissance" placeholder="jj/mm/aaaa" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-niveau-${row.id}`} className={crmFieldClass}>
                Niveau
              </label>
              <select id={`crm-rv-niveau-${row.id}`} name="niveau" className={crmSelectClass} defaultValue="">
                <option value="">Sélectionner</option>
                <option value="ps">Petite section</option>
                <option value="ms">Moyenne section</option>
                <option value="gs">Grande section</option>
                <option value="cp">CP</option>
                <option value="ce1">CE1</option>
                <option value="ce2">CE2</option>
                <option value="cm1">CM1</option>
                <option value="cm2">CM2</option>
              </select>
            </div>
            <div>
              <label htmlFor={`crm-rv-pere-${row.id}`} className={crmFieldClass}>
                Nom du père
              </label>
              <input id={`crm-rv-pere-${row.id}`} name="pere" autoComplete="additional-name" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-mere-${row.id}`} className={crmFieldClass}>
                Nom de mère
              </label>
              <input id={`crm-rv-mere-${row.id}`} name="mere" autoComplete="additional-name" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-cin-${row.id}`} className={crmFieldClass}>
                CIN ou passeport
              </label>
              <input id={`crm-rv-cin-${row.id}`} name="cin" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-email1-${row.id}`} className={crmFieldClass}>
                Email 1 <span className="text-zinc-900">*</span>
              </label>
              <input
                id={`crm-rv-email1-${row.id}`}
                name="email1"
                type="email"
                required
                defaultValue={row.email}
                autoComplete="email"
                className={crmInputClass}
              />
            </div>
            <div>
              <label htmlFor={`crm-rv-email2-${row.id}`} className={crmFieldClass}>
                Email 2
              </label>
              <input id={`crm-rv-email2-${row.id}`} name="email2" type="email" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-tel1-${row.id}`} className={crmFieldClass}>
                Téléphone 1
              </label>
              <input id={`crm-rv-tel1-${row.id}`} name="tel1" type="tel" defaultValue={row.phone} autoComplete="tel" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-tel2-${row.id}`} className={crmFieldClass}>
                Téléphone 2
              </label>
              <input id={`crm-rv-tel2-${row.id}`} name="tel2" type="tel" className={crmInputClass} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-zinc-200 p-5">
          <button
            type="submit"
            className="inline-flex min-w-[8rem] flex-1 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <CheckCircle className="h-4 w-4" />
            Enregistrer et convertir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-w-[8rem] flex-1 items-center justify-center border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Annuler
          </button>
        </div>
      </form>
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
          "relative z-10 flex min-h-0 max-h-[min(92vh,42rem)] w-full flex-col border border-zinc-200 bg-white shadow-xl " +
          (wide ? "max-w-2xl" : "max-w-md")
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
