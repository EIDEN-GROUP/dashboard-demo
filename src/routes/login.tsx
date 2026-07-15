import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion - Plateforme" }] }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) { setError("Veuillez remplir tous les champs."); return; }
    setError("");
    setBusy(true);
    const result = await login(email, pw);
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else {
      nav({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="exemple@eiden.com"
                className="h-11 w-full rounded-xl border border-[#28396C]/15 bg-card px-3 text-sm text-foreground shadow-none outline-none transition focus-visible:border-[#6BA53A] focus-visible:ring-2 focus-visible:ring-[#B5E18B]/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-[#28396C]/15 bg-card pr-11 pl-3 text-sm text-foreground shadow-none outline-none transition focus-visible:border-[#6BA53A] focus-visible:ring-2 focus-visible:ring-[#B5E18B]/40"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B5E18B] px-8 py-3.5 text-sm font-bold text-[#28396C] shadow-[0_14px_30px_-14px_rgba(107,165,58,0.7)] transition hover:brightness-105 disabled:opacity-60"
            >
              {busy ? "Connexion..." : "Se connecter"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground">
            Démo — n'importe quel email / mot de passe fonctionne.
          </p>
        </div>
      </div>
    </div>
  );
}
