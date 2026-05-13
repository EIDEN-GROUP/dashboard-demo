import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashShell, type NavItem } from "@/components/dash-shell";
import { LayoutDashboard, Users, CreditCard, Settings, Calendar, UserPlus, Images, BarChart3 } from "lucide-react";

const topNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/familles", label: "Parents", icon: Users },
  { to: "/dashboard/paiements", label: "Paiements", icon: CreditCard },
  { to: "/dashboard/rendez-vous", label: "Rendez-vous", icon: Calendar },
  { to: "/dashboard/parametres", label: "Paramètres", icon: Settings },
];

const secondaryNav: NavItem[] = [
  { to: "/dashboard/leads", label: "Prospects", icon: UserPlus },
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
