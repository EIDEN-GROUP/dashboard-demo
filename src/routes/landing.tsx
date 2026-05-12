import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  LayoutDashboard,
  Layers,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/landing")({
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

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Scroll-triggered fade + rise (once). */
function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: show ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "motion-safe:transition-[opacity,transform,filter] motion-safe:duration-[850ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
        show
          ? "motion-safe:translate-y-0 motion-safe:opacity-100 motion-safe:blur-0"
          : "motion-safe:translate-y-10 motion-safe:opacity-0 motion-safe:blur-[2px]",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:blur-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md transition-[box-shadow,background-color,border-color] duration-500 ease-out",
        scrolled && "border-zinc-200 bg-white/95 shadow-[0_1px_0_0_rgb(24_24_27/0.04),0_12px_40px_-16px_rgb(24_24_27/0.12)]",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold tracking-[-0.02em] text-zinc-950 transition-transform duration-300 motion-safe:hover:translate-x-0.5 sm:text-[0.9375rem] md:text-base">
          lOGO
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center rounded-md border border-zinc-900 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition duration-200 hover:bg-zinc-800 active:scale-[0.98] motion-reduce:active:scale-100 sm:min-h-11 sm:px-4 sm:text-sm md:text-[0.9375rem]"
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <Reveal>
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 px-4 py-10 sm:flex-row sm:px-6 sm:py-12 lg:px-8">
          <p className="text-center text-xs leading-relaxed text-zinc-500 sm:text-left sm:text-sm md:text-[0.9375rem]">
            © 2026 Démo ·{" "}
            <Link
              to="/landing"
              className="text-zinc-800 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-600"
            >
              Plateforme
            </Link>
          </p>
          <Link
            to="/login"
            className="text-center text-xs font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition hover:decoration-zinc-900 sm:text-left sm:text-sm md:text-[0.9375rem]"
          >
            Accéder au tableau de bord
          </Link>
        </div>
      </Reveal>
    </footer>
  );
}

function LandingPage() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";
    return () => {
      root.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 antialiased">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <InfoSection />
        <FaqSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}

function HeroStagger({
  children,
  delayMs,
  className,
}: {
  children: ReactNode;
  delayMs: number;
  className?: string;
}) {
  const [run, setRun] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setRun(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        className,
        "motion-reduce:opacity-100 motion-reduce:transform-none",
        run && "motion-safe:animate-landing-rise",
        !run && "motion-safe:opacity-0",
      )}
      style={{ animationDelay: run ? `${delayMs}ms` : undefined }}
    >
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:landing-hero-grid-shift"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(212 212 216) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(212 212 216) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] motion-safe:transition-opacity motion-safe:duration-1000"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(228 228 231) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(228 228 231) 1px, transparent 1px)`,
          backgroundSize: "9px 9px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/90"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <HeroStagger delayMs={0} className="will-change-[opacity,transform]">
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className="h-px w-6 origin-left bg-zinc-400 motion-safe:animate-[landing-rise_0.6s_ease-out_0.05s_both] sm:w-8"
                  aria-hidden
                />
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px] sm:tracking-[0.22em]">
                  Plateforme tout-en-un
                </span>
              </div>
            </HeroStagger>
            <HeroStagger delayMs={90} className="will-change-[opacity,transform]">
              <h1 className="mt-6 max-w-[20ch] font-display text-[clamp(1.75rem,1.1rem+3.2vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:mt-8 sm:max-w-[22ch] md:max-w-none">
                Pilotez votre établissement avec clarté et sérénité.
              </h1>
            </HeroStagger>
            <HeroStagger delayMs={180} className="will-change-[opacity,transform]">
              <p className="mt-6 max-w-lg text-[0.9375rem] leading-relaxed text-zinc-600 sm:mt-8 sm:text-base md:text-[1.0625rem]">
                Plateforme regroupe planning, élèves, familles et indicateurs dans un seul espace conçu pour les équipes
                éducatives et les directions.
              </p>
            </HeroStagger>
            <HeroStagger delayMs={260} className="will-change-[opacity,transform]">
              <div className="mt-10 flex flex-wrap items-center gap-2.5 sm:mt-12 sm:gap-3">
                <Link
                  to="/login"
                  className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-zinc-950 px-4 py-2.5 text-xs font-medium text-white transition duration-200 hover:bg-zinc-800 active:scale-[0.98] motion-reduce:active:scale-100 sm:px-6 sm:text-sm md:text-[0.9375rem]"
                >
                  Connexion au tableau de bord
                  <LayoutDashboard className="h-3.5 w-3.5 opacity-90 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
                </Link>
                <button
                  type="button"
                  onClick={scrollToContact}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-300 bg-white/90 px-4 py-2.5 text-xs font-medium text-zinc-900 backdrop-blur-[2px] transition duration-200 hover:border-zinc-400 hover:bg-white active:scale-[0.98] motion-reduce:active:scale-100 sm:px-6 sm:text-sm md:text-[0.9375rem]"
                >
                  Obtenir une démo
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
                </button>
              </div>
            </HeroStagger>
            <HeroStagger delayMs={340} className="will-change-[opacity,transform]">
              <p className="mt-8 max-w-md text-[11px] leading-relaxed text-zinc-400 sm:mt-10 sm:text-xs md:text-[0.8125rem]">
                Démo interactive après connexion, choisissez l&apos;espace administration ou CRM.
              </p>
            </HeroStagger>
          </div>

          <HeroStagger delayMs={200} className="relative mx-auto w-full max-w-xl will-change-[opacity,transform] lg:mx-0 lg:max-w-none">
            <div className="motion-safe:animate-landing-float-soft rounded-xl border border-zinc-300/80 bg-zinc-100 p-2 shadow-[0_32px_64px_-12px_rgba(24,24,27,0.25),0_0_0_1px_rgba(24,24,27,0.06)] transition-shadow duration-500 hover:shadow-[0_40px_80px_-16px_rgba(24,24,27,0.28)]">
              <img
                src="/landing-crm-hero.png"
                alt="Aperçu du tableau de bord CRM : indicateurs, courbe d'évolution, pipeline et liste des prospects (illustration)"
                width={1120}
                height={700}
                className="block w-full rounded-lg bg-white motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:hover:scale-[1.01]"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-500 sm:text-[11px] md:text-xs lg:text-right">
              Interface CRM — vue famille et pipeline (illustration)
            </p>
          </HeroStagger>
        </div>
      </div>
    </section>
  );
}

function InfoSection() {
  const items = [
    {
      icon: LayoutDashboard,
      title: "Vue d'ensemble",
      text: "Tableaux de bord pour suivre présences, messages et priorités du jour en un coup d'œil.",
    },
    {
      icon: Shield,
      title: "Données protégées",
      text: "Accès par rôle, traçabilité des actions et bonnes pratiques pour les informations élèves et familles.",
    },
    {
      icon: BarChart3,
      title: "Pilotage",
      text: "Indicateurs et rapports pour anticiper la rentrée et ajuster votre organisation.",
    },
    {
      icon: Layers,
      title: "Expérience soignée",
      text: "Interface claire pour les équipes, moins de friction au quotidien.",
    },
  ];
  return (
    <section className="border-b border-zinc-100 bg-zinc-50 py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px] sm:tracking-[0.22em]">
              Pourquoi Plateforme
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,1rem+2.4vw,2.75rem)] font-medium tracking-[-0.03em] text-zinc-950 sm:mt-4">
              Une base solide pour votre équipe.
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-zinc-600 sm:mt-5 sm:text-base md:text-[1.0625rem]">
              Moins d&apos;outils éparpillés, plus de temps pour l&apos;accompagnement pédagogique et la relation avec les
              familles.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:mt-14 md:mt-16 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.title} delayMs={i * 70}>
              <article className="group h-full rounded-lg border border-zinc-200/80 bg-white p-6 transition duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_1px_0_0_rgb(24_24_27_/_0.04),0_16px_40px_-8px_rgb(24_24_27_/_0.1)] motion-reduce:hover:translate-y-0 sm:p-8">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 transition duration-300 group-hover:border-zinc-300 group-hover:bg-white sm:mb-6 sm:h-10 sm:w-10">
                  <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-105 sm:h-5 sm:w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-zinc-950 sm:text-lg">{item.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 sm:mt-3 sm:text-sm md:text-[0.9375rem]">
                  {item.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqItems: { q: string; a: string }[] = [
  {
    q: "Qu'est-ce que Plateforme exactement ?",
    a: "Plateforme est une démo de plateforme de gestion pour établissements : espaces administration et CRM, avec des écrans illustratifs pour structurer votre quotidien.",
  },
  {
    q: "Comment accéder au tableau de bord ?",
    a: "Cliquez sur « Connexion au tableau de bord », saisissez vos identifiants de démo, puis choisissez l'espace qui correspond à votre rôle.",
  },
  {
    q: "La démo est-elle gratuite ?",
    a: "Oui, cet environnement est une vitrine technique : vous pouvez explorer les parcours sans engagement.",
  },
  {
    q: "Puis-je demander une présentation personnalisée ?",
    a: "Utilisez le formulaire en bas de page : nous revenons vers vous pour planifier un échange et répondre à vos questions.",
  },
];

function FaqSection() {
  return (
    <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px] sm:tracking-[0.22em]">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.45rem,0.85rem+2.5vw,2.5rem)] font-medium tracking-[-0.03em] text-zinc-950 sm:mt-4">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-zinc-600 sm:mt-5 sm:text-base md:text-[1.0625rem]">
            Ce qu&apos;il faut savoir avant de tester la démo ou de nous écrire.
          </p>
        </Reveal>
        <Reveal delayMs={120} className="mt-10 sm:mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-zinc-200">
                <AccordionTrigger className="py-4 text-left text-sm font-medium leading-snug text-zinc-950 transition-colors duration-200 hover:text-zinc-700 hover:no-underline sm:py-5 sm:text-[0.9375rem] md:text-base [&[data-state=open]]:text-zinc-950">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs leading-relaxed text-zinc-600 sm:pb-5 sm:text-sm md:text-[0.9375rem]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-zinc-200 bg-zinc-950 py-16 text-white sm:py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:gap-14 sm:px-6 md:gap-16 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px] sm:tracking-[0.22em]">
              Contact
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,1rem+2.4vw,2.5rem)] font-medium tracking-[-0.03em] text-white sm:mt-4">
              Demandez votre démo.
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-zinc-400 sm:mt-5 sm:text-base md:text-[1.0625rem]">
              Laissez vos coordonnées : nous vous proposons un créneau pour présenter Plateforme et répondre à vos besoins.
            </p>
            <ul className="mt-10 space-y-4 sm:mt-12 sm:space-y-5">
              {[
                { i: Phone, t: "00 00 00 00 00" },
                { i: Mail, t: "hello@mail.demo" },
                { i: MapPin, t: "12 rue Somewhere ,Localisation" },
              ].map((row, idx) => (
                <li
                  key={row.t}
                  className="flex items-center gap-3 text-xs text-zinc-300 motion-safe:transition-transform motion-safe:duration-300 sm:gap-4 sm:text-sm md:text-[0.9375rem] motion-safe:hover:translate-x-1"
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 transition-colors duration-300 hover:border-zinc-500">
                    <row.i className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  {row.t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delayMs={100}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-shadow duration-500 hover:border-zinc-700 hover:shadow-[0_24px_48px_-20px_rgb(0_0_0/0.45)] sm:p-8 lg:p-10"
          >
            {sent ? (
                <div key="thanks" className="motion-safe:animate-landing-rise py-6 text-center sm:py-8">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-zinc-600 bg-white text-zinc-950 sm:h-14 sm:w-14">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium tracking-tight text-white sm:mt-6 sm:text-2xl">
                    Merci !
                  </h3>
                  <p className="mt-2 text-xs text-zinc-400 sm:text-sm md:text-[0.9375rem]">
                    Nous vous recontactons sous 24h ouvrées.
                  </p>
                  <button
                    type="button"
                    className="mt-6 text-xs font-medium text-white underline decoration-zinc-600 underline-offset-4 transition hover:decoration-white sm:mt-8 sm:text-sm"
                    onClick={() => setSent(false)}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <div key="form" className="motion-safe:animate-landing-rise">
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-[11px] sm:tracking-[0.18em]">
                        Nom / Établissement
                      </label>
                      <input
                        required
                        className="mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-600 outline-none transition duration-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 sm:mt-2 sm:px-4 sm:py-3 sm:text-sm md:text-[0.9375rem]"
                        placeholder="Lycée · Direction · Responsable"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-[11px] sm:tracking-[0.18em]">
                        Email professionnel
                      </label>
                      <input
                        required
                        type="email"
                        className="mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-600 outline-none transition duration-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 sm:mt-2 sm:px-4 sm:py-3 sm:text-sm md:text-[0.9375rem]"
                        placeholder="vous@etablissement.ma"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-[11px] sm:tracking-[0.18em]">
                        Téléphone
                      </label>
                      <input
                        className="mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-600 outline-none transition duration-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 sm:mt-2 sm:px-4 sm:py-3 sm:text-sm md:text-[0.9375rem]"
                        placeholder="+212 …"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-[11px] sm:tracking-[0.18em]">
                        Votre besoin
                      </label>
                      <textarea
                        rows={4}
                        className="mt-1.5 w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-600 outline-none transition duration-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 sm:mt-2 sm:px-4 sm:py-3 sm:text-sm md:text-[0.9375rem]"
                        placeholder="Taille de l'établissement, modules souhaités, délai…"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-6 w-full rounded-md bg-white py-3 text-xs font-medium text-zinc-950 transition duration-200 hover:bg-zinc-100 active:scale-[0.99] motion-reduce:active:scale-100 sm:mt-8 sm:py-3.5 sm:text-sm md:text-[0.9375rem]"
                  >
                    Envoyer ma demande de démo
                  </button>
                </div>
              )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
