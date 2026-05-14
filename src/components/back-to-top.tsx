import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_AFTER = 360;

export function BackToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const hiddenForRoute = pathname.startsWith("/dashboard");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    if (hiddenForRoute) {
      setVisible(false);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hiddenForRoute]);

  if (hiddenForRoute) return null;

  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Retour en haut de la page"
      className={cn(
        "fixed z-[60] grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-[var(--shadow-soft)] transition-[opacity,transform,visibility] duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  );
}
