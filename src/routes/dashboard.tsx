import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashShell } from "@/components/dash-shell";
import { useAuth } from "@/lib/auth";
import { useDashboardI18n, useDashboardNav } from "@/lib/landing-i18n";

function DashboardLayout() {
  const { t, dir } = useDashboardI18n();
  const { topNav, brand } = useDashboardNav();
  const { role } = useAuth();
  const isSuperadmin = role === "superadmin";

  return (
    <DashShell
      brand={brand}
      brandColor="primary"
      variant="topnav"
      topNav={topNav}
      switchTo={isSuperadmin ? "/superadmin" : undefined}
      switchLabel={isSuperadmin ? t.superadmin.switchToSuperadmin : undefined}
      dir={dir}
    >
      <Outlet />
    </DashShell>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});
