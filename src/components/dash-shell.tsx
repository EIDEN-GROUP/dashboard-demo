import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDashboardI18n } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LogOut,
  ArrowLeftRight,
  Bell,
  MessageCircle,
  Check,
  CheckCheck,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: any };

type ShellMessage = { id: string; from: string; phone: string; preview: string; time: string; unread: boolean };

/** Un message WhatsApp est soit parti (vert), soit non envoyé (rouge). */
type WhatsappState = "envoye" | "non_envoye";

type WhatsappMessage = {
  id: string;
  to: string;
  /** Numéro WhatsApp du parent. */
  phone: string;
  text: string;
  time: string;
  state: WhatsappState;
};

/** Messages envoyés aux parents via WhatsApp (rappels de paiement, reçus, annonces). */
const WHATSAPP_MESSAGES: WhatsappMessage[] = [
  {
    id: "w1",
    to: "Benjelloun / Sara",
    phone: "0611223344",
    text: "Rappel : la mensualité de mai 2026 (1 600 MAD) est en retard. Merci de régulariser avant le 20/05.",
    time: "Aujourd'hui   14:05",
    state: "envoye",
  },
  {
    id: "w2",
    to: "Famille Alami",
    phone: "0661122334",
    text: "Votre reçu de paiement EDU-20260505-115 (mai 2026) est disponible. Remise fratrie appliquée : 10 %.",
    time: "Aujourd'hui   11:20",
    state: "envoye",
  },
  {
    id: "w3",
    to: "Tazi / Mehdi",
    phone: "0622334455",
    text: "Confirmation : Mehdi est inscrit au service de transport scolaire à partir du 1er juin.",
    time: "Hier   17:42",
    state: "envoye",
  },
  {
    id: "w4",
    to: "rztest / testss",
    phone: "0614020520",
    text: "Votre dossier d'inscription est incomplet. Merci de nous transmettre la CIN du responsable légal.",
    time: "Hier   09:15",
    state: "non_envoye",
  },
  {
    id: "w5",
    to: "Famille Amrani",
    phone: "0655009911",
    text: "Bienvenue à l'école ! Voici le calendrier de la rentrée 2026 et la liste des fournitures.",
    time: "Lundi   08:30",
    state: "non_envoye",
  },
];

const WHATSAPP_STATE: Record<WhatsappState, { label: string; icon: typeof Check; pill: string; row: string }> = {
  envoye: {
    label: "Envoyé",
    icon: CheckCheck,
    pill: "bg-[#25D366]/15 text-[#1B7F45]",
    row: "border-l-[#25D366] bg-[#25D366]/[0.05]",
  },
  non_envoye: {
    label: "Non envoyé",
    icon: AlertTriangle,
    pill: "bg-[#F6D8D8] text-[#9A2F2F]",
    row: "border-l-[#E25C5C] bg-[#E25C5C]/[0.05]",
  },
};

const MESSAGES: ShellMessage[] = [
  { id: "1", from: "Famille Alami", phone: "0661122334", preview: "Bonjour, le reçu de paiement de mai est-il disponible ?", time: "Il y a 10 min", unread: true },
  { id: "2", from: "Benjelloun / Sara", phone: "0611223344", preview: "Nous réglerons la mensualité en retard vendredi.", time: "Il y a 2 h", unread: true },
  { id: "3", from: "Tazi / Mehdi", phone: "0622334455", preview: "Merci d'ajouter Mehdi au service de cantine.", time: "Hier", unread: true },
  { id: "4", from: "Famille Amrani", phone: "0655009911", preview: "Demande d'inscription pour la rentrée 2026.", time: "Lundi", unread: false },
];

type PanelTab = "alertes" | "whatsapp";

/**
 * Cloche (notifications reçues) + icône WhatsApp (messages envoyés aux parents).
 * Les deux ouvrent le même panneau latéral, sur l'onglet correspondant.
 */
function ShellNotifications() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("alertes");
  const [alerts, setAlerts] = useState<ShellMessage[]>(MESSAGES);
  const [waMessages, setWaMessages] = useState<WhatsappMessage[]>(WHATSAPP_MESSAGES);
  /** Élément ouvert en détail dans le panneau (null = liste). */
  const [selected, setSelected] = useState<string | null>(null);

  const unread = alerts.filter((m) => m.unread).length;
  // Rouge dès qu'un message n'est pas parti ; sinon vert avec le nombre de messages envoyés.
  const failed = waMessages.filter((m) => m.state === "non_envoye").length;
  const sent = waMessages.filter((m) => m.state === "envoye").length;
  const waCount = failed > 0 ? failed : sent;

  const openOn = (next: PanelTab) => {
    setTab(next);
    setSelected(null);
    setOpen(true);
  };

  /** Ouvre une notification et la marque comme lue. */
  const openAlert = (id: string) => {
    setAlerts((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
    setSelected(id);
  };

  /** Renvoie un message WhatsApp qui n'était pas parti. */
  const resend = (id: string) =>
    setWaMessages((prev) => prev.map((m) => (m.id === id ? { ...m, state: "envoye", time: "À l'instant" } : m)));

  const markAllRead = () => setAlerts((prev) => prev.map((m) => ({ ...m, unread: false })));

  const selectedAlert = tab === "alertes" && selected ? alerts.find((m) => m.id === selected) : undefined;
  const selectedWa = tab === "whatsapp" && selected ? waMessages.find((m) => m.id === selected) : undefined;

  const triggerClass =
    "relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#28396C]/15 text-muted-foreground transition-colors hover:text-foreground";
  const rowClass =
    "flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-[#B5E18B]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6BA53A]";
  const actionClass =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition";

  return (
    <>
      <button
        type="button"
        onClick={() => openOn("alertes")}
        aria-label={unread > 0 ? `Notifications   ${unread} non lues` : "Notifications"}
        className={cn(triggerClass, "hover:bg-[#B5E18B]/15")}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#E25C5C] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={() => openOn("whatsapp")}
        aria-label={failed > 0 ? `Messages WhatsApp   ${failed} non envoyés` : `Messages WhatsApp   ${sent} envoyés`}
        className={cn(triggerClass, "hover:bg-[#25D366]/15")}
      >
        <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
        {waCount > 0 ? (
          <span
            className={cn(
              "absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white",
              failed > 0 ? "bg-[#E25C5C]" : "bg-[#25D366]",
            )}
          >
            {waCount > 9 ? "9+" : waCount}
          </span>
        ) : null}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-[min(26rem,100vw-2rem)] flex-col gap-0 border-l-[#28396C]/10 bg-card p-0 sm:max-w-md"
        >
          <SheetHeader className="space-y-1 border-b border-[#28396C]/10 px-5 pb-4 pt-5 pr-14 text-left">
            <SheetTitle className="font-display text-xl tracking-tight text-foreground">Centre de messages</SheetTitle>
            <SheetDescription className="text-xs">
              Notifications reçues des parents et messages envoyés sur WhatsApp.
            </SheetDescription>
          </SheetHeader>

          {/* Onglets   masqués en vue détail */}
          {!selected ? (
            <div className="flex items-center justify-between gap-2 border-b border-[#28396C]/10 px-5 py-3">
              <div className="flex gap-1">
                {[
                  { key: "alertes" as const, label: "Notifications", count: unread, dot: "bg-[#E25C5C]" },
                  {
                    key: "whatsapp" as const,
                    label: "WhatsApp",
                    count: waCount,
                    dot: failed > 0 ? "bg-[#E25C5C]" : "bg-[#25D366]",
                  },
                ].map((tb) => (
                  <button
                    key={tb.key}
                    type="button"
                    onClick={() => setTab(tb.key)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      tab === tb.key
                        ? "bg-[#28396C] text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {tb.label}
                    {tb.count > 0 ? (
                      <span
                        className={cn(
                          "grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white",
                          tb.dot,
                        )}
                      >
                        {tb.count}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              {tab === "alertes" && unread > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="shrink-0 text-[11px] font-semibold text-[#28396C] hover:underline"
                >
                  Tout lire
                </button>
              ) : null}
            </div>
          ) : (
            <div className="border-b border-[#28396C]/10 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#28396C] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la liste
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto scroll-touch">
            {/* ── Détail d'une notification ── */}
            {selectedAlert ? (
              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">{selectedAlert.from}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {selectedAlert.time}   {selectedAlert.phone}
                  </p>
                </div>
                <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                  {selectedAlert.preview}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/dashboard/familles"
                    onClick={() => setOpen(false)}
                    className={cn(actionClass, "bg-[#B5E18B] text-[#28396C] hover:brightness-105")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Voir la fiche famille
                  </Link>
                  <Link
                    to="/dashboard/paiements"
                    onClick={() => setOpen(false)}
                    className={cn(actionClass, "border border-[#28396C]/15 text-foreground hover:bg-muted")}
                  >
                    Voir les paiements
                  </Link>
                </div>
              </div>
            ) : null}

            {/* ── Détail d'un message WhatsApp ── */}
            {selectedWa ? (
              <div className="space-y-4 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">{selectedWa.to}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {selectedWa.time}   {selectedWa.phone}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      WHATSAPP_STATE[selectedWa.state].pill,
                    )}
                  >
                    {WHATSAPP_STATE[selectedWa.state].label}
                  </span>
                </div>
                <p
                  className={cn(
                    "rounded-2xl border-l-[3px] px-4 py-3 text-sm leading-relaxed text-foreground",
                    WHATSAPP_STATE[selectedWa.state].row,
                  )}
                >
                  {selectedWa.text}
                </p>
                {selectedWa.state === "non_envoye" ? (
                  <>
                    <p className="text-xs font-medium text-[#9A2F2F]">
                      Le message n'est pas parti   numéro WhatsApp injoignable.
                    </p>
                    <button
                      type="button"
                      onClick={() => resend(selectedWa.id)}
                      className={cn(actionClass, "bg-[#25D366] text-white hover:brightness-105")}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Renvoyer le message
                    </button>
                  </>
                ) : (
                  <Link
                    to="/dashboard/familles"
                    onClick={() => setOpen(false)}
                    className={cn(actionClass, "border border-[#28396C]/15 text-foreground hover:bg-muted")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Voir la fiche famille
                  </Link>
                )}
              </div>
            ) : null}

            {/* ── Liste ── */}
            {!selected && tab === "alertes" ? (
              <ul className="divide-y divide-[#28396C]/8">
                {alerts.map((m) => (
                  <li key={m.id} className={cn(m.unread && "bg-[#B5E18B]/8")}>
                    <button type="button" onClick={() => openAlert(m.id)} className={rowClass}>
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          m.unread ? "bg-[#6BA53A]" : "bg-transparent",
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">{m.from}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{m.preview}</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                          {m.time}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {!selected && tab === "whatsapp" ? (
              <ul className="divide-y divide-[#28396C]/8">
                {waMessages.map((m) => {
                  const s = WHATSAPP_STATE[m.state];
                  const StateIcon = s.icon;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(m.id)}
                        className={cn(rowClass, "flex-col border-l-[3px]", s.row)}
                      >
                        <span className="flex w-full items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">{m.to}</span>
                          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{m.phone}</span>
                        </span>
                        <span className="mt-1 block w-full text-xs text-muted-foreground">{m.text}</span>
                        <span className="mt-2 flex w-full items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">{m.time}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              s.pill,
                            )}
                          >
                            <StateIcon className="h-3 w-3" />
                            {s.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function topNavItemActive(pathname: string, to: string) {
  if (to === "/dashboard")
    return pathname === "/dashboard" || pathname === "/dashboard/";
  if (to === "/dashboard/rendez-vous")
    return pathname === "/dashboard/rendez-vous" || pathname.startsWith("/dashboard/rendez-vous/");
  if (to === "/dashboard/familles")
    return pathname === "/dashboard/familles" || pathname.startsWith("/dashboard/familles/");
  if (to === "/dashboard/paiements")
    return pathname === "/dashboard/paiements" || pathname.startsWith("/dashboard/paiements/");
  if (to === "/dashboard/affiches")
    return pathname === "/dashboard/affiches" || pathname.startsWith("/dashboard/affiches/");
  if (to === "/dashboard/rapports")
    return pathname === "/dashboard/rapports" || pathname.startsWith("/dashboard/rapports/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Mobile bottom bar   active tab: top accent bar + weight; no background fill. */
function MobileBottomNav({
  topNav,
  pathname,
  mainNavAria,
}: {
  topNav: NavItem[];
  pathname: string;
  mainNavAria: string;
}) {
  const compact = topNav.length >= 4;
  const labelClass = compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#28396C]/10 bg-white/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-10px_35px_-15px_rgba(40,57,108,0.3)] backdrop-blur-xl lg:hidden" aria-label={mainNavAria}>
      <div className="grid min-h-[4.25rem] w-full auto-cols-fr" style={{ gridTemplateColumns: `repeat(${topNav.length}, minmax(0, 1fr))` }}>
        {topNav.map((n) => {
          const active = topNavItemActive(pathname, n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "relative mx-0.5 flex min-w-0 flex-col items-center justify-center gap-1 rounded-full px-0.5 py-2 font-sans transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <span className="flex h-1 w-full shrink-0 items-center justify-center" aria-hidden>
                <span className={cn("h-0.5 w-6 shrink-0 rounded-full", active ? "bg-primary" : "bg-transparent")} />
              </span>
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              <span className={cn( "w-full max-w-full truncate px-0.5 text-center font-semibold leading-tight", labelClass, active ? "text-foreground" : "font-medium text-muted-foreground", )}>
                {n.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DashShell({
  brand,
  brandColor: _brandColor,
  nav = [],
  topNav,
  secondaryNav,
  variant = "sidebar",
  switchTo,
  switchLabel,
  dir,
  children,
}: {
  brand: string;
  brandColor: "primary";
  nav?: NavItem[];
  topNav?: NavItem[];
  secondaryNav?: NavItem[];
  variant?: "sidebar" | "topnav";
  /** Second workspace link (e.g. admin). Omit to hide the switch control. */
  switchTo?: string;
  switchLabel?: string;
  dir?: "ltr" | "rtl";
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const { t } = useDashboardI18n();
  const navigate = useNavigate();
  const loc = useLocation();
  const shellDir = dir ?? "ltr";

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const t = setTimeout(() => navigate({ to: "/login" }), 0);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  if (variant === "topnav" && topNav && topNav.length > 0) {
    const handleLogout = () => {
      logout();
      navigate({ to: "/login" });
    };

    return (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#F4FAE6_45%,#EEF6E0_100%)]" dir={shellDir}>
        <header className="z-30 shrink-0 border-b border-[#28396C]/10 bg-white/85 backdrop-blur-xl">
          {/* Mobile: compact top bar (tabs live in bottom nav) */}
          <div className="flex items-start justify-between gap-3 px-4 py-3 lg:hidden">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Link to={topNav[0]?.to ?? "/dashboard"} className="flex min-w-0 flex-col">
                <span className="font-display text-xl leading-none tracking-tight text-foreground">{t.shell.platform}</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{brand}</span>
              </Link>
              {switchTo && switchLabel ? (
                <Link to={switchTo} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-dashed border-[#28396C]/25 px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-[#B5E18B]/15">
                  <ArrowLeftRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{switchLabel}</span>
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              <ShellNotifications />
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#28396C] text-sm font-medium text-[#B5E18B] shadow-[0_10px_20px_-10px_rgba(40,57,108,0.5)]">
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </div>
              <button type="button" onClick={handleLogout} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#28396C]/15 text-muted-foreground transition-colors hover:bg-[#B5E18B]/15 hover:text-foreground" aria-label={t.shell.logoutAria}>
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Desktop: full header */}
          <div className="hidden grid-cols-1 items-center gap-3 px-4 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4 lg:px-6 lg:py-2.5 lg:min-h-16">
            <div className="flex min-w-0 flex-col justify-center justify-self-start gap-1.5">
              <Link to={topNav[0]?.to ?? "/dashboard"} className="flex flex-col">
                <span className="font-display text-4xl leading-none text-foreground">{t.shell.platform}</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{brand}</span>
              </Link>
              {switchTo && switchLabel ? (
                <Link to={switchTo} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-dashed border-[#28396C]/25 px-2.5 py-1.5 text-xs text-foreground/90 hover:bg-[#B5E18B]/15 w-fit" >
                  <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{switchLabel}</span>
                </Link>
              ) : null}
            </div>

            <nav className="scroll-touch flex justify-center gap-1 overflow-x-auto rounded-full border border-[#28396C]/10 bg-white/80 p-1 shadow-sm lg:py-1">
              {topNav.map((n) => {
                const active = topNavItemActive(loc.pathname, n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors " +
                      (active
                        ? "bg-[#28396C] font-medium text-white shadow-[0_12px_25px_-12px_rgba(40,57,108,0.6)]"
                        : "text-muted-foreground hover:bg-[#B5E18B]/20 hover:text-foreground")
                    }
                  >
                    <n.icon className="h-4 w-4 shrink-0 opacity-80" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex w-full flex-wrap items-center justify-end gap-2 justify-self-end lg:w-auto">
              <ShellNotifications />
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium leading-none text-foreground">{user?.name || "admin"}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{brand}</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#28396C] text-sm font-medium text-[#B5E18B] shadow-[0_10px_20px_-10px_rgba(40,57,108,0.5)]">
                  {(user?.name || "A").slice(0, 1).toUpperCase()}
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-[#28396C]/15 px-3 py-1.5 text-muted-foreground hover:bg-[#B5E18B]/15" aria-label={t.shell.logoutAria}>
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:inline">{t.shell.logout}</span>
              </button>
            </div>
          </div>

          {secondaryNav && secondaryNav.length > 0 ? (
            <div className="scroll-touch flex flex-nowrap items-center gap-1 overflow-x-auto border-t border-border bg-secondary/40 px-4 py-2 lg:flex-wrap lg:px-6">
              {secondaryNav.map((n) => {
                const active = loc.pathname === n.to || loc.pathname.startsWith(`${n.to}/`);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium leading-tight " +
                      (active
                        ? "border-border bg-card text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-card/80 hover:text-foreground")
                    }
                  >
                    <n.icon className="h-3.5 w-3.5 opacity-80" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </header>

        <main data-dashboard-main dir={shellDir} className="min-h-0 flex-1 overflow-y-auto scroll-touch p-4 pb-24 lg:p-8 lg:pb-8">
          {children}
        </main>

        <MobileBottomNav topNav={topNav} pathname={loc.pathname} mainNavAria={t.shell.mainNavAria} />
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-muted">
      <aside className="hidden h-full min-h-0 w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="px-6 py-5 border-b border-border space-y-3">
          <div>
            <p className="font-display text-lg leading-none text-foreground">LOGO</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{brand}</p>
          </div>
          {switchTo && switchLabel ? (
            <Link to={switchTo} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border border-dashed border-border text-foreground/90 hover:bg-muted/80" >
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="min-w-0 truncate">{switchLabel}</span>
            </Link>
          ) : null}
        </div>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto scroll-touch p-3">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition " +
                  (active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground")
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/80"
          >
            <LogOut className="h-4 w-4" /> {t.shell.disconnect}
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-20 shrink-0 border-b border-border bg-card">
          <div className="px-6 h-16 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none text-foreground">{user?.name || "Admin"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{brand}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-medium">
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto scroll-touch p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color = "primary",
  monochrome,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  monochrome?: boolean;
  icon?: any;
}) {
  return (
    <div className="rounded-2xl bg-card border border-[#28396C]/10 p-5 shadow-[0_18px_45px_-28px_rgba(40,57,108,0.35)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={
              monochrome
                ? "grid place-items-center h-8 w-8 rounded-lg bg-muted text-foreground"
                : "grid place-items-center h-8 w-8 rounded-lg"
            }
            style={
              monochrome
                ? undefined
                : { backgroundColor: `color-mix(in oklab, var(--${color}) 22%, var(--background))`, color: `var(--${color})` }
            }
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PageTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl md:text-4xl text-foreground">{title}</h1>
      </div>
      {action}
    </div>
  );
}
