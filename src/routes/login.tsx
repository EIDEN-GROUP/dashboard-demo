import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion   Plateforme" }] }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@lumiecole.demo");
  const [pw, setPw] = useState("demo1234");
  const [show, setShow] = useState(false);

  const enter = () => {
    login(email, pw);
    nav({ to: "/dashboard" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    enter();
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Left   dashboard collage on a brand forest panel */}
      <div className="relative hidden overflow-hidden bg-[var(--eiden-forest)] lg:block">
        <img
          src="/login-bg.png"
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-center opacity-80"
        />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_0%_100%,rgba(18,48,42,.95)_0%,rgba(18,48,42,.65)_35%,transparent_70%)]" />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--eiden-forest)] via-primary to-[var(--eiden-gold)]"
          aria-hidden
        />
      </div>

      {/* Right   sign in form */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Connexion CRM</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
            Connectez-vous
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accédez à votre espace de gestion de la relation client.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Adresse e-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@eiden.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-block text-sm font-medium text-foreground transition-colors hover:text-[color-mix(in_srgb,var(--primary)_60%,var(--foreground)_40%)]"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="landing-cta-primary group inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wide transition"
            >
              Se connecter
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground">
            Démo   n'importe quel email / mot de passe fonctionne.
          </p>
        </div>
      </div>
    </div>
  );
}
