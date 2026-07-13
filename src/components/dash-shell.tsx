import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { type ReactNode, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useDashboardI18n } from "@/lib/landing-i18n";
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
  if (to === "/dashboard/messagerie")
    return pathname === "/dashboard/messagerie" || pathname.startsWith("/dashboard/messagerie/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-6px_24px_color-mix(in_oklab,var(--foreground)_6%,transparent)] lg:hidden" aria-label={mainNavAria}>
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
              <span className={cn("w-full max-w-full truncate px-0.5 text-center font-semibold leading-tight", labelClass, active ? "text-foreground" : "font-medium text-muted-foreground")}>
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
  switchTo?: string;
  switchLabel?: string;
  dir?: "ltr" | "rtl";
  children: ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const { t } = useDashboardI18n();
  const navigate = useNavigate();
  const loc = useLocation();
  const shellDir = dir ?? "ltr";

  const displayName = user?.user_metadata?.name as string ?? user?.email?.split("@")[0] ?? "Admin";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate({ to: "/login" });
  }, [logout, navigate]);

  if (loading) return null;

  if (!user && typeof window !== "undefined") {
    navigate({ to: "/login" });
    return null;
  }

  if (variant === "topnav" && topNav && topNav.length > 0) {
    return (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-muted" dir={shellDir}>
        <header className="z-30 shrink-0 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-3 px-4 py-3 lg:hidden">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Link to={topNav[0]?.to ?? "/dashboard"} className="flex min-w-0 flex-col">
                <span className="font-display text-xl leading-none tracking-tight text-foreground">{t.shell.platform}</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{brand}</span>
              </Link>
              {switchTo && switchLabel ? (
                <Link to={switchTo} className="inline-flex max-w-full items-center gap-1.5 border border-dashed border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/70">
                  <ArrowLeftRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{switchLabel}</span>
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              <div className="h-9 w-9 border border-border bg-primary text-primary-foreground grid place-items-center text-sm font-medium">
                {avatarLetter}
              </div>
              <button type="button" onClick={handleLogout} className="grid h-9 w-9 shrink-0 place-items-center border border-border text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground" aria-label={t.shell.logoutAria}>
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <div className="hidden grid-cols-1 items-center gap-3 px-4 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4 lg:px-6 lg:py-2.5 lg:min-h-16">
            <div className="flex min-w-0 flex-col justify-center justify-self-start gap-1.5">
              <Link to={topNav[0]?.to ?? "/dashboard"} className="flex flex-col">
                <span className="font-display text-4xl leading-none text-foreground">{t.shell.platform}</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{brand}</span>
              </Link>
              {switchTo && switchLabel ? (
                <Link to={switchTo} className="inline-flex max-w-full items-center gap-1.5 border border-dashed border-border px-2.5 py-1.5 text-xs text-foreground/90 hover:bg-muted/70 w-fit">
                  <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{switchLabel}</span>
                </Link>
              ) : null}
            </div>

            <nav className="scroll-touch flex justify-center gap-0 overflow-x-auto border-y border-border py-1 lg:border-y-0 lg:py-0">
              {topNav.map((n) => {
                const active = topNavItemActive(loc.pathname, n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "flex items-center gap-2 border px-4 py-2.5 text-sm whitespace-nowrap transition-colors " +
                      (active
                        ? "border-border bg-muted font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground")
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
                  <p className="text-sm font-medium leading-none text-foreground">{displayName}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{brand}</p>
                </div>
                <div className="h-9 w-9 border border-border bg-primary text-primary-foreground grid place-items-center text-sm font-medium">
                  {avatarLetter}
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70" aria-label={t.shell.logoutAria}>
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:inline">{t.shell.logout}</span>
              </button>
            </div>
          </div>

          {secondaryNav && secondaryNav.length > 0 ? (
            <div className="scroll-touch flex flex-nowrap items-center gap-1 overflow-x-auto border-t border-border bg-secondary/40 px-4 py-2 lg:flex-wrap lg:px-6">
              {secondaryNav.map((n) => {
                const active = topNavItemActive(loc.pathname, n.to);
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
            <p className="font-display text-lg leading-none text-foreground">Gestio</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{brand}</p>
          </div>
          {switchTo && switchLabel ? (
            <Link to={switchTo} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border border-dashed border-border text-foreground/90 hover:bg-muted/80">
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
            onClick={handleLogout}
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
                <p className="text-sm font-medium leading-none text-foreground">{displayName}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{brand}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-medium">
                {avatarLetter}
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
    <div className="rounded-2xl bg-card border border-border p-5">
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
