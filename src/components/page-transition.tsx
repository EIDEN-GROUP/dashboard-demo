import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useLandingI18nOptional } from "@/lib/landing-i18n";

/**
 * Left-to-right reading order of the app. A move *down* this list reads as going
 * forward (curtain enters from the end side), a move *up* as going back.
 * Keep in step with the dashboard nav in `useDashboardNav`.
 */
const ROUTE_ORDER = [
  "/",
  "/login",
  "/dashboard",
  "/dashboard/calendar",
  "/dashboard/familles",
  "/dashboard/paiements",
  "/dashboard/affiches",
  "/dashboard/rapports",
  "/dashboard/planifications",
  "/dashboard/settings",
];

/** Rank a pathname by its longest matching entry, so nested routes inherit their parent's slot. */
function rank(pathname: string): number {
  let best = -1;
  let bestLen = -1;
  ROUTE_ORDER.forEach((route, i) => {
    const isMatch = pathname === route || pathname.startsWith(route === "/" ? "/" : `${route}/`);
    if (isMatch && route.length > bestLen) {
      best = i;
      bestLen = route.length;
    }
  });
  return best;
}

/** Human label for the page being opened, shown on the curtain. */
const ROUTE_LABELS: Record<string, string> = {
  "/": "Accueil",
  "/login": "Connexion",
  "/dashboard": "Tableau de bord",
  "/dashboard/calendar": "Calendrier",
  "/dashboard/familles": "Parents",
  "/dashboard/paiements": "Paiements",
  "/dashboard/affiches": "Affiches",
  "/dashboard/rapports": "Rapports",
  "/dashboard/planifications": "Planifications",
  "/dashboard/settings": "Paramètres",
};

function labelFor(pathname: string): string {
  let best = "";
  let bestLen = -1;
  for (const route of Object.keys(ROUTE_LABELS)) {
    const isMatch = pathname === route || pathname.startsWith(route === "/" ? "/" : `${route}/`);
    if (isMatch && route.length > bestLen) {
      best = ROUTE_LABELS[route];
      bestLen = route.length;
    }
  }
  return best || "Chargement";
}

/** Keep the curtain on screen long enough to read as a transition, not a flicker. */
const MIN_VISIBLE_MS = 520;

export function PageTransition() {
  const { busy, toPath, fromPath } = useRouterState({
    select: (s) => ({
      busy: s.isLoading || s.status === "pending" || s.isTransitioning,
      toPath: s.location.pathname,
      // While a navigation is pending this still points at the page on screen.
      fromPath: s.resolvedLocation?.pathname ?? s.location.pathname,
    }),
  });

  const reduceMotion = useReducedMotion();
  const i18n = useLandingI18nOptional();
  const rtl = i18n?.dir === "rtl";

  const [visible, setVisible] = useState(false);
  // Both frozen when the curtain appears, so they do not flip mid-animation as the route commits.
  const [dir, setDir] = useState(1);
  const [label, setLabel] = useState("");
  const shownAt = useRef(0);

  useEffect(() => {
    if (busy) {
      if (!visible) {
        const delta = rank(toPath) - rank(fromPath);
        // Unknown routes (rank -1) or same-slot moves default to travelling forward.
        const forward = delta === 0 ? 1 : Math.sign(delta);
        setDir(rtl ? -forward : forward);
        setLabel(labelFor(toPath));
        shownAt.current = Date.now();
        setVisible(true);
      }
      return;
    }
    if (!visible) return;
    const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt.current);
    const t = setTimeout(() => setVisible(false), Math.max(0, remaining));
    return () => clearTimeout(t);
  }, [busy, visible, toPath, fromPath, rtl]);

  // The curtain sweeps through: it enters from the side you are heading toward and
  // leaves by the opposite edge, so the motion carries the direction of travel.
  // easeOutExpo-ish in, easeInOut out   glides to a stop instead of snapping.
  const variants = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { x: `${dir * 100}%` },
        animate: {
          x: "0%",
          transition: { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.62 },
        },
        exit: {
          x: `${-dir * 100}%`,
          transition: { type: "tween" as const, ease: [0.7, 0, 0.28, 1] as const, duration: 0.55 },
        },
      };

  // Contents drift in slightly behind the curtain, so the panel doesn't arrive as one flat block.
  const content = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { delay: 0.14, duration: 0.4, ease: "easeOut" as const },
        },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      };

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key="page-transition"
          role="status"
          aria-live="polite"
          aria-busy="true"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={reduceMotion ? { duration: 0.25 } : undefined}
          className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden bg-[#28396C]"
        >
          {/* Brass glow, echoing the brand mark in the header. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -end-24 h-80 w-80 rounded-full bg-[#B5E18B]/20 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-32 -start-24 h-80 w-80 rounded-full bg-[#6BA53A]/15 blur-3xl"
          />

          <motion.div
            {...content}
            className="relative flex flex-col items-center gap-4 px-6 text-center"
          >
            {/* Brand sticker: the same graduation mark as the header, on a soft tile. */}
            <div className="grid shrink-0 place-items-center rounded-2xl">
                <img src="/edu-logo.png" alt="Edu logo" className="h-30 w-30" style={{ filter: "brightness(100)" }}/>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B5E18B]/80">
                Chargement
              </p>
              <p className="font-display text-2xl tracking-tight text-white">{label}</p>
            </div>

            <span
              aria-hidden
              className="relative h-1 w-32 overflow-hidden rounded-full bg-white/15"
            >
              <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[#B5E18B] motion-safe:animate-brand-progress" />
            </span>
          </motion.div>

          <span className="sr-only">Chargement de la page {label}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
