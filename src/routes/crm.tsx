import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashShell, type NavItem } from "@/components/dash-shell";
import { LayoutDashboard, Users, CreditCard, Settings, UserPlus, MessagesSquare, BarChart3 } from "lucide-react";

const topNav: NavItem[] = [
  { to: "/crm/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/crm/familles", label: "Parents", icon: Users },
  { to: "/crm/paiements", label: "Paiements", icon: CreditCard },
  { to: "/crm/parametres", label: "Paramètres", icon: Settings },
];

const secondaryNav: NavItem[] = [
  { to: "/crm/leads", label: "Prospects", icon: UserPlus },
  { to: "/crm/communications", label: "Communications", icon: MessagesSquare },
  { to: "/crm/rapports", label: "Rapports", icon: BarChart3 },
];

export const Route = createFileRoute("/crm")({
  component: () => (
    <DashShell
      brand="CRM"
      brandColor="coral"
      variant="topnav"
      topNav={topNav}
      secondaryNav={secondaryNav}
      switchTo="/admin/dashboard"
      switchLabel="Aller à l'administration"
    >
      <Outlet />
    </DashShell>
  ),
});
