import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-secondary p-12 text-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-[10%] -top-[15%] h-[55vw] w-[55vw] rounded-full bg-[color-mix(in_oklab,var(--eiden-gold)_12%,transparent)]" aria-hidden />
        <div className="pointer-events-none absolute -bottom-[20%] -left-[8%] h-[40vw] w-[40vw] rounded-full bg-[color-mix(in_oklab,var(--primary)_5%,transparent)]" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <Link to="/" className="relative flex items-center">
          <span className="font-display text-xl">Gestio</span>
        </Link>
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Chapitre 01 - Connexion</p>
          <h1 className="mt-4 text-balance font-display text-6xl leading-[0.95]">
            Chaque <em className="not-italic text-primary">enfant</em>
            <br />
            est unique.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Un espace pédagogique inclusif où chaque parcours d'apprentissage trouve sa voie.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["CRM", "Paiements", "Planning", "Suivi", "Rapports"].map((t) => (
              <span key={t} className="border border-border bg-card px-3 py-1 text-xs text-foreground/85">{t}</span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">Apprendre · Grandir · S'épanouir.</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--eiden-forest)] via-primary to-[var(--eiden-gold)]" aria-hidden />
      </div>

      <div className="flex flex-col justify-center border-l border-border bg-card p-8 sm:p-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-3">
            <span className="font-display text-5xl text-primary/25">01</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Connexion CRM</p>
              <h2 className="font-display text-2xl text-foreground">Connectez-vous</h2>
            </div>
          </div>
          <form onSubmit={submit} className="mt-10 space-y-7">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">01 - Identifiant</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">02 - Mot de passe</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="current-password"
                  className="mt-2 w-full border-b border-input bg-transparent py-2 pr-8 text-sm text-foreground outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-between rounded-none bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
              {busy ? "Connexion..." : "Entrer dans l'espace"}
              <span className="grid h-7 w-7 place-items-center bg-primary-foreground text-primary">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </form>
          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
            <span>Apprendre. Grandir. S'épanouir.</span>
            <span className="uppercase tracking-widest">Accès restreint</span>
          </div>
        </div>
      </div>
    </div>
  );
}
