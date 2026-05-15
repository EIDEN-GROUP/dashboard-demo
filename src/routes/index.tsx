import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { ArrowRight, BarChart3, Calendar, Check, CreditCard, GraduationCap, Globe, Images, LayoutDashboard, LogOut, Mail, MapPin, Phone, Send, Sparkles, UserPlus, Users, AlertCircle, FileSpreadsheet, Eye, BadgeDollarSign, Star, Layers, ClipboardList, UsersRound, Lock, MousePointerClick, Menu,} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HeroPreviewPageBody } from "@/components/hero-preview-page-body";
import type { DashboardMiniaturePageId } from "@/lib/dashboard-mirror-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

const MotionLink = motion.create(Link);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kairo — CRM pour Centres Spécialisés au Maroc | Quittez Excel" },
      {
        name: "description",
        content:
          "CRM pour centres autisme, TDAH et troubles d'apprentissage au Maroc. Dossiers, paiements, planning centralisés. En ligne en 48h. Sans engagement.",
      },
    ],
  }),
  component: LandingPage,
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

declare global {
  interface Window {
    clarity?: (action: string, key: string, value?: string) => void;
  }
}

function track(event: string, value?: string) {
  window.clarity?.("event", event, value);
}

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const previewTopNav: { id: DashboardMiniaturePageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "rendez-vous", label: "Rendez-vous", icon: Calendar },
  { id: "familles", label: "Dossiers", icon: Users },
  { id: "paiements", label: "Paiements", icon: CreditCard },
];

const previewSecondaryNav: { id: DashboardMiniaturePageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "affiches", label: "Affiches", icon: Images },
  { id: "rapports", label: "Rapports", icon: BarChart3 },
];

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navScroll = (id: string) => {
    scrollToId(id);
    setMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link to="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ rotate: -8, scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)] sm:h-10 sm:w-10">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
            <span className="truncate text-base font-bold tracking-tight sm:text-lg">Kairo</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex sm:gap-2 md:gap-3">
            <button onClick={() => scrollToId("demo")} className="px-2 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground md:px-4">
              Démo
            </button>
            <button onClick={() => scrollToId("modules")} className="px-2 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground md:px-4">
              Modules
            </button>
            <button onClick={() => scrollToId("tarifs")} className="px-2 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground md:px-4">
              Tarifs
            </button>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center border border-border/80 text-foreground/80 transition hover:bg-muted sm:hidden"
              aria-expanded={menuOpen}
              aria-controls="landing-nav-sheet"
              aria-label="Ouvrir le menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="inline-flex max-w-[11rem] items-center justify-center gap-1.5 bg-foreground px-3 py-2.5 text-xs font-semibold text-background shadow-[var(--shadow-soft)] transition hover:bg-primary sm:max-w-none sm:gap-2 sm:px-5 sm:text-sm"
            >
              <span className="truncate sm:whitespace-normal">Réserver une démo</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            </motion.button>
            <MotionLink to="/login" className="hidden text-sm font-medium text-foreground/50 transition hover:text-foreground sm:inline-flex">
              Connexion
            </MotionLink>
          </div>
        </div>
      </motion.header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" id="landing-nav-sheet" className="flex w-[min(100%,20rem)] flex-col sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1 border-t border-border pt-4" aria-label="Menu mobile">
            {[
              { label: "Démo interactive", id: "demo" },
              { label: "Modules", id: "modules" },
              { label: "Tarifs", id: "tarifs" },
              { label: "FAQ", id: "faq" },
              { label: "Contact", id: "contact" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navScroll(item.id)}
                className="rounded-md px-3 py-3 text-left text-base font-medium text-foreground transition hover:bg-muted"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-foreground/50 transition hover:bg-muted"
            >
              Connexion
            </Link>
          </nav>
          <div className="mt-auto border-t border-border pt-4">
            <button
              type="button"
              onClick={() => { scrollToId("contact"); setMenuOpen(false); }}
              className="flex w-full items-center justify-center gap-2 bg-foreground px-4 py-3.5 text-sm font-black text-background transition hover:bg-primary"
            >
              Réserver ma démo — 20 min
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─────────────────────────────────────────────
// Hero miniature dashboard (right column)
// ─────────────────────────────────────────────
function HeroDashboardPreview() {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState<DashboardMiniaturePageId>("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const showLocked = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4000);
  };

  const previewBtn =
    "inline-flex items-center justify-center gap-0.5 border border-border bg-card px-1.5 py-0.5 text-[9px] font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98] sm:text-[10px]";

  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="relative w-full">
      {/* Glow behind the frame */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-foreground/5 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.25 }}
        className="relative min-w-0 overflow-hidden rounded-2xl border-2 border-border bg-card shadow-[var(--shadow-elegant)] ring-1 ring-foreground/[0.06]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="ml-2 flex-1 rounded border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            kairo.ma · aperçu démo
          </span>
          <span className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live
          </span>
        </div>

        {/* App shell */}
        <div className="flex flex-col bg-muted text-[9px] sm:text-[10px]">
          {/* App header */}
          <div className="shrink-0 border-b border-border bg-card px-2 py-1.5 sm:px-3 sm:py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-tight text-foreground sm:text-xs">Kairo</p>
                <p className="text-[8px] uppercase tracking-widest text-muted-foreground sm:text-[9px]">Centre spécialisé</p>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="grid h-5 w-5 place-items-center bg-primary text-[8px] font-bold text-primary-foreground sm:h-6 sm:w-6 sm:text-[9px]">A</div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  className="grid h-5 w-5 place-items-center border border-border text-muted-foreground hover:bg-muted sm:h-6 sm:w-6"
                  onClick={() => showLocked("Connectez-vous pour accéder à votre espace réel.")}
                >
                  <LogOut className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2} />
                </motion.button>
              </div>
            </div>
            {/* Top nav */}
            <nav className="mt-1.5 flex flex-nowrap gap-0.5 overflow-x-auto border-t border-border/70 pt-1">
              {previewTopNav.map((n) => {
                const Icon = n.icon;
                const active = page === n.id;
                return (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => setPage(n.id)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "flex shrink-0 items-center gap-0.5 border px-1 py-1 sm:px-1.5",
                      active ? "border-border bg-muted font-semibold text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5 shrink-0 opacity-75 sm:h-3 sm:w-3" />
                    <span className="whitespace-nowrap">{n.label}</span>
                  </motion.button>
                );
              })}
            </nav>
            {/* Secondary nav */}
            <div className="mt-1 flex flex-wrap gap-0.5 border-t border-border bg-muted px-1 py-1">
              {previewSecondaryNav.map((n) => {
                const Icon = n.icon;
                const active = page === n.id;
                return (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => setPage(n.id)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "flex items-center gap-0.5 border px-1 py-0.5 font-medium",
                      active ? "border-border bg-card text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:bg-card/90",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5 shrink-0 opacity-75 sm:h-3 sm:w-3" />
                    {n.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Page area */}
          <main className="relative h-[min(42vh,280px)] min-h-[220px] shrink-0 overflow-hidden bg-muted sm:h-[280px] sm:min-h-0 md:h-[300px]">
            <AnimatePresence initial={false} mode="wait">
              {notice && (
                <motion.div
                  key={notice}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease }}
                  className="pointer-events-none absolute left-2 right-2 top-2 z-20 flex justify-center"
                >
                  <p className="max-w-full rounded-full border border-foreground/15 bg-background/95 px-3 py-1.5 text-center text-xs text-muted-foreground shadow-md backdrop-blur-sm">
                    {notice}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                transition={panelTransition}
                className="absolute inset-0 overflow-y-auto overscroll-contain p-2 sm:p-2.5"
              >
                <HeroPreviewPageBody page={page} previewBtn={previewBtn} showLocked={showLocked} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </motion.div>

      {/* Floating badge in-flow on narrow screens to avoid clipping */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.8 }}
        className="relative mt-3 flex w-max max-w-full items-center gap-1.5 self-end border-2 border-foreground bg-background px-2.5 py-1.5 shadow-[4px_4px_0_0_var(--foreground)] sm:absolute sm:right-0 sm:top-0 sm:mt-0 sm:self-auto sm:px-3 md:-right-5 md:-top-4"
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
        <span className="text-[11px] font-black uppercase tracking-wider sm:text-xs">Démo interactive</span>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// S1 Hero
// ─────────────────────────────────────────────
function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background">
        <div className="absolute inset-0 hero-mesh-grid hero-mesh-fade" />
        {!reduceMotion && (
          <>
            <motion.div className="absolute left-[10%] top-[20%] h-2 w-2 bg-foreground" animate={{ y: [0, 30, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute right-[15%] top-[35%] h-2 w-2 bg-foreground/60" animate={{ y: [0, -25, 0], opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
          </>
        )}
      </div>

      <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-28 lg:px-8">
        {/* Left: copy + CTAs */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="flex min-w-0 flex-col"
        >
          <motion.div variants={fadeUp} className="inline-flex w-fit max-w-full items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary sm:px-4 sm:text-xs">
            {!reduceMotion && (
              <motion.span animate={{ rotate: [0, 20, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <Sparkles className="h-3.5 w-3.5" />
              </motion.span>
            )}
            Plateforme de gestion tout-en-un
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-5 text-balance text-[clamp(1.85rem,5.5vw+0.6rem,4.25rem)] font-black leading-[1.08] tracking-tight sm:leading-[1.05]">
            Gérez votre centre{" "}
            <span className="text-shimmer">sans Excel</span>,{" "}
            sans chaos.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kairo est le CRM pensé pour les centres spécialisés au Maroc. Dossiers, paiements, planning — tout au même endroit, accessible en 2 clics.
          </motion.p>

          {/* Social proof mini row */}
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2">
              {["FB", "KM", "SR", "AM"].map((initials) => (
                <div key={initials} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-[9px] font-bold text-background shadow-sm">
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">10+ centres actifs au Maroc</span> · 4.9/5 ⭐
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { track("cta_hero_click"); scrollToId("contact"); }}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden bg-foreground px-6 py-3.5 text-sm font-bold text-background shadow-[var(--shadow-elegant)] transition hover:bg-primary sm:w-auto sm:px-7 sm:py-4"
            >
              {!reduceMotion && (
                <motion.span className="absolute inset-0 -z-0 bg-white/10" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
              )}
              <span className="relative">Réserver ma démo — 20 min, sans engagement</span>
              <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { track("secondary_cta_click"); scrollToId("demo"); }}
              className="inline-flex w-full items-center justify-center gap-2 border-2 border-foreground/30 bg-transparent px-6 py-3.5 text-sm font-bold text-foreground transition hover:border-foreground sm:w-auto sm:px-7 sm:py-4"
            >
              Voir la démo en direct
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-4">
            <span className="inline-flex items-center gap-2 border border-amber-400/30 bg-amber-50/60 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              🗓 5 créneaux disponibles cette semaine
            </span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
            {[
              { icon: Lock, label: "Données hébergées au Maroc" },
              { icon: BadgeDollarSign, label: "En ligne en moins de 48h" },
              { icon: Check, label: "Sans engagement" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 border border-foreground/10 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground/70">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: interactive dashboard miniature */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="relative flex w-full min-w-0 flex-col lg:pl-4"
        >
          <HeroDashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S2 Animated Feature Tour + Interactive Demo
// ─────────────────────────────────────────────
const tourSteps: {
  page: DashboardMiniaturePageId;
  icon: typeof LayoutDashboard;
  label: string;
  headline: string;
  description: string;
  tag: string;
}[] = [
  {
    page: "dashboard",
    icon: LayoutDashboard,
    label: "Tableau de bord",
    headline: "Vos KPIs en temps réel",
    description: "Recettes du mois, dettes en cours, nouveaux inscrits — tout ce dont vous avez besoin pour piloter votre centre en un seul coup d'œil.",
    tag: "Vue d'ensemble",
  },
  {
    page: "rendez-vous",
    icon: Calendar,
    label: "Rendez-vous",
    headline: "Planning centralisé",
    description: "Toutes les demandes entrantes et le planning de votre équipe au même endroit. Confirmations automatiques, zéro double booking.",
    tag: "Planning",
  },
  {
    page: "familles",
    icon: Users,
    label: "Dossiers",
    headline: "Dossiers complets en 2 clics",
    description: "Chaque dossier, chaque document, l'historique des séances et le statut de paiement accessibles immédiatement, depuis n'importe quel appareil.",
    tag: "Gestion dossiers",
  },
  {
    page: "paiements",
    icon: CreditCard,
    label: "Paiements",
    headline: "Zéro impayé oublié",
    description: "Reçus numérotés automatiquement, suivi mensuel par dossier et relances automatiques. Plus besoin de courir après les paiements.",
    tag: "Paiements & relances",
  },
  {
    page: "rapports",
    icon: BarChart3,
    label: "Rapports",
    headline: "Indicateurs & exports",
    description: "Tableaux de bord analytiques et exports CSV prêts pour votre comptabilité. Prenez les bonnes décisions avec les bonnes données.",
    tag: "Analyse",
  },
];

function DemoSection() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [page, setPage] = useState<DashboardMiniaturePageId>("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const currentStep = tourSteps[step];

  const showLocked = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4500);
  };

  // resumeTimer: after manual interaction, resume auto-advance in 10s
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRef = useRef(true); // true = auto-advancing

  const goToStep = (i: number) => {
    setStep(i);
    setPage(tourSteps[i].page);
    autoRef.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { autoRef.current = true; }, 10000);
  };

  const prevStep = () => goToStep((step - 1 + tourSteps.length) % tourSteps.length);
  const nextStep = () => goToStep((step + 1) % tourSteps.length);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (autoRef.current) {
        setStep((s) => {
          const next = (s + 1) % tourSteps.length;
          setPage(tourSteps[next].page);
          return next;
        });
      }
    }, 8000);
    return () => {
      window.clearInterval(id);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const previewBtn =
    "inline-flex items-center justify-center gap-0.5 border border-border bg-card px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98] sm:text-[11px]";

  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  const StepIcon = currentStep.icon;

  // Shared dashboard frame used in both layouts
  function DashboardFrame() {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-border bg-card shadow-[var(--shadow-elegant)]">
        {/* Browser bar */}
        <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2 sm:px-4 sm:py-2.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/25 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/25 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/25 sm:h-2.5 sm:w-2.5" />
          <span className="ml-2 flex-1 truncate rounded border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:ml-3 sm:px-3 sm:text-xs">
            kairo.ma · {currentStep.label.toLowerCase()}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary sm:px-2 sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="hidden sm:inline">Démo live</span>
            <span className="sm:hidden">Live</span>
          </span>
        </div>
        {/* App shell */}
        <div className="flex flex-col bg-muted">
          {/* Top nav */}
          <div className="border-b border-border bg-card px-3 py-2 sm:px-5 sm:py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground sm:text-base">Kairo</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-[11px]">Centre spécialisé</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex sm:text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground sm:h-6 sm:w-6 sm:text-[11px]">A</span>
                  Admin · Directeur
                </div>
                <button
                  className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted sm:px-2 sm:py-1 sm:text-xs"
                  onClick={() => showLocked("Connectez-vous pour accéder à votre espace réel.")}
                >
                  <LogOut className="inline h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </div>
            </div>
            <nav className="mt-1.5 flex flex-wrap gap-0.5 border-t border-border/70 pt-1.5 sm:mt-2 sm:gap-1 sm:pt-2">
              {[...previewTopNav, ...previewSecondaryNav].map((n) => {
                const Icon = n.icon;
                const active = page === n.id;
                return (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => { const idx = tourSteps.findIndex(t => t.page === n.id); if (idx !== -1) goToStep(idx); else setPage(n.id); }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] font-medium transition sm:px-2 sm:py-1 sm:text-xs",
                      active ? "border-border bg-muted font-semibold text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5 opacity-70 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">{n.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
          {/* Page content */}
          <main className="relative min-h-[min(52vh,380px)] overflow-hidden sm:min-h-[340px] lg:min-h-[380px]">
            <AnimatePresence initial={false} mode="wait">
              {notice && (
                <motion.div
                  key={notice}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease }}
                  className="pointer-events-none absolute left-2 right-2 top-2 z-20 flex justify-center sm:left-4 sm:right-4 sm:top-3"
                >
                  <p className="max-w-xs rounded-full border border-foreground/15 bg-background/95 px-3 py-1.5 text-center text-xs text-muted-foreground shadow-md backdrop-blur-sm sm:max-w-md sm:px-4 sm:py-2 sm:text-sm">
                    {notice}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                role="tabpanel"
                aria-live="polite"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                transition={panelTransition}
                className="h-full overflow-y-auto overscroll-contain p-3 sm:p-5"
              >
                <HeroPreviewPageBody page={page} previewBtn={previewBtn} showLocked={showLocked} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const el = document.getElementById("demo");
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { track("demo_section_view"); observer.disconnect(); } }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="demo" className="relative overflow-hidden border-t border-border/60 bg-secondary/20 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 hero-mesh-grid hero-mesh-fade opacity-30" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary sm:px-5 sm:text-base">
            <MousePointerClick className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
            Démo interactive sans compte requis
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Explorez Kairo maintenant.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Cliquez sur chaque module pour voir comment il fonctionne comme si c'était votre vrai tableau de bord.
          </motion.p>
        </motion.div>

        {/* ─── DESKTOP LAYOUT (lg+) sidebar step list + annotation + dashboard ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="mt-16 hidden lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 lg:items-start"
        >
          {/* Left: step list */}
          <div className="flex flex-col gap-2">
            {tourSteps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              return (
                <motion.button
                  key={s.page}
                  type="button"
                  onClick={() => goToStep(i)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group flex items-center gap-3 border-2 p-3.5 text-left transition-all",
                    active
                      ? "border-foreground bg-foreground text-background shadow-[4px_4px_0_0_var(--foreground)]"
                      : "border-foreground/10 bg-card text-foreground hover:border-foreground/30",
                  )}
                >
                  <span className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center border-2 transition",
                    active ? "border-background/30 bg-background/10" : "border-foreground/15 bg-foreground/5 group-hover:border-foreground/30",
                  )}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-base font-bold leading-tight", active ? "text-background" : "text-foreground")}>{s.label}</p>
                    <p className={cn("mt-0.5 text-sm", active ? "text-background/65" : "text-muted-foreground")}>{s.tag}</p>
                  </div>
                  {active && <span className="shrink-0 text-background/50 text-sm">→</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Right: annotation card + dashboard */}
          <div className="flex flex-col gap-4">
            {/* Annotation card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="relative border-2 border-foreground bg-foreground p-5 text-background shadow-[6px_6px_0_0_oklch(0_0_0/0.15)]"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-background/20 bg-background/10">
                    <StepIcon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-background/50 uppercase tracking-widest">
                        Module {step + 1} / {tourSteps.length}
                      </span>
                      <span className="rounded-full border border-background/20 bg-background/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-background/70">
                        {currentStep.tag}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-2xl font-black">{currentStep.headline}</h3>
                    <p className="mt-2 text-base leading-relaxed text-background/75">{currentStep.description}</p>
                  </div>
                </div>
                {/* Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {tourSteps.map((_, i) => (
                      <button key={i} onClick={() => goToStep(i)}
                        className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-background" : "w-1.5 bg-background/30 hover:bg-background/60")}
                        aria-label={`Module ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={prevStep} aria-label="Précédent" className="flex h-8 w-8 items-center justify-center border border-background/30 text-background/70 transition hover:border-background hover:text-background">←</button>
                    <button onClick={nextStep} aria-label="Suivant" className="flex h-8 w-8 items-center justify-center border border-background/30 bg-background/10 text-background/70 transition hover:border-background hover:bg-background/20 hover:text-background">→</button>
                  </div>
                </div>
                <div className="absolute -bottom-[10px] left-10 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-foreground" />
              </motion.div>
            </AnimatePresence>
            <DashboardFrame />
          </div>
        </motion.div>

        {/* ─── MOBILE LAYOUT (< lg) horizontal tab bar + annotation card + dashboard ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="mt-10 flex flex-col gap-4 lg:hidden"
        >
          {/* Tab bar horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {tourSteps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              return (
                <motion.button
                  key={s.page}
                  type="button"
                  onClick={() => goToStep(i)}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex shrink-0 snap-start flex-col items-center gap-1.5 border-2 px-4 py-3 text-center transition-all",
                    active
                      ? "border-foreground bg-foreground text-background shadow-[3px_3px_0_0_var(--foreground)]"
                      : "border-foreground/10 bg-card text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-background" : "text-foreground/60")} strokeWidth={1.5} />
                  <span className={cn("text-xs font-bold whitespace-nowrap sm:text-sm", active ? "text-background" : "text-foreground/70")}>{s.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Annotation card compact */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease }}
              className="border-2 border-foreground bg-foreground p-4 text-background"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-background/20 bg-background/10">
                  <StepIcon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-background/50 uppercase tracking-widest">Module {step + 1} / {tourSteps.length} · {currentStep.tag}</p>
                  <h3 className="mt-0.5 text-lg font-black leading-tight sm:text-xl">{currentStep.headline}</h3>
                </div>
              </div>
              <p className="mt-2.5 text-base leading-relaxed text-background/75">{currentStep.description}</p>
              {/* Progress dots + arrows */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {tourSteps.map((_, i) => (
                    <button key={i} onClick={() => goToStep(i)}
                      className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-background" : "w-1.5 bg-background/30")}
                      aria-label={`Module ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={prevStep} aria-label="Précédent" className="flex h-7 w-7 items-center justify-center border border-background/30 text-background/70 text-sm transition hover:border-background hover:text-background">←</button>
                  <button onClick={nextStep} aria-label="Suivant" className="flex h-7 w-7 items-center justify-center border border-background/30 bg-background/10 text-background/70 text-sm transition hover:border-background hover:bg-background/20 hover:text-background">→</button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dashboard */}
          <DashboardFrame />
        </motion.div>

        {/* CTA below demo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Cette démo vous a convaincu ? Réservez votre créneau avec vos propres données.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-sm font-black text-background transition hover:bg-primary"
          >
            Réserver ma démo — 20 min, sans engagement
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S3 Pain Points
// ─────────────────────────────────────────────
const painPoints = [
  {
    icon: FileSpreadsheet,
    emoji: "📋",
    title: "Le chaos des classeurs",
    quote: "« Dans quel Excel est le dossier Benali ? »",
    text: "Chaque fichier est sur un ordinateur différent, dans des versions différentes. Retrouver une information prend 10 minutes.",
    accent: "border-t-[#0c5752]",
    bg: "bg-[color-mix(in_srgb,#0c5752_7%,#f8f3e8)]",
  },
  {
    icon: CreditCard,
    emoji: "💸",
    title: "Les impayés invisibles",
    quote: "« 3 dossiers n'ont pas réglé leur mensualité depuis 2 mois. »",
    text: "Vous le découvrez en fin de mois, trop tard pour agir sans créer de tension. Le manque à gagner s'accumule silencieusement.",
    accent: "border-t-[#b8a876]",
    bg: "bg-[color-mix(in_srgb,#cfc292_22%,#fefdfb)]",
  },
  {
    icon: UserPlus,
    emoji: "👨‍👩‍👦",
    title: "Les nouvelles demandes qui s'évaporent",
    quote: "« J'avais noté ça quelque part… »",
    text: "Un nouveau contact vous appelle, vous griffonnez un post-it. Trois jours après, la note a disparu. Cette inscription est perdue pour toujours.",
    accent: "border-t-[#122620]",
    bg: "bg-[color-mix(in_srgb,#122620_6%,#f4ebd0)]",
  },
];

function PainPointsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-[#0c5752]/25 bg-[color-mix(in_srgb,#0c5752_6%,#f4ebd0)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0c5752]">
            La réalité du terrain
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Vous vous reconnaissez dans ces situations ?
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Les directeurs de centres spécialisés nous racontent tous la même chose. Ce n'est pas un manque de compétence c'est un manque d'outil adapté.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {painPoints.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 280 } }}
              className={cn("flex flex-col gap-4 border-t-4 border-2 border-foreground/10 p-6 transition-shadow hover:shadow-lg", p.accent, p.bg)}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center border bg-white text-2xl">
                  {p.emoji}
                </span>
                <h3 className="text-base font-bold text-foreground">{p.title}</h3>
              </div>
              <blockquote className="border-l-2 border-foreground/20 pl-3 text-sm italic font-medium text-foreground/80">
                {p.quote}
              </blockquote>
              <p className="text-sm leading-relaxed text-foreground/65">{p.text}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-base font-semibold text-foreground/60">
            Il existe une solution conçue exactement pour votre réalité.
          </p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="mt-3 text-foreground/30 text-xl">
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S4 Solution bridge (dark bg)
// ─────────────────────────────────────────────
function SolutionSection() {
  const benefits = [
    "Tous les dossiers en un seul endroit, accessibles en 2 clics",
    "Suivi des nouvelles demandes pour ne plus jamais perdre une inscription",
    "Suivi des paiements automatisé avec alertes d'impayés en temps réel",
  ];

  return (
    <section className="relative overflow-hidden border-y border-border bg-foreground py-24 text-background sm:py-32">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-background/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-background/[0.04] blur-3xl" />

      <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-background/20 bg-background/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            La solution
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Kairo centralise tout.{" "}
            <span className="opacity-60">Un seul tableau de bord.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-background/70">
            Fini les outils éparpillés. Kairo a été conçu de A à Z pour les centres spécialisés avec les contraintes réelles des directeurs en tête.
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-background text-foreground">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-background/85">{b}</span>
              </li>
            ))}
          </motion.ul>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="mt-10 inline-flex items-center gap-2 bg-background px-7 py-4 text-sm font-black text-foreground transition hover:bg-background/90"
          >
            Réserver ma démo — 20 min, sans engagement
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4"
        >
          {[
            { value: "10+", label: "centres actifs", sub: "au Maroc" },
            { value: "6", label: "modules intégrés", sub: "tout-en-un" },
            { value: "< 48h", label: "mise en service", sub: "accompagnée" },
            { value: "100%", label: "adapté au Maroc", sub: "marché local" },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 border border-background/20 bg-background/[0.06] p-4 backdrop-blur-sm sm:p-6">
              <p className="text-2xl font-black tracking-tight tabular-nums sm:text-3xl md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-background/80 sm:text-sm">{stat.label}</p>
              <p className="text-[10px] text-background/50 sm:text-xs">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S5 Modules
// ─────────────────────────────────────────────
const modules = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    benefit: "Tout votre centre en un regard",
    text: "Dès que vous ouvrez Kairo, vous voyez ce qui se passe : combien de dossiers actifs, combien d'impayés, quels rendez-vous sont prévus aujourd'hui. Aucun rapport à générer.",
  },
  {
    icon: UsersRound,
    title: "Dossiers",
    benefit: "Fini les dossiers éparpillés",
    text: "Chaque dossier est complet : enfant, contrat, historique des séances et documents. Vous trouvez tout en moins de 10 secondes, depuis n'importe quel appareil.",
  },
  {
    icon: ClipboardList,
    title: "Planifications",
    benefit: "Tous vos événements centralisés",
    text: "Conseils pédagogiques, ateliers parents, sorties, formations internes — planifiez et retrouvez chaque événement en un coup d'œil, sans risque d'oubli.",
  },
  {
    icon: Calendar,
    title: "Rendez-vous",
    benefit: "Un planning sans conflits ni oublis",
    text: "Gérez les demandes de rendez-vous et le planning de toute votre équipe depuis un seul écran. Les confirmations partent automatiquement, vous n'avez rien à faire manuellement.",
  },
  {
    icon: CreditCard,
    title: "Paiements",
    benefit: "Zéro impayé qui passe entre les mailles",
    text: "Kairo génère les reçus, suit ce que chaque dossier doit régler chaque mois et envoie des relances automatiques. Vous n'avez plus à courir après les paiements en retard.",
  },
  {
    icon: Layers,
    title: "Équipe",
    benefit: "Vos collaborateurs organisés simplement",
    text: "Contrats, rôles et départements de votre équipe centralisés en un endroit. Chaque membre accède uniquement à ce qui le concerne, sans réglages compliqués.",
  },
];

function ModulesSection() {
  return (
    <section id="modules" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 hero-mesh-grid hero-mesh-fade opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-1.5 text-xs font-black uppercase tracking-widest">
            Modules
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Tout ce dont votre centre a besoin.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            6 modules intégrés conçus pour les réalités d'un centre spécialisé. En ligne en 48h. Formé avec vous. Aucun développeur requis.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 280 } }}
              className="group flex min-w-0 flex-col border-2 border-foreground/10 bg-card p-5 transition-all hover:border-foreground hover:shadow-[6px_6px_0_0_var(--foreground)] cursor-pointer sm:p-7"
              onClick={() => scrollToId("demo")}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center border-2 border-foreground/15 bg-foreground/5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                  <mod.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
              </div>
              <h3 className="mt-5 text-lg font-black">{mod.title}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-primary">{mod.benefit}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mod.text}</p>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-foreground/40 opacity-0 transition group-hover:opacity-100">
                Voir dans la démo →
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("demo")}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-8 py-4 text-sm font-black text-background transition hover:bg-transparent hover:text-foreground"
          >
            Explorer tous les modules en démo
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S6 Social Proof
// ─────────────────────────────────────────────
const testimonials = [
  {
    initials: "FB",
    avatarColor: "#1a4f8a",
    name: "Fatima Benali",
    role: "Directrice",
    center: "Centre Lumière",
    city: "Casablanca",
    stars: 5,
    date: "Il y a 2 semaines",
    highlight: "Zéro Excel depuis 3 mois",
    quote: "Avant Kairo, je passais mes lundis matin à réconcilier trois fichiers Excel différents. Maintenant tout est là, en temps réel. Je me concentre sur les enfants, pas sur l'administratif.",
  },
  {
    initials: "KM",
    avatarColor: "#0c5752",
    name: "Karim Mounir",
    role: "Administrateur",
    center: "Centre Avenir",
    city: "Rabat",
    stars: 5,
    date: "Il y a 1 mois",
    highlight: "−40 % d'impayés en 2 mois",
    quote: "Le module paiements a tout changé. On a réduit les impayés de 40 % grâce aux relances automatiques. L'export CSV nous fait gagner une demi-journée chaque mois.",
  },
  {
    initials: "SR",
    avatarColor: "#7c3aed",
    name: "Samira Raji",
    role: "Directrice",
    center: "Institut Espoir",
    city: "Marrakech",
    stars: 5,
    date: "Il y a 3 semaines",
    highlight: "En ligne en moins de 48h",
    quote: "Ce qui m'a convaincue c'est la simplicité. Mon équipe n'est pas technique mais tout le monde était à l'aise dès le premier jour. La mise en place a pris moins de 48 heures.",
  },
  {
    initials: "YF",
    avatarColor: "#b45309",
    name: "Youssef El Fassi",
    role: "Co-fondateur",
    center: "Centre Nour",
    city: "Fès",
    stars: 5,
    date: "Il y a 5 jours",
    highlight: "Zéro inscription perdue depuis l'adoption",
    quote: "On ne perd plus aucune demande depuis qu'on utilise Kairo. Avant, un post-it tombait et le contact disparaissait. Maintenant chaque dossier est suivi jusqu'à l'inscription.",
  },
  {
    initials: "HA",
    avatarColor: "#be185d",
    name: "Houda Alaoui",
    role: "Responsable administrative",
    center: "Centre Rayane",
    city: "Agadir",
    stars: 5,
    date: "Il y a 2 mois",
    highlight: "Support réactif et formation incluse",
    quote: "L'équipe Kairo nous a accompagnés pas à pas. La formation était incluse, le paramétrage fait avec nous. Je recommande à tous les centres qui veulent se moderniser sans prise de tête.",
  },
  {
    initials: "AC",
    avatarColor: "#0f766e",
    name: "Anas Chraibi",
    role: "Directeur",
    center: "Institut Al Amal",
    city: "Tanger",
    stars: 5,
    date: "Il y a 3 mois",
    highlight: "Accessible depuis n'importe quel appareil",
    quote: "Je gère mon centre depuis mon téléphone quand je suis en déplacement. Le tableau de bord s'affiche parfaitement sur mobile. C'est devenu indispensable.",
  },
  {
    initials: "NB",
    avatarColor: "#6d28d9",
    name: "Nadia Berrada",
    role: "Directrice pédagogique",
    center: "Centre Soleil",
    city: "Meknès",
    stars: 5,
    date: "Il y a 6 semaines",
    highlight: "Dossiers ultra-clairs et accessibles",
    quote: "Chaque dossier est complet : enfant, historique, documents. En une recherche je trouve tout. Mes thérapeutes n'ont plus à me demander des informations basiques.",
  },
  {
    initials: "OT",
    avatarColor: "#b91c1c",
    name: "Omar Tahir",
    role: "Fondateur",
    center: "Centre Wafa",
    city: "Casablanca",
    stars: 4,
    date: "Il y a 1 mois",
    highlight: "Excellent rapport qualité/prix",
    quote: "Pour le prix, on a un outil qui rivalise avec ce qu'on trouve à l'étranger. Et tout est pensé pour le Maroc : les montants, le contexte, le support en français et en arabe.",
  },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-4 border-2 border-foreground/10 bg-card p-4 shadow-[var(--shadow-soft)] sm:p-6">
      {/* Stars + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("h-3.5 w-3.5", i < t.stars ? "fill-current" : "fill-none opacity-30")} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{t.date}</span>
      </div>
      {/* Highlight badge */}
      <span className="inline-flex w-fit items-center border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
        {t.highlight}
      </span>
      {/* Quote */}
      <blockquote className="flex-1 text-balance text-sm leading-relaxed text-foreground/75">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      {/* Author */}
      <div className="flex items-center gap-3 border-t border-foreground/8 pt-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ring-2 ring-foreground/10"
          style={{ backgroundColor: t.avatarColor }}
          aria-label={t.name}
        >
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{t.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{t.role} · {t.center}</p>
          <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {t.city}
          </p>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIAL_GAP_PX = 20;

function SocialProofSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [cardWidthPx, setCardWidthPx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const total = testimonials.length;
  const maxIndex = Math.max(0, total - visibleCount);
  const stepPx = cardWidthPx > 0 ? cardWidthPx + TESTIMONIAL_GAP_PX : 0;

  // Detect visible count from window width
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // After breakpoint change, keep index in range
  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, total - visibleCount)));
  }, [visibleCount, total]);

  const measureCards = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.offsetWidth;
    const vc = Math.max(1, visibleCount);
    const cw = (vw - TESTIMONIAL_GAP_PX * (vc - 1)) / vc;
    setCardWidthPx(Math.max(0, cw));
  }, [visibleCount]);

  useLayoutEffect(() => {
    measureCards();
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureCards);
    ro.observe(el);
    window.addEventListener("resize", measureCards);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureCards);
    };
  }, [measureCards]);

  // Keep maxIndex fresh in auto-advance via ref
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const maxIndexRef = useRef(maxIndex);
  maxIndexRef.current = maxIndex;

  // Auto-advance
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!isPausedRef.current) {
        setCurrent((c) => (c >= maxIndexRef.current ? 0 : c + 1));
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const prev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    setIsPaused(true);
  };
  const next = () => {
    setCurrent((c) => Math.min(maxIndex, c + 1));
    setIsPaused(true);
  };

  return (
    <section className="relative overflow-hidden bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Star className="h-3.5 w-3.5 fill-current" />
            Avis vérifiés
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Ce que disent nos directeurs.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Des centres à travers tout le Maroc qui utilisent Kairo au quotidien.
          </motion.p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mt-14 grid grid-cols-2 divide-x-2 divide-foreground/10 border-2 border-foreground/10 bg-card sm:grid-cols-4"
        >
          {[
            { value: "10+", label: "centres actifs" },
            { value: "4.9 / 5", label: "note moyenne" },
            { value: "< 48h", label: "mise en service" },
            { value: "100%", label: "recommandent Kairo" },
          ].map((s) => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-2xl font-black tracking-tight sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Carousel */}
        <div
          className="mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Track translate by one card + gap per index (sliding window) */}
          <div ref={viewportRef} className="min-w-0 overflow-hidden">
            <motion.div
              className="flex"
              style={{ gap: TESTIMONIAL_GAP_PX }}
              animate={{ x: stepPx > 0 ? -current * stepPx : 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 34 }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="shrink-0"
                  style={{ width: cardWidthPx > 0 ? `${cardWidthPx}px` : "min(100%, 22rem)" }}
                >
                  <TestimonialCard t={t} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Dots one per visible "page" */}
            <div className="flex max-w-full flex-wrap items-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setIsPaused(true); }}
                  aria-label={`Avis ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === current ? "w-7 bg-foreground" : "w-2 bg-foreground/20 hover:bg-foreground/40",
                  )}
                />
              ))}
            </div>
            {/* Arrows */}
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prev}
                disabled={current === 0}
                aria-label="Précédent"
                className="flex h-10 w-10 items-center justify-center border-2 border-foreground/15 bg-card text-foreground/60 transition hover:border-foreground hover:text-foreground disabled:opacity-30"
              >
                ←
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                disabled={current >= maxIndex}
                aria-label="Suivant"
                className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-foreground text-background transition hover:bg-foreground/80 disabled:opacity-30"
              >
                →
              </motion.button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">Votre centre pourrait être le prochain. 5 créneaux disponibles cette semaine.</p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-sm font-black text-background transition hover:bg-primary"
          >
            Réserver ma démo — 20 min, sans engagement
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S7 Pricing
// ─────────────────────────────────────────────
type Plan = {
  id: string;
  name: string;
  blurb: string;
  monthly: number | null;
  yearly: number | null;
  features: string[];
  cta: string;
  popular?: boolean;
};

const pricingPlans: Plan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    blurb: "Jusqu'à ~50 dossiers actifs. Un seul administrateur.",
    monthly: 890,
    yearly: 8500,
    features: ["CRM dossiers & élèves", "Planning & rendez-vous", "Rapports de base", "Support par email"],
    cta: "Démarrer avec Essentiel →",
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Centres actifs : équipe multi-rôles et pilotage renforcé.",
    monthly: 1590,
    yearly: 15200,
    features: ["Tout Essentiel", "Paiements & relances auto", "Suivi des nouvelles demandes", "Exports & tableaux avancés", "Support prioritaire", "✓ Onboarding + Formation + Support inclus"],
    cta: "Démarrer avec Pro — le plus populaire →",
    popular: true,
  },
  {
    id: "reseau",
    name: "Réseau",
    blurb: "Multi-sites, groupes et besoins sur mesure.",
    monthly: null,
    yearly: null,
    features: ["SLA dédié", "Intégrations & API", "Formation des équipes", "Accompagnement au déploiement"],
    cta: "Parler à un expert",
  },
];

function PricingCard({ plan, idx, yearly }: { plan: Plan; idx: number; yearly: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: plan.popular ? -6 : -4 }}
      transition={{ type: "spring", stiffness: 260 }}
      className={cn(
        "relative flex h-full min-h-0 flex-col border-2 transition-shadow rounded-none",
        plan.popular
          ? "z-10 border-foreground bg-foreground p-6 text-background shadow-[10px_10px_0_0_oklch(0_0_0/0.18)] sm:p-8"
          : "border-foreground/25 bg-background p-5 text-foreground shadow-[6px_6px_0_0_oklch(0_0_0/0.06)] hover:border-foreground/40 sm:p-7",
      )}
    >
      {plan.popular && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease, delay: 0.15 }}
            className="absolute right-0 top-0 z-20 border-b-2 border-l-2 border-foreground bg-background px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-foreground sm:px-4 sm:text-[10px] rounded-none"
          >
            ★ Populaire
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease, delay: 0.25 }}
            className="mt-2 inline-flex items-center gap-1.5 border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300"
          >
            🎁 Onboarding offert jusqu'au 30 juin
          </motion.div>
        </>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className={cn("font-mono text-xs font-bold uppercase tracking-widest", plan.popular ? "text-background/60" : "text-muted-foreground")}>0{idx + 1} / 03</span>
        <span className={cn("h-2 w-2 shrink-0 rounded-none", plan.popular ? "bg-background" : "bg-foreground")} />
      </div>
      <h3 className={cn("mt-4 text-2xl font-black sm:text-3xl", plan.popular && "sm:text-4xl")}>{plan.name}</h3>
      <p className={cn("mt-2 text-sm", plan.popular ? "text-background/70" : "text-muted-foreground")}>{plan.blurb}</p>
      <div className={cn("my-6 h-px w-full rounded-none", plan.popular ? "bg-background/25" : "bg-foreground/15")} />
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${plan.id}-${yearly}`}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease }}
          >
            {plan.monthly == null ? (
              <div className="text-3xl font-black tracking-tight tabular-nums sm:text-4xl">Sur mesure</div>
            ) : (
              <>
                <div className="flex min-w-0 flex-wrap items-baseline gap-1">
                  <span className={cn("min-w-0 font-black tracking-tight tabular-nums", plan.popular ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl lg:text-6xl")}>{yearly ? plan.yearly?.toLocaleString("fr-MA") : plan.monthly?.toLocaleString("fr-MA")}</span>
                  <span className={cn("ml-0 shrink-0 text-xs sm:ml-1 sm:text-sm", plan.popular ? "text-background/60" : "text-muted-foreground")}>{yearly ? "/ an HT" : "/ mois HT"}</span>
                </div>
                {yearly && (
                  <p className={cn("mt-2 text-xs", plan.popular ? "text-background/60" : "text-muted-foreground")}>
                    Soit environ{" "}
                    <span className={cn("font-semibold", plan.popular ? "text-background" : "text-foreground")}>{Math.round(plan.yearly! / 12)} / mois</span> ramené sur 12 mois
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <ul className="mt-8 flex-1 space-y-3">
        {plan.features.map((f) => (
          <motion.li key={f} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, ease }} className="flex items-start gap-3 text-sm">
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none", plan.popular ? "bg-background text-foreground" : "bg-foreground text-background")}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className={plan.popular ? "text-background/90" : "text-foreground/80"}>{f}</span>
          </motion.li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => scrollToId("contact")}
        className={cn(
          "mt-8 w-full py-4 text-sm font-black uppercase tracking-wider transition rounded-none",
          plan.popular
            ? "border-2 border-background bg-background text-foreground hover:bg-transparent hover:text-background"
            : "border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
        )}
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  );
}

function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const el = document.getElementById("tarifs");
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { track("pricing_view"); observer.disconnect(); } }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCarouselIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  return (
    <section id="tarifs" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 hero-mesh-grid hero-mesh-fade opacity-60" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-none">
            Tarifs
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Des formules claires et transparentes.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Prix de départ transparents — adaptés si votre centre a des besoins spécifiques après un appel de 20 min.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="flex w-full max-w-md border-2 border-foreground shadow-[6px_6px_0_0_var(--foreground)] rounded-none">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "min-h-[3rem] flex-1 px-3 py-3 text-xs font-black uppercase tracking-wider transition-colors sm:px-6 sm:text-sm rounded-none",
                !yearly ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-muted/50",
              )}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "flex min-h-[3rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 border-l-2 border-foreground px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors sm:flex-row sm:gap-2 sm:px-6 sm:py-3 sm:text-sm rounded-none",
                yearly ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-muted/50",
              )}
            >
              <span>Annuel</span>
              <span
                className={cn(
                  "border px-1.5 py-0.5 text-[8px] font-black leading-none sm:text-[9px] rounded-none",
                  yearly ? "border-background/50 text-background" : "border-foreground/40 text-foreground",
                )}
              >
                −2 MOIS
              </span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={yearly ? "y" : "m"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {yearly ? "Facturation annuelle · 2 mois offerts" : "Facturation mensuelle · sans engagement"}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <div className="mt-16 w-full min-w-0 lg:hidden">
          <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-4">
              {pricingPlans.map((plan, idx) => (
                <CarouselItem key={plan.id} className="basis-[min(100%,22rem)] pl-3 sm:basis-[88%] sm:pl-4">
                  <PricingCard plan={plan} idx={idx} yearly={yearly} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Choisir une formule">
            {pricingPlans.map((plan, i) => (
              <button
                key={plan.id}
                type="button"
                role="tab"
                aria-selected={carouselIndex === i}
                aria-label={`${plan.name}, formule ${i + 1} sur ${pricingPlans.length}`}
                onClick={() => carouselApi?.scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  carouselIndex === i ? "w-8 bg-foreground" : "w-2 bg-foreground/25 hover:bg-foreground/40",
                )}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-16 hidden min-w-0 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid lg:grid-cols-3 lg:items-stretch"
        >
          {pricingPlans.map((plan, idx) => (
            <PricingCard key={plan.id} plan={plan} idx={idx} yearly={yearly} />
          ))}
        </motion.div>

        {/* Mini pricing FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-12 grid gap-4 border-2 border-foreground/10 bg-card p-6 sm:grid-cols-3 sm:gap-6 sm:p-8"
        >
          {[
            { q: "Puis-je payer mensuellement ?", a: "Oui, les deux options sont disponibles. L'annuel vous offre 2 mois offerts." },
            { q: "Y a-t-il des frais cachés ?", a: "Non. Le prix affiché inclut l'onboarding, la formation et le support. Aucune surprise." },
            { q: "Que se passe-t-il si mon centre grandit ?", a: "Passez de Essentiel à Pro en un clic, sans perdre vos données. Notre équipe vous accompagne." },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-bold text-foreground">{q}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S8 FAQ
// ─────────────────────────────────────────────
const faqItems = [
  { q: "Ma secrétaire peut-elle utiliser Kairo sans formation ?", a: "Oui. Kairo a été conçu pour les équipes non-techniques. L'interface est en français, intuitive, et nous assurons une formation incluse à la mise en service. La plupart des secrétaires sont autonomes en moins d'une heure." },
  { q: "Puis-je exporter mes données si je quitte Kairo ?", a: "Absolument. Toutes vos données (dossiers, paiements, historique) sont exportables en CSV à tout moment. Vous n'êtes jamais pris en otage. Votre centre reste propriétaire de ses données." },
  { q: "Combien de dossiers le logiciel peut-il gérer ?", a: "Essentiel supporte jusqu'à ~50 dossiers actifs. Pro est sans limite pratique. Réseau est conçu pour les groupes multi-sites. Contactez-nous pour un diagnostic personnalisé." },
  { q: "Y a-t-il une application mobile ?", a: "Kairo est entièrement responsive — il fonctionne parfaitement sur mobile et tablette depuis votre navigateur, sans installation. Vous gérez votre centre depuis n'importe quel appareil." },
  { q: "Kairo fonctionne-t-il en arabe ?", a: "L'interface est actuellement en français, langue de travail de la majorité de nos centres clients. Le support est disponible en français et en arabe. Une interface arabe est en cours de développement." },
  { q: "Comment sont protégées mes données (RGPD / Maroc) ?", a: "Toutes les données sont chiffrées et hébergées sur des serveurs sécurisés. Nous appliquons les bonnes pratiques RGPD adaptées au contexte marocain (loi 09-08). Aucune donnée n'est partagée avec des tiers." },
];

function FaqSection() {
  return (
    <section id="faq" className="relative bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            FAQ
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Questions fréquentes
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Ce qu'il faut savoir avant de nous contacter.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mt-12 border-2 border-foreground/10 bg-card p-2 shadow-[var(--shadow-soft)]"
        >
          <Accordion type="multiple" defaultValue={["item-0", "item-1"]} className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="px-3 py-4 text-left text-sm font-bold hover:no-underline sm:px-4 sm:py-5 sm:text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="px-3 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-4 sm:pb-5">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// WhatsApp demo form (2-field)
// ─────────────────────────────────────────────
function WhatsAppDemoForm({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [sent, setSent] = useState(false);
  const centerRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const centerName = centerRef.current?.value ?? "";
    track("form_submit");
    track("whatsapp_open", centerName || "unknown");
    const waText = encodeURIComponent(`Bonjour, je veux une démo Kairo pour ${centerName || "mon centre"}`);
    window.open(`https://wa.me/212777777428?text=${waText}`, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      onSubmit={handleSubmit}
      className="relative z-10 flex min-w-0 flex-col overflow-visible border-2 border-foreground/10 bg-card p-5 shadow-[var(--shadow-elegant)] sm:p-8 lg:p-10"
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, ease }} className="flex flex-col items-center py-10 text-center">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="flex h-16 w-16 items-center justify-center bg-[var(--gradient-hero)] text-background shadow-[var(--shadow-elegant)]">
              <Check className="h-8 w-8" />
            </motion.div>
            <h3 className="mt-6 text-2xl font-black">WhatsApp ouvert !</h3>
            <p className="mt-2 text-sm text-muted-foreground">Envoyez le message pré-rempli — nous répondons sous 2h.</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 transition hover:text-accent">
              Recommencer
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <div>
              <label htmlFor="wa-center" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom du centre *</label>
              <input ref={centerRef} id="wa-center" type="text" placeholder="Centre Lumière" required aria-required="true" className="w-full border-2 border-foreground/10 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary" />
            </div>
            <div>
              <label htmlFor="wa-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">WhatsApp *</label>
              <input ref={phoneRef} id="wa-phone" type="tel" placeholder="06 12 34 56 78" required aria-required="true" className="w-full border-2 border-foreground/10 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary" />
            </div>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="group relative mt-1 inline-flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden bg-foreground px-6 py-3.5 text-sm font-bold text-background shadow-[var(--shadow-elegant)] transition hover:bg-primary sm:py-4"
            >
              {!reduceMotion && (
                <motion.span className="pointer-events-none absolute inset-0 z-0 bg-white/10" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
              )}
              <span className="relative z-[1]">Réserver ma démo sur WhatsApp →</span>
              <Send className="relative z-[1] h-4 w-4 transition group-hover:translate-x-0.5" />
            </motion.button>
            <p className="flex shrink-0 items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              🔒 Données sécurisées · Réponse garantie sous 2h · Sans engagement
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}

// ─────────────────────────────────────────────
// S9 Contact CTA
// ─────────────────────────────────────────────
function ContactSection() {
  const reduceMotion = useReducedMotion();
  return (
    <section id="contact" className="relative overflow-hidden py-24 pb-[max(6rem,calc(6rem+env(safe-area-inset-bottom)))] sm:py-32 sm:pb-[max(8rem,calc(8rem+env(safe-area-inset-bottom)))]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-1/4 h-80 w-80 bg-primary/15 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 bg-accent/20 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="mx-auto grid min-w-0 max-w-7xl gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="min-w-0"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            Démo gratuite
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            20 minutes. Votre centre dans Kairo. En direct.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Réservez un créneau WhatsApp — on vous montre Kairo avec vos cas concrets, sans engagement.
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {(
              [
                { Icon: Phone, text: "07 77 77 74 28 Maroc", href: "tel:+212777777428" },
                { Icon: Globe, text: "+1 613 706 9011 États-Unis / Canada", href: "tel:+16137069011" },
                { Icon: Mail, text: "contact@eiden-group.com", href: "mailto:contact@eiden-group.com" },
                {
                  Icon: MapPin,
                  text: "Agadir Bay, Technopole 1 Bloc B, Agadir 80000",
                  href: "https://maps.app.goo.gl/e1PTQQJUb3kh7J48A",
                },
              ] as const
            ).map(({ Icon, text, href }) => (
              <li key={text} className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center" style={{color: "#122620"}}>
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                </span>
                <a
                  href={href}
                  {...(href.startsWith("http") ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {})}
                  className="min-w-0 break-words text-base font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition hover:text-primary hover:decoration-primary"
                >
                  {text}
                </a>
              </li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp} className="mt-8 space-y-3">
            {["Présentation personnalisée selon votre type de centre", "Réponse garantie sous 2h sur WhatsApp", "Aucun engagement requis", "Les créneaux partent vite — réservez le vôtre"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground/70">
                <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <WhatsAppDemoForm reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border/60 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-background/10">
                <GraduationCap className="h-5 w-5 text-background" />
              </div>
              <span className="text-lg font-black tracking-tight">Kairo</span>
            </div>
            <p className="mt-3 text-sm text-background/60 leading-relaxed">
              CRM pour centres éducatifs spécialisés au Maroc. Autisme · TDAH · Troubles d'apprentissage.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-background/40">Navigation</p>
            <ul className="space-y-2 text-sm">
              {[{ label: "Démo interactive", id: "demo" }, { label: "Modules", id: "modules" }, { label: "Tarifs", id: "tarifs" }, { label: "FAQ", id: "faq" }, { label: "Contact", id: "contact" }].map((item) => (
                <li key={item.id}>
                  <button onClick={() => scrollToId(item.id)} className="text-background/70 transition hover:text-background">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-background/40">Contact</p>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <a href="mailto:contact@eiden-group.com" className="transition hover:text-background">
                  contact@eiden-group.com
                </a>
              </li>
              <li className="text-balance">Agadir Bay, Technopole 1 Bloc B, Agadir 80000</li>
              <li><a href="tel:+212777777428" className="transition hover:text-background">07 77 77 74 28 (Maroc)</a></li>
              <li><a href="tel:+16137069011" className="transition hover:text-background">+1 613 706 9011 (US / Canada)</a></li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="mt-6 inline-flex items-center gap-2 border border-background/30 bg-background/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-background transition hover:bg-background hover:text-foreground"
            >
              Réserver une démo
              <ArrowRight className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-background/10 pt-6 text-xs text-background/40 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center sm:text-left">© 2026 Kairo · Tous droits réservés</span>
          <MotionLink to="/login" className="text-center text-background/30 transition hover:text-background/60 sm:text-right">
            Espace client
          </MotionLink>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────
function LandingPage() {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-background text-foreground">
      <Header />
      <Hero />
      <PainPointsSection />
      <SolutionSection />
      <ModulesSection />
      <DemoSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
