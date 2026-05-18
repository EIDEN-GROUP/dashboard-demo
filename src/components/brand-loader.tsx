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
        "flex flex-col items-center justify-center gap-3",
        fullScreen ? "min-h-svh w-full bg-zinc-950" : "bg-transparent",
        compact ? "min-h-0 w-auto py-0" : !fullScreen && "min-h-[min(60vh,28rem)] w-full py-16",
        className,
      )}
    >
      <img
        src={MARK_SRC}
        alt=""
        width={markPx}
        height={markPx}
        className="shrink-0 motion-safe:animate-brand-mark-pulse"
        style={{ width: markPx, height: markPx }}
        decoding="async"
      />
      <span className="sr-only">Chargement</span>
    </div>
  );
}
