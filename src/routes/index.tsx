import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CreditCard,
  GraduationCap,
  Images,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HeroPreviewPageBody } from "@/components/hero-preview-page-body";
import type { DashboardMiniaturePageId } from "@/lib/dashboard-mirror-data";

const MotionLink = motion.create(Link);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plateforme pour établissements éducatifs" },
      {
        name: "description",
        content:
          "Centralisez classes, familles et suivi pédagogique. Demandez une démo ou connectez-vous à votre espace.",
      },
    ],
  }),
  component: LandingPage,
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const previewTopNav: { id: DashboardMiniaturePageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "familles", label: "Parents", icon: Users },
  { id: "paiements", label: "Paiements", icon: CreditCard },
  { id: "rendez-vous", label: "Rendez-vous", icon: Calendar }
];

const previewSecondaryNav: { id: DashboardMiniaturePageId; label: string; icon: LucideIcon }[] = [
  { id: "affiches", label: "Affiches", icon: Images },
  { id: "rapports", label: "Rapports", icon: BarChart3 },
];

function HeroDashboardPreview() {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState<DashboardMiniaturePageId>("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const showLocked = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4500);
  };

  const previewBtn =
    "inline-flex items-center justify-center gap-0.5 border border-zinc-300 bg-white px-1 py-0.5 text-[7px] font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 active:scale-[0.98] sm:text-[8px]";

  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md space-y-1">
          <p className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Découvrez votre futur tableau de bord
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Une vitrine interactive : naviguez entre les modules comme dans l&apos;app réelle, puis passez en démo complète en un clic.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-background shadow-sm">
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
            Aperçu
          </span>
          <span className="rounded-full border border-dashed border-foreground/35 bg-muted/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Maquette
          </span>
          <span className="rounded-full border border-foreground/20 bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/80">
            Données fictives
          </span>
          <MotionLink
            to="/login"
            className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition hover:bg-foreground hover:text-background"
          >
            Tester en réel
            <ArrowRight className="h-3 w-3" />
          </MotionLink>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.55, ease }}
        className="relative overflow-hidden rounded-xl border-2 border-foreground/12 bg-gradient-to-b from-background via-muted/25 to-muted/50 p-1 shadow-[var(--shadow-elegant)] ring-1 ring-foreground/[0.06]"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-gradient-to-bl from-foreground/[0.08] to-transparent" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-32 w-2/3 max-w-sm rounded-full bg-foreground/[0.04] blur-2xl" />

        <div className="relative overflow-hidden rounded-[calc(0.75rem-2px)] border border-foreground/10 bg-white/90 text-[7px] leading-tight shadow-inner backdrop-blur-sm sm:text-[8px]">
          <div className="flex items-center gap-1.5 border-b border-zinc-200/90 bg-white/95 px-2 py-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="ml-1 truncate font-mono text-[8px] text-zinc-500 sm:text-[9px]">crm.plateforme · vitrine</span>
          </div>

          <div className="flex flex-col bg-zinc-50/80">
            <div className="shrink-0 border-b border-zinc-200 bg-white px-2 py-1.5 sm:px-2.5 sm:py-2">
              <div className="flex flex-wrap items-start justify-between gap-1">
                <div className="min-w-0">
                  <p className="truncate font-display text-[10px] font-semibold tracking-tight text-zinc-900 sm:text-[11px]">Plateforme</p>
                  <p className="text-[6px] uppercase tracking-widest text-zinc-500 sm:text-[7px]">Tableau de bord</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <div className="hidden text-right sm:block">
                    <p className="text-[7px] font-medium text-zinc-900">Admin</p>
                    <p className="text-[6px] text-zinc-500">CRM</p>
                  </div>
                  <div className="grid h-5 w-5 place-items-center border border-zinc-200 bg-zinc-900 text-[7px] font-bold text-white">A</div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    className="grid h-5 w-5 place-items-center border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    aria-label="Sortir (aperçu)"
                    onClick={() =>
                      showLocked("Déconnexion : connectez-vous pour utiliser le vrai compte et cette action.")
                    }
                  >
                    <LogOut className="h-2.5 w-2.5" strokeWidth={2} />
                  </motion.button>
                </div>
              </div>

              <nav className="mt-1.5 flex flex-nowrap gap-0.5 overflow-x-auto border-t border-zinc-100 pt-1 scroll-touch" aria-label="Navigation principale (aperçu)">
                {previewTopNav.map((n) => {
                  const Icon = n.icon;
                  const active = page === n.id;
                  return (
                    <motion.button
                      key={n.id}
                      type="button"
                      layout
                      onClick={() => setPage(n.id)}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                      className={cn(
                        "flex shrink-0 items-center justify-center gap-0.5 border px-1 py-1 sm:px-1.5",
                        active
                          ? "border-zinc-300 bg-zinc-100 font-semibold text-zinc-900 shadow-sm"
                          : "border-transparent text-zinc-600 hover:bg-zinc-50",
                      )}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0 opacity-80" />
                      <span className="whitespace-nowrap">{n.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              <div className="mt-1 flex flex-wrap gap-0.5 border-t border-zinc-200 bg-zinc-50 px-1 py-1" aria-label="Navigation secondaire (aperçu)">
                {previewSecondaryNav.map((n) => {
                  const Icon = n.icon;
                  const active = page === n.id;
                  return (
                    <motion.button
                      key={n.id}
                      type="button"
                      layout
                      onClick={() => setPage(n.id)}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                      className={cn(
                        "flex items-center gap-0.5 border px-1 py-0.5 font-medium",
                        active ? "border-zinc-300 bg-white text-zinc-900 shadow-sm" : "border-transparent text-zinc-600 hover:bg-white/80",
                      )}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0 opacity-80" />
                      {n.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <main className="relative h-[232px] shrink-0 overflow-hidden bg-zinc-100 sm:h-[248px]">
              <AnimatePresence initial={false} mode="wait">
                {notice ? (
                  <motion.div
                    key={notice}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: reduceMotion ? 0.1 : 0.28, ease }}
                    className="pointer-events-none absolute left-2 right-2 top-2 z-20 flex justify-center"
                  >
                    <p className="pointer-events-auto max-w-full rounded-full border border-foreground/15 bg-background/95 px-3 py-1.5 text-center text-[10px] leading-snug text-muted-foreground shadow-md backdrop-blur-sm">
                      {notice}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={page}
                  role="tabpanel"
                  aria-live="polite"
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
                  transition={panelTransition}
                  className="absolute inset-0 overflow-y-auto overscroll-contain p-2 sm:p-2.5"
                >
                  <HeroPreviewPageBody page={page} previewBtn={previewBtn} showLocked={showLocked} />
                </motion.div>
              </AnimatePresence>
            </main>

            <div className="shrink-0 border-t border-zinc-200 bg-white px-2 py-1 lg:hidden">
              <p className="text-center text-[6px] font-medium uppercase tracking-wider text-zinc-500">Navigation mobile</p>
              <div className="mt-0.5 grid grid-cols-5 gap-px">
                {previewTopNav.map((n) => {
                  const Icon = n.icon;
                  const active = page === n.id;
                  return (
                    <motion.button
                      key={n.id}
                      type="button"
                      onClick={() => setPage(n.id)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "flex flex-col items-center gap-px py-0.5 text-[5px] font-semibold leading-none",
                        active ? "text-zinc-900" : "text-zinc-500",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="max-w-full truncate px-px">{n.label.split(" ")[0]}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Header() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: -8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-10 w-10 items-center justify-center bg-[var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)]"
          >
            <GraduationCap className="h-5 w-5" />
          </motion.div>
          <span className="text-lg font-bold tracking-tight">Plateforme</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => scrollToId("tarifs")}
            className="hidden px-4 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground sm:inline-flex"
          >
            Tarifs
          </button>
          <button
            onClick={() => scrollToId("faq")}
            className="hidden px-4 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground sm:inline-flex"
          >
            FAQ
          </button>
          <MotionLink
            to="/login"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-[var(--shadow-soft)] transition hover:bg-primary"
          >
            Connexion
            <ArrowRight className="h-4 w-4" />
          </MotionLink>
        </nav>
      </div>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © 2026 Démo · <span className="font-semibold text-foreground">Plateforme</span>
        </p>
        <Link
          to="/login"
          className="text-sm font-medium text-primary transition hover:text-accent"
        >
          Accéder au tableau de bord →
        </Link>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <InfoSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative overflow-hidden">
      {/* Animated grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background">
        <div className="absolute inset-0 hero-mesh-grid hero-mesh-fade" />
        {!reduceMotion && (
          <>
            <motion.div
              className="absolute left-[10%] top-[20%] h-2 w-2 bg-foreground"
              animate={{ y: [0, 30, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-[15%] top-[35%] h-2 w-2 bg-foreground/60"
              animate={{ y: [0, -25, 0], opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute left-[40%] bottom-[15%] h-2 w-2 bg-foreground/40"
              animate={{ y: [0, 20, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </>
        )}
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-32 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col justify-center"
        >
          <motion.div variants={fadeUp} className="inline-flex w-fit items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {!reduceMotion && (
              <motion.span
                animate={{ rotate: [0, 20, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.span>
            )}
            Tout-en-un pour votre établissement
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Pilotez votre établissement avec{" "}
            <span className="text-shimmer">clarté</span>{" "}
            et sérénité.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            La plateforme regroupe planning, élèves, familles et indicateurs dans un espace conçu
            pour les équipes éducatives et les directions.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <MotionLink
              to="/login"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2 overflow-hidden bg-[var(--gradient-hero)] px-7 py-4 text-sm font-bold text-primary-foreground shadow-[var(--shadow-elegant)]"
            >
              {!reduceMotion && (
                <motion.span
                  className="absolute inset-0 -z-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <span className="relative">Connexion au tableau de bord</span>
              <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
            </MotionLink>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="inline-flex items-center gap-2 border-2 border-foreground/15 bg-background px-7 py-4 text-sm font-bold text-foreground transition hover:border-foreground/40"
            >
              Obtenir une démo
              <Send className="h-4 w-4" />
            </motion.button>
          </motion.div>

          <motion.button
            variants={fadeUp}
            onClick={() => scrollToId("tarifs")}
            className="mt-6 w-fit text-sm font-medium text-muted-foreground underline decoration-primary/30 underline-offset-4 transition hover:text-primary"
          >
            Voir les estimations tarifaires →
          </motion.button>

          <motion.p variants={fadeUp} className="mt-8 text-xs text-muted-foreground">
            Miniature du tableau de bord : explorez les onglets, puis connectez-vous pour la version complète et les données réelles.
          </motion.p>
        </motion.div>

        {/* Miniature dashboard preview (all CRM sections) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="relative flex w-full max-w-xl flex-col justify-center justify-self-end lg:max-w-none"
        >
          <HeroDashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

function InfoSection() {
  const items = [
    { icon: LayoutDashboard, title: "Vue d'ensemble", text: "Tableaux de bord pour suivre présences, messages et priorités du jour en un coup d'œil." },
    { icon: Shield, title: "Données protégées", text: "Accès par rôle, traçabilité des actions et bonnes pratiques pour les informations élèves et familles." },
    { icon: BarChart3, title: "Pilotage", text: "Indicateurs et rapports pour anticiper la rentrée et ajuster votre organisation." },
    { icon: Layers, title: "Expérience soignée", text: "Interface claire pour les équipes, moins de friction au quotidien." },
  ];
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const loop = [...items, ...items];

  return (
    <section className="relative overflow-hidden border-y border-border bg-foreground py-24 text-background sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-background/20 bg-background/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
              Pourquoi Plateforme
            </motion.div>
            <motion.h2 variants={fadeUp} className="mt-6 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Une base solide pour votre équipe.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-xl text-lg text-background/70">
              Moins d'outils éparpillés, plus de temps pour l'accompagnement pédagogique et la relation avec les familles.
            </motion.p>
          </motion.div>

          <div className="flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.title}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "h-12 w-12 border-2 transition flex items-center justify-center",
                  active === i ? "border-background bg-background text-foreground" : "border-background/30 text-background/60 hover:border-background/70",
                )}
                aria-label={it.title}
              >
                <it.icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Marquee carousel */}
        <div className="relative mt-14 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-foreground to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-foreground to-transparent" />
          <div className={cn("flex w-max gap-6", !reduceMotion && "animate-marquee")}>
            {loop.map((item, i) => (
              <div
                key={i}
                className="group relative flex h-72 w-[22rem] flex-shrink-0 flex-col justify-between overflow-hidden border-2 border-background/15 bg-background/[0.04] p-7 backdrop-blur-sm transition hover:border-background hover:bg-background hover:text-foreground"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-14 w-14 items-center justify-center border-2 border-background/40 transition group-hover:border-foreground/30 group-hover:bg-foreground group-hover:text-background">
                    <item.icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-xs opacity-50">0{(i % items.length) + 1}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-70">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

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
    blurb: "Jusqu'à ~200 élèves, une équipe administrative.",
    monthly: 89,
    yearly: 849,
    features: ["CRM familles & élèves", "Planning & rendez-vous", "Rapports de base", "Support par email"],
    cta: "Demander une démo",
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Établissements actifs : multi-sites et pilotage renforcé.",
    monthly: 159,
    yearly: 1529,
    features: ["Tout Essentiel", "Paiements & relances", "Communications avancées", "Exports & tableaux de bord", "Support prioritaire"],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    id: "etablissement",
    name: "Réseau & groupe",
    blurb: "Réseaux, groupes scolaires et besoins sur mesure.",
    monthly: null,
    yearly: null,
    features: ["SLA dédié", "Intégrations & API", "Formation des équipes", "Accompagnement à la conduite du changement"],
    cta: "Parler à un expert",
  },
];

function PricingSection() {
  const [yearly, setYearly] = useState(true);

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
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-1.5 text-xs font-black uppercase tracking-widest text-foreground">
            Estimation
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Des formules claires, adaptées à votre taille.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Montants indicatifs pour structurer votre budget — l'offre finale est toujours ajustée après un court diagnostic.
          </motion.p>
        </motion.div>

        {/* Sliding segmented pill toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="relative inline-flex items-center border-2 border-foreground bg-background p-1.5 shadow-[6px_6px_0_0_var(--foreground)]">
            <motion.div
              className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-foreground"
              animate={{ x: yearly ? "calc(100% + 0px)" : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => setYearly(false)}
              className={cn("relative z-10 px-7 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors", !yearly ? "text-background" : "text-foreground")}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn("relative z-10 flex items-center gap-2 px-7 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors", yearly ? "text-background" : "text-foreground")}
            >
              Annuel
              <span className={cn("border px-1.5 py-0.5 text-[9px] font-black", yearly ? "border-background/40 text-background" : "border-foreground/30 text-foreground")}>
                −2 MOIS
              </span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={yearly ? "y" : "m"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {yearly ? "Facturation annuelle · 2 mois offerts" : "Facturation mensuelle · sans engagement"}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-center"
        >
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              whileHover={{ y: plan.popular ? -12 : -6 }}
              transition={{ type: "spring", stiffness: 260 }}
              className={cn(
                "relative flex flex-col border-2 transition-shadow",
                plan.popular
                  ? "z-10 border-foreground bg-foreground p-9 text-background shadow-[12px_12px_0_0_var(--foreground)] lg:scale-105"
                  : "border-foreground/15 bg-background p-7 text-foreground shadow-[6px_6px_0_0_oklch(0_0_0/0.08)] hover:shadow-[8px_8px_0_0_var(--foreground)]",
              )}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  whileInView={{ scale: 1, rotate: -6 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="absolute -top-5 -right-4 border-2 border-foreground bg-background px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-foreground shadow-[4px_4px_0_0_var(--foreground)]"
                >
                  ★ Populaire
                </motion.div>
              )}
              <div className="flex items-center justify-between">
                <span className={cn("font-mono text-xs font-bold uppercase tracking-widest", plan.popular ? "text-background/60" : "text-muted-foreground")}>
                  0{idx + 1} / 03
                </span>
                <span className={cn("h-2 w-2", plan.popular ? "bg-background" : "bg-foreground")} />
              </div>
              <h3 className={cn("mt-4 text-3xl font-black", plan.popular && "text-4xl")}>{plan.name}</h3>
              <p className={cn("mt-2 text-sm", plan.popular ? "text-background/70" : "text-muted-foreground")}>{plan.blurb}</p>

              <div className={cn("my-6 h-px", plan.popular ? "bg-background/20" : "bg-foreground/15")} />

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
                      <div className="text-4xl font-black tracking-tight">Sur mesure</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("font-black tracking-tight", plan.popular ? "text-7xl" : "text-6xl")}>{yearly ? plan.yearly : plan.monthly}</span>
                          <span className={cn("text-2xl font-bold", plan.popular ? "text-background/60" : "text-muted-foreground")}>€</span>
                          <span className={cn("ml-1 text-sm", plan.popular ? "text-background/60" : "text-muted-foreground")}>{yearly ? "/ an HT" : "/ mois HT"}</span>
                        </div>
                        {yearly && (
                          <p className={cn("mt-2 text-xs", plan.popular ? "text-background/60" : "text-muted-foreground")}>
                            Soit environ{" "}
                            <span className={cn("font-semibold", plan.popular ? "text-background" : "text-foreground")}>
                              {Math.round((plan.yearly! / 12) * 10) / 10} € / mois
                            </span>{" "}
                            ramené sur 12 mois
                          </p>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, ease }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className={cn("mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center", plan.popular ? "bg-background text-foreground" : "bg-foreground text-background")}>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className={plan.popular ? "text-background/90" : "text-foreground/80"}>{f}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToId("contact")}
                className={cn(
                  "mt-8 w-full py-4 text-sm font-black uppercase tracking-wider transition",
                  plan.popular
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const faqItems: { q: string; a: string }[] = [
  { q: "Qu'est-ce que Plateforme exactement ?", a: "Plateforme est une démo de plateforme de gestion pour établissements : un espace CRM (familles, paiements, rendez-vous, rapports) avec des écrans illustratifs." },
  { q: "Comment accéder au tableau de bord ?", a: "Cliquez sur « Connexion au tableau de bord », saisissez vos identifiants de démo : vous accédez directement au CRM." },
  { q: "La démo est-elle gratuite ?", a: "Oui, cet environnement est une vitrine technique : vous pouvez explorer les parcours sans engagement." },
  { q: "Puis-je demander une présentation personnalisée ?", a: "Utilisez le formulaire en bas de page : nous revenons vers vous pour planifier un échange et répondre à vos questions." },
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
          <motion.h2 variants={fadeUp} className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Questions fréquentes
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Ce qu'il faut savoir avant de tester la démo ou de nous écrire.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mt-12 border-2 border-foreground/10 bg-card p-2 shadow-[var(--shadow-soft)]"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="px-4 py-5 text-left text-base font-bold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-1/4 h-80 w-80 bg-primary/15 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 bg-accent/20 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            Contact
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Demandez votre démo.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Laissez vos coordonnées : nous vous proposons un créneau pour présenter Plateforme et répondre à vos besoins.
          </motion.p>

          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {[
              { i: Phone, t: "00 00 00 00 00" },
              { i: Mail, t: "hello@mail.demo" },
              { i: MapPin, t: "12 rue Somewhere, Localisation" },
            ].map((row) => (
              <li key={row.t} className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center bg-[var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-soft)]">
                  <row.i className="h-5 w-5" />
                </span>
                <span className="text-base font-medium text-foreground">{row.t}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="border-2 border-foreground/10 bg-card p-6 shadow-[var(--shadow-elegant)] sm:p-8 lg:p-10"
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease }}
                className="flex flex-col items-center py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center bg-[var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)]"
                >
                  <Check className="h-8 w-8" />
                </motion.div>
                <h3 className="mt-6 text-2xl font-black">Merci !</h3>
                <p className="mt-2 text-sm text-muted-foreground">Nous vous recontactons sous 24h ouvrées.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 transition hover:text-accent"
                >
                  Envoyer un autre message
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {[
                  { l: "Nom / Établissement", t: "text", p: "École Saint-Exupéry" },
                  { l: "Email professionnel", t: "email", p: "vous@etablissement.ma" },
                  { l: "Téléphone", t: "tel", p: "+212 ..." },
                ].map((f) => (
                  <div key={f.l}>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.l}</label>
                    <input
                      type={f.t}
                      placeholder={f.p}
                      className="w-full border-2 border-foreground/10 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Votre besoin</label>
                  <textarea
                    rows={4}
                    placeholder="Présentez-nous brièvement votre établissement..."
                    className="w-full resize-none border-2 border-foreground/10 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 bg-[var(--gradient-hero)] py-4 text-sm font-black text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:brightness-110"
                >
                  Envoyer ma demande de démo
                  <Send className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
}
