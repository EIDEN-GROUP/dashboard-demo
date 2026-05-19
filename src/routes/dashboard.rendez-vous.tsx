import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Eye,
  X,
  Reply,
  CheckCircle,
  Send,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { interpolate, useDashboardI18n, type DashboardTranslations } from "@/lib/landing-i18n";

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

function dateBadgeFromTable(dateTable: string, monthsShort: string[]) {
  const m = dateTable.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return { day: "—", month: "", year: dateTable };
  const day = m[1];
  const monthIdx = Number.parseInt(m[2], 10) - 1;
  const month = monthsShort[monthIdx] ?? m[2];
  return { day, month, year: m[3] };
}

function typeLabel(type: DemandeType, t: DashboardTranslations) {
  return type === "rdv" ? t.status.appointment : t.status.contactType;
}

function statusLabel(s: DemandeStatut, t: DashboardTranslations) {
  if (s === "nouveau") return t.status.nouveau;
  if (s === "contacte") return t.status.contacte;
  return t.status.converti;
}

function statusRowClass(s: DemandeStatut) {
  if (s === "nouveau") return "border-l-primary";
  if (s === "contacte") return "border-l-chart-2";
  return "border-l-emerald-700";
}

function statusPillClass(s: DemandeStatut) {
  if (s === "nouveau") return "border-border bg-primary text-primary-foreground";
  if (s === "contacte") return "border-border bg-muted text-foreground/90";
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

function typePillClass(t: DemandeType) {
  return t === "rdv"
    ? "border-border bg-card text-foreground/90"
    : "border-dashed border-border bg-muted text-muted-foreground";
}

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
  const { t } = useDashboardI18n();
  const rv = t.rendezVous;
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
    const header = rv.csvHeaders;
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
  }, [filtered, rv.csvHeaders]);

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{rv.eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
            <span className="font-semibold">{rv.titleBold}</span>
            <span className="font-medium italic text-muted-foreground">{rv.titleItalic}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{afficheDemandes(filtered.length, rv)}</p>
        </header>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex shrink-0 items-center justify-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          <Download className="h-4 w-4" />
          {t.common.exportCsv}
        </button>
      </div>

      <div className="flex flex-col gap-4 border border-border bg-card p-4">
        <div className="relative min-w-0 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={rv.searchPlaceholder}
            className="w-full border border-border bg-muted py-2.5 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-input"
          />
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border bg-muted px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{rv.listEyebrow}</p>
          <h2 className="mt-0.5 font-display text-lg font-semibold tracking-tight text-foreground">
            {rv.listTitleBold} <span className="font-normal italic text-muted-foreground">{rv.listTitleItalic}</span>
          </h2>
        </div>
        <ul role="list" className="divide-y divide-border">
          {filtered.length === 0 ? (
            <li className="px-4 py-14 text-center text-sm text-muted-foreground sm:px-5">
              {rv.noMatch}
            </li>
          ) : (
            filtered.map((r) => {
              const d = dateBadgeFromTable(r.dateTable, rv.monthsShort);
              return (
                <li
                  key={r.id}
                  className={cn(
                    "flex flex-col gap-4 border-l-[3px] bg-card p-4 transition-colors sm:flex-row sm:items-stretch sm:gap-5 sm:p-5",
                    statusRowClass(r.status),
                    "hover:bg-muted/80",
                  )}
                >
                  <div className="flex shrink-0 gap-3 sm:flex-col sm:items-center">
                    <div className="grid h-[4.25rem] w-[4.25rem] shrink-0 place-content-center border border-border bg-muted text-center leading-none">
                      <span className="font-display text-xl font-semibold text-foreground">{d.day}</span>
                      {d.month ? (
                        <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {d.month}
                        </span>
                      ) : null}
                      <span className="mt-1 text-[10px] font-medium text-muted-foreground/70">{d.year}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold text-foreground">{r.nom}</span>
                      <span
                        className={cn(
                          "inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          typePillClass(r.type),
                        )}
                      >
                        {typeLabel(r.type, t)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          statusPillClass(r.status),
                        )}
                      >
                        {statusLabel(r.status, t)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
                        <span className="truncate">{r.email}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
                        {r.phone}
                      </span>
                    </div>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground/90">
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
                      <span className="leading-snug">{r.sujet}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-1 border-t border-border pt-3 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:border-border sm:pl-5 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "detail", row: r })}
                      className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground transition hover:border-input hover:bg-muted"
                      aria-label={rv.viewDetailAria}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "reply", row: r })}
                      className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground transition hover:border-input hover:bg-muted"
                      aria-label={rv.replyAria}
                    >
                      <Reply className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "crm", row: r })}
                      className="grid h-9 w-9 place-items-center border border-border bg-card text-muted-foreground transition hover:border-input hover:bg-muted"
                      aria-label={rv.convertCrmAria}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
        <div className="border-t border-border bg-muted/80 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {filtered.length === 1
              ? interpolate(rv.resultsFooter, { count: filtered.length })
              : interpolate(rv.resultsFooterPlural, { count: filtered.length })}
          </p>
        </div>
      </div>

      {modal?.kind === "detail" ? (
        <DetailModal row={modal.row} onClose={() => setModal(null)} onCrm={() => setModal({ kind: "crm", row: modal.row })} />
      ) : null}
      {modal?.kind === "crm" ? (
        <CrmModal
          row={modal.row}
          onClose={() => setModal(null)}
          onConfirm={() => {
            setRows((p) => p.map((x) => (x.id === modal.row.id ? { ...x, status: "converti" } : x)));
            setModal(null);
          }}
        />
      ) : null}
      {modal?.kind === "reply" ? <ReplyModal row={modal.row} onClose={() => setModal(null)} /> : null}
    </div>
  );
}

function DetailModal({ row, onClose, onCrm }: { row: Demande; onClose: () => void; onCrm: () => void }) {
  const { t } = useDashboardI18n();
  const rv = t.rendezVous;
  const dm = rv.detailModal;

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{dm.eyebrow}</p>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground md:text-2xl">{row.nom}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center border border-border text-muted-foreground hover:bg-muted"
          aria-label={t.common.close}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-5">
        <div className="grid grid-cols-1 border border-border sm:grid-cols-2">
          {(
            [
              { label: t.common.email, value: row.email },
              { label: t.common.phone, value: row.phone },
              { label: t.common.date, value: row.dateDetail },
              { label: dm.childAge, value: row.ageEnfant },
            ] as const
          ).map((f, i) => (
            <div
              key={f.label}
              className={
                "border-border px-4 py-3 " +
                (i < 4 ? "border-b " : "") +
                (i < 2 ? "sm:border-b " : "sm:border-b-0 ") +
                (i % 2 === 0 ? "sm:border-r " : "")
              }
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</p>
              <p className="mt-1 text-sm text-foreground">{f.value}</p>
            </div>
          ))}
          <div className="border-t border-border px-4 py-3 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.common.message}</p>
            <p className="mt-1 text-sm text-foreground/90">{row.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onCrm();
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 border border-primary bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          <CheckCircle className="h-4 w-4" />
          {dm.confirmConversion}
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
  const { t } = useDashboardI18n();
  const f = t.form;
  const cm = t.rendezVous.crmModal;
  const prenom = row.nom.trim().split(/\s+/)[0] ?? row.nom;
  const crmFieldClass = "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";
  const crmInputClass =
    "mt-1 w-full border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input";
  const crmSelectClass = crmInputClass + " cursor-pointer bg-card";

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
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{cm.eyebrow}</p>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground">
            {cm.title} <span className="font-semibold">{prenom}</span>
          </h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center border border-border hover:bg-muted" aria-label={t.common.close}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex min-h-0 max-h-[min(85vh,34rem)] flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <p className="text-sm text-muted-foreground">{cm.intro}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor={`crm-rv-parent-${row.id}`} className={crmFieldClass}>
                {f.parentDisplayName} <span className="text-foreground">{t.common.required}</span>
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
                {f.studentName} <span className="text-foreground">{t.common.required}</span>
              </label>
              <input id={`crm-rv-eleve-${row.id}`} name="eleve" required minLength={1} className={crmInputClass} placeholder={f.studentNamePlaceholder} />
            </div>
            <div>
              <label htmlFor={`crm-rv-naissance-${row.id}`} className={crmFieldClass}>
                {f.birthDate}
              </label>
              <input id={`crm-rv-naissance-${row.id}`} name="naissance" placeholder={f.birthDatePlaceholder} className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-niveau-${row.id}`} className={crmFieldClass}>
                {f.level}
              </label>
              <select id={`crm-rv-niveau-${row.id}`} name="niveau" className={crmSelectClass} defaultValue="">
                <option value="">{t.common.select}</option>
                <option value="ps">{f.levels.ps}</option>
                <option value="ms">{f.levels.ms}</option>
                <option value="gs">{f.levels.gs}</option>
                <option value="cp">{f.levels.cp}</option>
                <option value="ce1">{f.levels.ce1}</option>
                <option value="ce2">{f.levels.ce2}</option>
                <option value="cm1">{f.levels.cm1}</option>
                <option value="cm2">{f.levels.cm2}</option>
              </select>
            </div>
            <div>
              <label htmlFor={`crm-rv-pere-${row.id}`} className={crmFieldClass}>
                {f.fatherName}
              </label>
              <input id={`crm-rv-pere-${row.id}`} name="pere" autoComplete="additional-name" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-mere-${row.id}`} className={crmFieldClass}>
                {f.motherName}
              </label>
              <input id={`crm-rv-mere-${row.id}`} name="mere" autoComplete="additional-name" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-cin-${row.id}`} className={crmFieldClass}>
                {f.cinPassport}
              </label>
              <input id={`crm-rv-cin-${row.id}`} name="cin" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-email1-${row.id}`} className={crmFieldClass}>
                {f.email1} <span className="text-foreground">{t.common.required}</span>
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
                {f.email2}
              </label>
              <input id={`crm-rv-email2-${row.id}`} name="email2" type="email" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-tel1-${row.id}`} className={crmFieldClass}>
                {f.phone1}
              </label>
              <input id={`crm-rv-tel1-${row.id}`} name="tel1" type="tel" defaultValue={row.phone} autoComplete="tel" className={crmInputClass} />
            </div>
            <div>
              <label htmlFor={`crm-rv-tel2-${row.id}`} className={crmFieldClass}>
                {f.phone2}
              </label>
              <input id={`crm-rv-tel2-${row.id}`} name="tel2" type="tel" className={crmInputClass} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border p-5">
          <button
            type="submit"
            className="inline-flex min-w-[8rem] flex-1 items-center justify-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/85"
          >
            <CheckCircle className="h-4 w-4" />
            {cm.submit}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-w-[8rem] flex-1 items-center justify-center border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t.common.cancel}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ReplyModal({ row, onClose }: { row: Demande; onClose: () => void }) {
  const { t } = useDashboardI18n();
  const rm = t.rendezVous.replyModal;
  const [sujet, setSujet] = useState(`${rm.rePrefix}${row.sujet}`);
  const [msg, setMsg] = useState("");
  const replyTo = row.nom.trim().split(/\s+/)[0] ?? row.nom;

  return (
    <ModalShell onClose={onClose} wide>
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{rm.eyebrow}</p>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground">{interpolate(rm.title, { name: replyTo })}</h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center border border-border hover:bg-muted" aria-label={t.common.close}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.common.recipient}</p>
          <input readOnly value={row.email} className="mt-1 w-full border border-border bg-muted px-3 py-2 text-sm text-foreground/90" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.common.subject}</p>
          <input
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder={rm.subjectPlaceholder}
            className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input"
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.common.message}</p>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={rm.messagePlaceholder}
            rows={6}
            className="mt-1 w-full resize-y border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 border border-primary bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          <Send className="h-4 w-4" />
          {rm.send}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  const { t } = useDashboardI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-primary/50" onClick={onClose} aria-label={t.common.close} />
      <div
        role="dialog"
        aria-modal="true"
        className={
          "relative z-10 flex min-h-0 max-h-[min(92vh,42rem)] w-full flex-col border border-border bg-card shadow-xl " +
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

function afficheDemandes(n: number, rv: DashboardTranslations["rendezVous"]) {
  if (n === 0) return rv.demandsNone;
  if (n === 1) return rv.demandsOne;
  return interpolate(rv.demandsMany, { count: n });
}
