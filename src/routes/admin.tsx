import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashShell, type NavItem } from "@/components/dash-shell";
import { LayoutDashboard, Calendar, CalendarDays, ShoppingBag } from "lucide-react";

const topNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/rendez-vous", label: "Rendez-vous", icon: Calendar },
];

const secondaryNav: NavItem[] = [
  { to: "/admin/planning", label: "Planning", icon: CalendarDays },
];

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashShell
      brand="Administration"
      brandColor="primary"
      variant="topnav"
      topNav={topNav}
      secondaryNav={secondaryNav}
      switchTo="/crm/dashboard"
      switchLabel="Aller au CRM"
    >
      <Outlet />
    </DashShell>
  ),
});
