import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { GraduationCap, Users, ArrowUpRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin-choice")({
  head: () => ({ meta: [{ title: "Choisir un espace Plateforme" }] }),
  component: AdminChoice,
});

function AdminChoice() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const t = setTimeout(() => nav({ to: "/login" }), 0);
      return () => clearTimeout(t);
    }
  }, [user, nav]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/landing" className="flex items-center">
            <span className="font-display text-xl">LOGO</span>
          </Link>
          <button onClick={() => { logout(); nav({ to: "/login" }); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-5 py-16">
        <div className="w-full max-w-5xl">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Bienvenue {user?.name || "Admin"}</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl text-balance">
              Quel espace souhaitez-vous <em className="not-italic text-primary">ouvrir ?</em>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Vous pouvez basculer entre les deux espaces à tout moment depuis la barre latérale.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-5">
            <ChoiceCard
              to="/admin/dashboard"
              n="01"
              icon={GraduationCap}
              title="Espace pédagogique"
              desc="Commandes, rendez-vous, planning et vue d'ensemble de l'activité."
              color="primary"
            />
            <ChoiceCard
              to="/crm/dashboard"
              n="02"
              icon={Users}
              title="Espace CRM"
              desc="Suivi des familles, leads, communication et inscriptions."
              color="coral"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ChoiceCard({ to, n, icon: Icon, title, desc, color }: any) {
  return (
    <Link to={to} className="group relative rounded-3xl border border-border bg-card p-10 hover:-translate-y-1 hover:shadow-2xl shadow-foreground/5 transition overflow-hidden">
      <span className="absolute top-6 right-6 font-display text-7xl opacity-10">{n}</span>
      <div
        className="h-14 w-14 rounded-2xl grid place-items-center"
        style={{ backgroundColor: `color-mix(in oklab, var(--${color}) 22%, var(--background))`, color: `var(--${color})` }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-8 font-display text-3xl">{title}</h2>
      <p className="mt-3 text-muted-foreground max-w-sm">{desc}</p>
      <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
        Ouvrir l'espace
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
