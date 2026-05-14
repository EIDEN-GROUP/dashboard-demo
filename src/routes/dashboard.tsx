import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashShell, type NavItem } from "@/components/dash-shell";
import { LayoutDashboard, Users, CreditCard, Calendar, Images, BarChart3 } from "lucide-react";

const topNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/rendez-vous", label: "Rendez-vous", icon: Calendar },
  { to: "/dashboard/familles", label: "Parents", icon: Users },
  { to: "/dashboard/paiements", label: "Paiements", icon: CreditCard },
];

const secondaryNav: NavItem[] = [
  { to: "/dashboard/affiches", label: "Affiches", icon: Images },
  { to: "/dashboard/rapports", label: "Rapports", icon: BarChart3 },
];

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <DashShell
      brand="Tableau de bord"
      brandColor="primary"
      variant="topnav"
      topNav={topNav}
      secondaryNav={secondaryNav}
    >
      <Outlet />
    </DashShell>
  ),
});
