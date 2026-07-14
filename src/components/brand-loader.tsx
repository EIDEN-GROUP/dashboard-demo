import { cn } from "@/lib/utils";

const MARK_SRC = "/favicon.png";

type BrandLoaderProps = {
  /** Full viewport (e.g. route pending). Default: compact block. */
  fullScreen?: boolean;
  /** Minimal padding / no tall min-height (e.g. floating overlay). */
  compact?: boolean;
  className?: string;
};

export function BrandLoader({ fullScreen = false, compact = false, className }: BrandLoaderProps) {
  const markPx = fullScreen ? 160 : 128;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-5 motion-safe:animate-brand-fade-in",
        fullScreen ? "min-h-svh w-full bg-zinc-950" : "bg-transparent",
        compact ? "min-h-0 w-auto py-0" : !fullScreen && "min-h-[min(60vh,28rem)] w-full py-16",
        className,
      )}
    >
      <div className="relative grid place-items-center" style={{ width: markPx, height: markPx }}>
        {/* Halo diffus   respire en phase avec le logo */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#B5E18B]/25 blur-2xl motion-safe:animate-brand-halo"
        />
        <img
          src={MARK_SRC}
          alt=""
          width={markPx}
          height={markPx}
          className="relative shrink-0 will-change-transform motion-safe:animate-brand-mark-pulse"
          style={{ width: markPx, height: markPx }}
          decoding="async"
        />
      </div>

      {/* Barre indéterminée   glisse en continu sous le logo */}
      <span
        aria-hidden
        className={cn(
          "relative overflow-hidden rounded-full",
          fullScreen ? "h-1 w-40 bg-white/12" : "h-0.5 w-24 bg-[#28396C]/12",
        )}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-1/3 rounded-full motion-safe:animate-brand-progress",
            fullScreen ? "bg-[#B5E18B]" : "bg-[#6BA53A]",
          )}
        />
      </span>

      <span className="sr-only">Chargement</span>
    </div>
  );
}
