import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { ArrowRight, BarChart3, Calendar, CalendarDays, Check, CreditCard, Gift, GraduationCap, Globe, Images, LayoutDashboard, LogOut, Mail, MapPin, Phone, Send, Sparkles, UserPlus, Users, AlertCircle, FileSpreadsheet, BadgeDollarSign, Star, Layers, ClipboardList, UsersRound, Lock, MousePointerClick, Menu,} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HeroPreviewPageBody } from "@/components/hero-preview-page-body";
import type { DashboardMiniaturePageId } from "@/lib/dashboard-mirror-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import {
  useLandingI18n,
  DEMO_STEP_PAGES,
  PREVIEW_TOP_NAV_IDS,
  PREVIEW_SECONDARY_NAV_IDS,
} from "@/lib/landing-i18n";

const MotionLink = motion.create(Link);

const PREVIEW_NAV_ICONS = {
  dashboard: LayoutDashboard,
  "rendez-vous": Calendar,
  familles: Users,
  paiements: CreditCard,
  affiches: Images,
  rapports: BarChart3,
} as const;

const PAIN_ACCENT = [
  { accent: "border-t-[#0c5752]", bg: "bg-[color-mix(in_srgb,#0c5752_7%,#f8f3e8)]" },
  { accent: "border-t-[#b8a876]", bg: "bg-[color-mix(in_srgb,#cfc292_22%,#fefdfb)]" },
  { accent: "border-t-[#122620]", bg: "bg-[color-mix(in_srgb,#122620_6%,#f4ebd0)]" },
] as const;

const PAIN_ICONS = [FileSpreadsheet, CreditCard, UserPlus] as const;

const MODULE_ICONS = [LayoutDashboard, CreditCard, Layers, Calendar, UsersRound, ClipboardList] as const;

const TESTIMONIAL_AVATARS = [
  { initials: "FB", avatarColor: "#1a4f8a", stars: 5 },
  { initials: "KM", avatarColor: "#0c5752", stars: 5 },
  { initials: "SR", avatarColor: "#7c3aed", stars: 5 },
  { initials: "YF", avatarColor: "#b45309", stars: 5 },
  { initials: "HA", avatarColor: "#be185d", stars: 5 },
  { initials: "AC", avatarColor: "#0f766e", stars: 5 },
  { initials: "NB", avatarColor: "#6d28d9", stars: 5 },
  { initials: "OT", avatarColor: "#b91c1c", stars: 4 },
] as const;

const PRICING_AMOUNTS = {
  essentiel: { monthly: 1000, yearly: 8000, popular: false },
  pro: { monthly: 2000, yearly: 16000, popular: true },
  reseau: { monthly: null, yearly: null, popular: false },
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestio CRM pour Centres Spécialisés au Maroc | Quittez Excel" },
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

function usePreviewTopNav() {
  const { t } = useLandingI18n();
  const labels = [
    t.previewNav.dashboard,
    t.previewNav.appointments,
    t.previewNav.records,
    t.previewNav.payments,
  ];
  return PREVIEW_TOP_NAV_IDS.map((id, i) => ({
    id,
    label: labels[i],
    icon: PREVIEW_NAV_ICONS[id],
  }));
}

function usePreviewSecondaryNav() {
  const { t } = useLandingI18n();
  return PREVIEW_SECONDARY_NAV_IDS.map((id) => ({
    id,
    label: id === "affiches" ? t.previewNav.posters : t.previewNav.reports,
    icon: PREVIEW_NAV_ICONS[id],
  }));
}

function useTourSteps() {
  const { t } = useLandingI18n();
  const icons = [LayoutDashboard, Calendar, Users, CreditCard, BarChart3];
  return t.demo.steps.map((step, i) => ({
    page: DEMO_STEP_PAGES[i],
    icon: icons[i],
    ...step,
  }));
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function Header() {
  const { t } = useLandingI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navScroll = (id: string) => {
    scrollToId(id);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease }}
          className={cn(
            "border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ease-out",
            isScrolled
              ? "border-border/60 bg-background/90 shadow-sm"
              : "border-white/10 bg-[#0a0f0c] shadow-[0_1px_0_rgba(255,255,255,0.04)]",
          )}
        >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link
            to="/"
            className={cn(
              "flex min-w-0 shrink items-center gap-2 sm:gap-3 transition-colors hover:text-[#10b981]",
              isScrolled ? "text-foreground" : "text-[#f8f3e8]",
            )}
          >
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10",
                isScrolled ? "text-[#122620]" : "text-emerald-400",
              )}
            >
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
            <span className="truncate text-base font-bold tracking-tight sm:text-lg">Gestio</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex sm:gap-2 md:gap-3">
            <button
              onClick={() => scrollToId("demo")}
              className={cn(
                "px-2 py-2 text-sm font-medium transition md:px-4",
                isScrolled ? "text-foreground/70 hover:text-[#10b981]" : "text-white/90 hover:text-[#10b981]",
              )}
            >
              {t.nav.demo}
            </button>
            <button
              onClick={() => scrollToId("modules")}
              className={cn(
                "px-2 py-2 text-sm font-medium transition md:px-4",
                isScrolled ? "text-foreground/70 hover:text-[#10b981]" : "text-white/90 hover:text-[#10b981]",
              )}
            >
              {t.nav.modules}
            </button>
            <button
              onClick={() => scrollToId("tarifs")}
              className={cn(
                "px-2 py-2 text-sm font-medium transition md:px-4",
                isScrolled ? "text-foreground/70 hover:text-[#10b981]" : "text-white/90 hover:text-[#10b981]",
              )}
            >
              {t.nav.pricing}
            </button>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className={cn(
                "grid h-10 w-10 place-items-center border transition sm:hidden",
                isScrolled
                  ? "border-border/80 text-foreground/80 hover:bg-muted"
                  : "border-white/15 text-white/85 hover:bg-white/10",
              )}
              aria-expanded={menuOpen}
              aria-controls="landing-nav-sheet"
              aria-label={t.a11y.openMenu}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="landing-cta-primary inline-flex max-w-[11rem] items-center justify-center gap-1.5 rounded-none px-3 py-2.5 text-xs font-semibold transition sm:max-w-none sm:gap-2 sm:px-5 sm:text-sm"
            >
              <span className="truncate sm:whitespace-normal">{t.nav.bookDemo}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            </motion.button>
          </div>
        </div>
        </motion.div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" id="landing-nav-sheet" className="flex w-[min(100%,20rem)] flex-col sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle>{t.nav.navigation}</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1 border-t border-border pt-4" aria-label="Menu mobile">
            {[
              { label: t.nav.demoInteractive, id: "demo" },
              { label: t.nav.modules, id: "modules" },
              { label: t.nav.pricing, id: "tarifs" },
              { label: t.nav.faq, id: "faq" },
              { label: t.nav.contact, id: "contact" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navScroll(item.id)}
                className="rounded-md px-3 py-3 text-left text-base font-medium text-foreground transition hover:bg-muted hover:text-[#10b981]"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-border pt-4">
            <button
              type="button"
              onClick={() => { scrollToId("contact"); setMenuOpen(false); }}
              className="landing-cta-primary flex w-full items-center justify-center gap-2 rounded-none px-4 py-3.5 text-sm font-black transition"
            >
              {t.nav.bookDemo20}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─────────────────────────────────────────────
// Hero miniature dashboard
// ─────────────────────────────────────────────
function HeroDashboardPreview() {
  const { t } = useLandingI18n();
  const previewTopNav = usePreviewTopNav();
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState<DashboardMiniaturePageId>("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const showLocked = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4000);
  };

  const previewBtn = "inline-flex items-center justify-center gap-0.5 border border-border bg-card px-1.5 py-0.5 text-[9px] font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98] sm:text-[10px]";

  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-500/10 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.25 }}
        className="relative min-w-0 overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl ring-1 ring-black/[0.06]"
      >
        <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="ml-2 flex-1 truncate rounded border border-border bg-card px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
            {t.hero.previewUrl}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t.hero.live}
          </span>
        </div>

        <div className="flex flex-col bg-muted text-[10px] text-foreground">
          <div className="shrink-0 border-b border-border bg-card px-2.5 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-tight text-foreground sm:text-xs">Gestio</p>
                <p className="text-[8px] uppercase tracking-widest text-muted-foreground sm:text-[9px]">{t.hero.specializedCenter}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="grid h-5 w-5 place-items-center bg-primary text-[8px] font-bold text-primary-foreground sm:h-6 sm:w-6 sm:text-[9px]">A</div>
                <button
                  type="button"
                  className="grid h-5 w-5 place-items-center rounded border border-border text-muted-foreground transition hover:bg-muted sm:h-6 sm:w-6"
                  onClick={() => showLocked(t.hero.loginToAccess)}
                >
                  <LogOut className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </div>
            </div>
            <nav className="mt-2 flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {previewTopNav.map((n) => {
                const Icon = n.icon;
                const active = page === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setPage(n.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-1 border px-1.5 py-1 transition",
                      active
                        ? "border-border bg-muted font-semibold text-foreground shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <Icon className="h-2.5 w-2.5 opacity-70" />
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <main className="relative flex h-[240px] flex-col overflow-hidden bg-background sm:h-[300px]">
            <AnimatePresence mode="wait">
              {notice && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute left-2 right-2 top-2 z-20 flex justify-center"
                >
                  <p className="max-w-xs rounded-full border border-foreground/15 bg-background/95 px-3 py-1.5 text-center text-[10px] text-muted-foreground shadow-md backdrop-blur-sm">
                    {notice}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 text-foreground">
               <HeroPreviewPageBody page={page} previewBtn={previewBtn} showLocked={showLocked} />
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// S1 Hero - REDESIGNED DARK
// ─────────────────────────────────────────────
function Hero() {
  const { t } = useLandingI18n();
  const reduceMotion = useReducedMotion();
  const trustItems = [
    { icon: Lock, text: t.hero.trustServers },
    { icon: BadgeDollarSign, text: t.hero.trust48h },
    { icon: Check, text: t.hero.trustNoCommit },
  ];
  return (
    <section className="relative overflow-hidden bg-[#0a0f0c] py-12 lg:py-20">
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(52,211,153,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(214,173,96,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Floating Blobs */}
        <motion.div 
          animate={!reduceMotion ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" 
        />
        <motion.div 
          animate={!reduceMotion ? { scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] } : {}}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" 
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Copy Area */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              {t.hero.badge}
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-8 text-balance text-5xl font-black leading-[1.1] tracking-tight text-[#f8f3e8] sm:text-6xl lg:text-7xl">
              {t.hero.titleLine1} <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">{t.hero.titleHighlight}</span>, <br />
              {t.hero.titleLine2}
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-relaxed text-white sm:text-xl">
              {t.hero.subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-[#122620] bg-emerald-900 grid place-items-center text-[10px] font-bold text-emerald-100 shadow-xl">
                       {["FB", "KM", "SR", "AM"][i-1]}
                    </div>
                  ))}
               </div>
               <div className="text-sm">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-1 text-white">{t.hero.socialProof}</p>
               </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToId("contact")}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-md font-black text-white transition-all hover:bg-emerald-400"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToId("demo")}
                className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white px-8 py-4 text-sm font-bold text-[#0a0f0c] shadow-sm transition-colors hover:bg-neutral-100"
              >
                {t.hero.ctaSecondary}
                <MousePointerClick className="h-4 w-4" />
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              {trustItems.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs font-medium text-white">
                   <Icon className="h-3.5 w-3.5 text-emerald-500/70" />
                   {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual Area */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative lg:ml-12"
          >
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-transparent blur-sm" />
            <HeroDashboardPreview />
            
            {/* Promotional Badge */}
            <motion.div
              animate={!reduceMotion ? { y: [0, -10, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-500/30 bg-black/80 p-4 text-center shadow-2xl backdrop-blur-md"
            >
              <Gift className="h-6 w-6 text-amber-500 mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#d6ad60]">{t.hero.promoLabel}</p>
              <p className="text-xs font-bold text-white">{t.hero.promoText}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S2 Animated Feature Tour + Interactive Demo
// ─────────────────────────────────────────────
function DemoSection() {
  const { t } = useLandingI18n();
  const tourSteps = useTourSteps();
  const previewTopNav = usePreviewTopNav();
  const previewSecondaryNav = usePreviewSecondaryNav();
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
            gestio.ma · {currentStep.label.toLowerCase()}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary sm:px-2 sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="hidden sm:inline">{t.demo.liveDemo}</span>
            <span className="sm:hidden">{t.hero.live}</span>
          </span>
        </div>
        {/* App shell */}
        <div className="flex flex-col bg-muted">
          {/* Top nav */}
          <div className="border-b border-border bg-card px-3 py-2 sm:px-5 sm:py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground sm:text-base">Gestio</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-[11px]">{t.hero.specializedCenter}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex sm:text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground sm:h-6 sm:w-6 sm:text-[11px]">A</span>
                  {t.demo.adminRole}
                </div>
                <button
                  className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted sm:px-2 sm:py-1 sm:text-xs"
                  onClick={() => showLocked(t.hero.loginToAccessReal)}
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
    <section id="demo" className="relative overflow-hidden border-t border-border/60 bg-secondary/20 py-12 sm:py-16">
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
            {t.demo.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.demo.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground sm:text-xl">
            {t.demo.subtitle}
          </motion.p>
        </motion.div>

        {/* ─── DESKTOP LAYOUT (lg+) sidebar step list + annotation + dashboard ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="mt-10 hidden lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 lg:items-start"
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
                        {t.demo.moduleOf} {step + 1} / {tourSteps.length}
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
                        aria-label={`${t.a11y.module} ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={prevStep} aria-label={t.a11y.previous} className="flex h-8 w-8 items-center justify-center border border-background/30 text-background/70 transition hover:border-background hover:text-background">←</button>
                    <button onClick={nextStep} aria-label={t.a11y.next} className="flex h-8 w-8 items-center justify-center border border-background/30 bg-background/10 text-background/70 transition hover:border-background hover:bg-background/20 hover:text-background">→</button>
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
          className="mt-8 flex flex-col gap-4 lg:hidden"
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
                  <button onClick={prevStep} aria-label={t.a11y.previous} className="flex h-7 w-7 items-center justify-center border border-background/30 text-background/70 text-sm transition hover:border-background hover:text-background">←</button>
                  <button onClick={nextStep} aria-label={t.a11y.next} className="flex h-7 w-7 items-center justify-center border border-background/30 bg-background/10 text-background/70 text-sm transition hover:border-background hover:bg-background/20 hover:text-background">→</button>
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
          className="mt-8 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {t.demo.ctaText}
          </p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="landing-cta-primary inline-flex items-center gap-2 rounded-none px-8 py-4 text-md font-black transition"
          >
            {t.demo.ctaButton}
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
function PainPointsSection() {
  const { t } = useLandingI18n();
  const painPoints = t.pain.items.map((item, i) => ({
    ...item,
    icon: PAIN_ICONS[i],
    ...PAIN_ACCENT[i],
  }));

  return (
    <section className="relative py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-[#0c5752]/25 bg-[color-mix(in_srgb,#0c5752_6%,#f4ebd0)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0c5752]">
            {t.pain.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.pain.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.pain.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {painPoints.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 280 } }}
              className={cn("flex flex-col gap-4 border-t-4 border-2 border-foreground/10 p-6 transition-shadow hover:shadow-lg", p.accent, p.bg)}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center border-2 border-foreground/10 bg-white">
                  <p.icon className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
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
          className="mt-8 text-center"
        >
          <p className="text-base font-semibold text-foreground/60">
            {t.pain.solutionHint}
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
  const { t } = useLandingI18n();

  return (
    <section className="relative overflow-hidden border-y border-border bg-foreground py-14 text-background sm:py-20">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-background/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-background/[0.04] blur-3xl" />

      <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-background/20 bg-background/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            {t.solution.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {t.solution.title}{" "}
            <span style={{ color: "#34d399"}}>{t.solution.titleMuted}</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-background">
            {t.solution.subtitle}
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {t.solution.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-background text-foreground">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-background">{b}</span>
              </li>
            ))}
          </motion.ul>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="landing-cta-primary mt-10 inline-flex items-center gap-2 rounded-none px-7 py-4 text-md font-black transition"
          >
            {t.solution.cta}
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
          {t.solution.stats.map((stat) => (
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
function ModulesSection() {
  const { t } = useLandingI18n();
  const modules = t.modules.items.map((item, i) => ({
    ...item,
    icon: MODULE_ICONS[i],
  }));

  return (
    <section id="modules" className="relative py-14 sm:py-20">
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
            {t.modules.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.modules.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.modules.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-foreground/80 opacity-0 transition group-hover:opacity-100">
                {t.modules.seeInDemo}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("demo")}
            className="landing-cta-secondary-light inline-flex items-center gap-2 rounded-none border-2 px-8 py-4 text-sm font-black transition"
          >
            {t.modules.exploreAll}
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
type TestimonialItem = {
  initials: string;
  avatarColor: string;
  stars: number;
  name: string;
  role: string;
  center: string;
  city: string;
  date: string;
  highlight: string;
  quote: string;
};

function TestimonialCard({ item, dir }: { item: TestimonialItem; dir?: "ltr" | "rtl" }) {
  return (
    <div dir={dir} className="flex h-full min-w-0 flex-col gap-4 border-2 border-foreground/10 bg-card p-4 shadow-[var(--shadow-soft)] sm:p-6">
      {/* Stars + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("h-3.5 w-3.5", i < item.stars ? "fill-current" : "fill-none opacity-30")} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{item.date}</span>
      </div>
      {/* Highlight badge */}
      <span className="inline-flex w-fit items-center border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
        {item.highlight}
      </span>
      {/* Quote */}
      <blockquote className="flex-1 text-balance text-sm leading-relaxed text-foreground/75">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      {/* Author */}
      <div className="flex items-center gap-3 border-t border-foreground/8 pt-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ring-2 ring-foreground/10"
          style={{ backgroundColor: item.avatarColor }}
          aria-label={item.name}
        >
          {item.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{item.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{item.role} · {item.center}</p>
          <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {item.city}
          </p>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIAL_GAP_PX = 20;

function SocialProofSection() {
  const { t, dir } = useLandingI18n();
  const testimonials = t.testimonials.items.map((entry, i) => ({
    ...entry,
    ...TESTIMONIAL_AVATARS[i],
  }));
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
    <section className="relative overflow-hidden bg-secondary/30 py-14 sm:py-20">
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
            {t.testimonials.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.testimonials.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.testimonials.subtitle}
          </motion.p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mt-10 grid grid-cols-2 divide-x-2 divide-foreground/10 border-2 border-foreground/10 bg-card sm:grid-cols-4"
        >
          {t.testimonials.stats.map((s) => (
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
          <div ref={viewportRef} className="min-w-0 overflow-hidden" dir="ltr">
            <motion.div
              className="flex"
              style={{ gap: TESTIMONIAL_GAP_PX }}
              animate={{ x: stepPx > 0 ? -current * stepPx : 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 34 }}
            >
              {testimonials.map((entry) => (
                <div
                  key={entry.name}
                  className="shrink-0"
                  style={{ width: cardWidthPx > 0 ? `${cardWidthPx}px` : "min(100%, 22rem)" }}
                >
                  <TestimonialCard item={entry} dir={dir} />
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
                  aria-label={`${t.a11y.review} ${i + 1}`}
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
                aria-label={t.a11y.previous}
                className="flex h-10 w-10 items-center justify-center border-2 border-foreground/15 bg-card text-foreground/60 transition hover:border-foreground hover:text-foreground disabled:opacity-30"
              >
                ←
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                disabled={current >= maxIndex}
                aria-label={t.a11y.next}
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
          className="mt-8 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">{t.testimonials.ctaText}</p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="landing-cta-primary inline-flex items-center gap-2 rounded-none px-8 py-4 text-md font-black transition"
          >
            {t.testimonials.ctaButton}
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

function buildPricingPlans(t: ReturnType<typeof useLandingI18n>["t"]): Plan[] {
  return t.pricing.plans.map((plan) => {
    const amounts = PRICING_AMOUNTS[plan.id as keyof typeof PRICING_AMOUNTS];
    return {
      ...plan,
      monthly: amounts.monthly,
      yearly: amounts.yearly,
      popular: amounts.popular,
    };
  });
}

function PricingCard({ plan, idx, yearly }: { plan: Plan; idx: number; yearly: boolean }) {
  const { t, numberLocale } = useLandingI18n();

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
            <Star className="inline h-3 w-3 fill-current" /> {t.pricing.popular}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease, delay: 0.25 }}
            className="mt-2 inline-flex items-center gap-1.5 border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300"
          >
            <Gift className="h-3.5 w-3.5 shrink-0" /> {t.pricing.onboardingOffer}
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
              <div className="text-3xl font-black tracking-tight tabular-nums sm:text-4xl">{t.pricing.custom}</div>
            ) : (
              <>
                <div className="flex min-w-0 flex-wrap items-baseline gap-1">
                  <span className={cn("min-w-0 font-black tracking-tight tabular-nums", plan.popular ? "text-4xl sm:text-5xl lg:text-6xl" : "text-4xl sm:text-5xl lg:text-6xl")}>{yearly ? plan.yearly?.toLocaleString(numberLocale) : plan.monthly?.toLocaleString(numberLocale)}</span>
                  <span className={cn("ml-0 shrink-0 text-xs sm:ml-1 sm:text-sm", plan.popular ? "text-background/60" : "text-muted-foreground")}>{yearly ? t.pricing.perYear : t.pricing.perMonth}</span>
                </div>
                {yearly && (
                  <p className={cn("mt-2 text-xs", plan.popular ? "text-background/60" : "text-muted-foreground")}>
                    {t.pricing.yearlyEquiv}{" "}
                    <span className={cn("font-semibold", plan.popular ? "text-background" : "text-foreground")}>{Math.round(plan.yearly! / 10).toLocaleString(numberLocale)}{t.pricing.perMonthShort}</span> {t.pricing.yearlyEquivSuffix}
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
        className="landing-cta-primary mt-8 w-full rounded-none border-2 border-transparent py-4 text-sm font-black uppercase tracking-wider transition hover:brightness-110"
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  );
}

function PricingSection() {
  const { t } = useLandingI18n();
  const pricingPlans = buildPricingPlans(t);
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
    <section id="tarifs" className="relative overflow-hidden py-14 sm:py-20">
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
            {t.pricing.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.pricing.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.pricing.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-8 flex flex-col items-center gap-4"
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
              {t.pricing.monthly}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "flex min-h-[3rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 border-l-2 border-foreground px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors sm:flex-row sm:gap-2 sm:px-6 sm:py-3 sm:text-sm rounded-none",
                yearly ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-muted/50",
              )}
            >
              <span>{t.pricing.yearly}</span>
              <span
                className={cn(
                  "border px-1.5 py-0.5 text-[8px] font-black leading-none sm:text-[9px] rounded-none",
                  yearly ? "border-background/50 text-background" : "border-foreground/40 text-foreground",
                )}
              >
                {t.pricing.yearlyDiscount}
              </span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={yearly ? "y" : "m"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {yearly ? t.pricing.billingYearly : t.pricing.billingMonthly}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <div className="mt-10 w-full min-w-0 lg:hidden">
          <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-4">
              {pricingPlans.map((plan, idx) => (
                <CarouselItem key={plan.id} className="basis-[min(100%,22rem)] pl-3 sm:basis-[88%] sm:pl-4">
                  <PricingCard plan={plan} idx={idx} yearly={yearly} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label={t.a11y.choosePlan}>
            {pricingPlans.map((plan, i) => (
              <button
                key={plan.id}
                type="button"
                role="tab"
                aria-selected={carouselIndex === i}
                aria-label={`${plan.name}, ${t.pricing.planLabel} ${i + 1} ${t.pricing.of} ${pricingPlans.length}`}
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
          className="mt-10 hidden min-w-0 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid lg:grid-cols-3 lg:items-stretch"
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
          className="mt-8 grid gap-4 border-2 border-foreground/10 bg-card p-6 sm:grid-cols-3 sm:gap-6 sm:p-8"
        >
          {t.pricing.miniFaq.map(({ q, a }) => (
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
function FaqSection() {
  const { t } = useLandingI18n();

  return (
    <section id="faq" className="relative bg-secondary/30 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.faq.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.faq.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.faq.subtitle}
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mt-8 border-2 border-foreground/10 bg-card p-2 shadow-[var(--shadow-soft)]"
        >
          <Accordion type="multiple" className="w-full">
            {t.faq.items.map((item, i) => (
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
  const { t } = useLandingI18n();
  const [sent, setSent] = useState(false);
  const centerRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const centerName = centerRef.current?.value ?? "";
    track("form_submit");
    track("whatsapp_open", centerName || "unknown");
    const waText = encodeURIComponent(`${t.contact.form.waMessage} ${centerName || "mon centre"}`);
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
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="flex h-16 w-16 items-center justify-center" style={{ color: "#122620"}}>
              <Check className="h-8 w-8" />
            </motion.div>
            <h3 className="mt-6 text-2xl font-black">{t.contact.form.successTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.contact.form.successText}</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 transition hover:text-accent">
              {t.contact.form.retry}
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <div>
              <label htmlFor="wa-center" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.contact.form.centerLabel}</label>
              <input ref={centerRef} id="wa-center" type="text" placeholder={t.contact.form.centerPlaceholder} required aria-required="true" className="w-full border-2 border-foreground/10 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary" />
            </div>
            <div>
              <label htmlFor="wa-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.contact.form.phoneLabel}</label>
              <input ref={phoneRef} id="wa-phone" type="tel" placeholder={t.contact.form.phonePlaceholder} required aria-required="true" className="w-full border-2 border-foreground/10 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary" />
            </div>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="group relative mt-1 inline-flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-none px-6 py-3.5 text-sm font-bold shadow-[var(--shadow-elegant)] transition sm:py-4 landing-cta-primary"
            >
              {!reduceMotion && (
                <motion.span className="pointer-events-none absolute inset-0 z-0 bg-white/10" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
              )}
              <span className="relative z-[1]">{t.contact.form.submit}</span>
              <Send className="relative z-[1] h-4 w-4 transition group-hover:translate-x-0.5" />
            </motion.button>
            <p className="flex shrink-0 items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <Lock className="h-3.5 w-3.5 shrink-0" /> {t.contact.form.privacy}
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
  const { t } = useLandingI18n();
  const reduceMotion = useReducedMotion();
  return (
    <section id="contact" className="relative overflow-hidden py-14 pb-[max(4rem,calc(4rem+env(safe-area-inset-bottom)))] sm:py-20 sm:pb-[max(5rem,calc(5rem+env(safe-area-inset-bottom)))]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-1/4 h-80 w-80 bg-primary/15 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 bg-accent/20 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="mx-auto grid min-w-0 max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="min-w-0"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            {t.contact.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.contact.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.contact.subtitle}
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {(
              [
                { Icon: Phone, text: t.contact.phoneMorocco, href: "tel:+212777777428" },
                { Icon: Globe, text: t.contact.phoneUs, href: "tel:+16137069011" },
                { Icon: Mail, text: t.contact.email, href: "mailto:contact@eiden-group.com" },
                {
                  Icon: MapPin,
                  text: t.contact.address,
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
            {t.contact.bullets.map((item) => (
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
  const { t } = useLandingI18n();

  return (
    <footer className="border-t border-border/60 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-background/10">
                <GraduationCap className="h-5 w-5 text-background" />
              </div>
              <span className="text-lg font-black tracking-tight">Gestio</span>
            </div>
            <p className="mt-3 text-sm text-background leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-background">{t.footer.navigation}</p>
            <ul className="space-y-2 text-sm">
              {[
                { label: t.nav.demoInteractive, id: "demo" },
                { label: t.nav.modules, id: "modules" },
                { label: t.nav.pricing, id: "tarifs" },
                { label: t.nav.faq, id: "faq" },
                { label: t.nav.contact, id: "contact" },
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => scrollToId(item.id)} className="text-background transition hover:text-background">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-background">{t.footer.contact}</p>
            <ul className="space-y-2 text-sm text-background">
              <li>
                <a href={`mailto:${t.contact.email}`} className="transition hover:text-background">
                  {t.contact.email}
                </a>
              </li>
              <li className="text-balance">{t.contact.address}</li>
              <li><a href="tel:+212777777428" className="transition hover:text-background">{t.footer.phoneMorocco}</a></li>
              <li><a href="tel:+16137069011" className="transition hover:text-background">{t.footer.phoneUs}</a></li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="landing-cta-primary mt-6 inline-flex items-center gap-2 rounded-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition"
            >
              {t.footer.bookDemo}
              <ArrowRight className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-4 border-t border-background/10 pt-6 text-xs text-background/40 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center sm:text-left">{t.footer.copyright}</span>
          {/* <MotionLink to="/login" className="text-center text-background/30 transition hover:text-background/60 sm:text-right">
            Espace client
          </MotionLink> */}
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────
function LandingPage() {
  const { t, dir } = useLandingI18n();

  useEffect(() => {
    document.title = t.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.meta.description);
  }, [t.meta.title, t.meta.description]);

  return (
    <div dir={dir} className="landing-page min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
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
