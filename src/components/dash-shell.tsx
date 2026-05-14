import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LogOut, ArrowLeftRight } from "lucide-react";

export type NavItem = { to: string; label: string; icon: any };

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

/** Mobile bottom bar — active tab: top accent bar + weight; no background fill. */
function MobileBottomNav({
  topNav,
  pathname,
}: {
  topNav: NavItem[];
  pathname: string;
}) {
  const compact = topNav.length >= 4;
  const labelClass = compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-6px_24px_rgb(0_0_0/0.05)] lg:hidden" aria-label="Navigation principale">
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
                active ? "text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <span className="flex h-1 w-full shrink-0 items-center justify-center" aria-hidden>
                <span className={cn("h-0.5 w-6 shrink-0 rounded-full", active ? "bg-zinc-900" : "bg-transparent")} />
              </span>
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              <span className={cn( "w-full max-w-full truncate px-0.5 text-center font-semibold leading-tight", labelClass, active ? "text-zinc-900" : "font-medium text-zinc-500", )}>
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
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

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
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-zinc-100">
        <header className="z-30 shrink-0 border-b border-zinc-200 bg-white">
          {/* Mobile: compact top bar (tabs live in bottom nav) */}
          <div className="flex items-start justify-between gap-3 px-4 py-3 lg:hidden">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Link to={topNav[0]?.to ?? "/dashboard"} className="flex min-w-0 flex-col">
                <span className="font-display text-xl leading-none tracking-tight text-zinc-900">Plateforme</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{brand}</span>
              </Link>
              {switchTo && switchLabel ? (
                <Link to={switchTo} className="inline-flex max-w-full items-center gap-1.5 border border-dashed border-zinc-300 px-2 py-1 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50">
                  <ArrowLeftRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{switchLabel}</span>
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              <div className="h-9 w-9 border border-zinc-200 bg-zinc-900 text-white grid place-items-center text-sm font-medium">
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </div>
              <button type="button" onClick={handleLogout} className="grid h-9 w-9 shrink-0 place-items-center border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900" aria-label="Sortir">
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Desktop: full header */}
          <div className="hidden grid-cols-1 items-center gap-3 px-4 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4 lg:px-6 lg:py-2.5 lg:min-h-16">
            <div className="flex min-w-0 flex-col justify-center justify-self-start gap-1.5">
              <Link to={topNav[0]?.to ?? "/dashboard"} className="flex flex-col">
                <span className="font-display text-4xl leading-none text-zinc-900">Plateforme</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{brand}</span>
              </Link>
              {switchTo && switchLabel ? (
                <Link to={switchTo} className="inline-flex max-w-full items-center gap-1.5 border border-dashed border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-800 hover:bg-zinc-50 w-fit" >
                  <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{switchLabel}</span>
                </Link>
              ) : null}
            </div>

            <nav className="scroll-touch flex justify-center gap-0 overflow-x-auto border-y border-zinc-200 py-1 lg:border-y-0 lg:py-0">
              {topNav.map((n) => {
                const active = topNavItemActive(loc.pathname, n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "flex items-center gap-2 border px-4 py-2.5 text-sm whitespace-nowrap transition-colors " +
                      (active
                        ? "border-zinc-300 bg-zinc-100 font-medium text-zinc-900"
                        : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900")
                    }
                  >
                    <n.icon className="h-4 w-4 shrink-0 opacity-80" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex w-full flex-wrap items-center justify-end gap-2 justify-self-end lg:w-auto">
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium leading-none text-zinc-900">{user?.name || "admin"}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{brand}</p>
                </div>
                <div className="h-9 w-9 border border-zinc-200 bg-zinc-900 text-white grid place-items-center text-sm font-medium">
                  {(user?.name || "A").slice(0, 1).toUpperCase()}
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 border border-zinc-200 px-2.5 py-1.5 text-zinc-600 hover:bg-zinc-50" aria-label="Sortir">
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:inline">Sortir</span>
              </button>
            </div>
          </div>

          {secondaryNav && secondaryNav.length > 0 ? (
            <div className="scroll-touch flex flex-nowrap items-center gap-1 overflow-x-auto border-t border-zinc-200 bg-zinc-50 px-4 py-2 lg:flex-wrap lg:px-6">
              {secondaryNav.map((n) => {
                const active = loc.pathname === n.to || loc.pathname.startsWith(`${n.to}/`);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium leading-tight " +
                      (active
                        ? "border-zinc-300 bg-white text-zinc-900"
                        : "border-transparent text-zinc-600 hover:bg-white/80 hover:text-zinc-900")
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

        <main data-dashboard-main className="min-h-0 flex-1 overflow-y-auto scroll-touch p-4 pb-24 lg:p-8 lg:pb-8">
          {children}
        </main>

        <MobileBottomNav topNav={topNav} pathname={loc.pathname} />
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-zinc-100">
      <aside className="hidden h-full min-h-0 w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="px-6 py-5 border-b border-zinc-200 space-y-3">
          <div>
            <p className="font-display text-lg leading-none text-zinc-900">LOGO</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{brand}</p>
          </div>
          {switchTo && switchLabel ? (
            <Link to={switchTo} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border border-dashed border-zinc-300 text-zinc-800 hover:bg-zinc-100" >
              <ArrowLeftRight className="h-4 w-4 text-zinc-700 shrink-0" />
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
                    ? "bg-zinc-200 text-zinc-900 font-medium"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900")
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-200">
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-600 hover:bg-zinc-100"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-20 shrink-0 border-b border-zinc-200 bg-white">
          <div className="px-6 h-16 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none text-zinc-900">{user?.name || "Admin"}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{brand}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-zinc-900 text-white grid place-items-center text-sm font-medium">
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
    <div className="rounded-2xl bg-white border border-zinc-200 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
        {Icon && (
          <span
            className={
              monochrome
                ? "grid place-items-center h-8 w-8 rounded-lg bg-zinc-200 text-zinc-800"
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
      <p className="mt-3 font-display text-3xl text-zinc-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

export function PageTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl md:text-4xl text-zinc-900">{title}</h1>
      </div>
      {action}
    </div>
  );
}
