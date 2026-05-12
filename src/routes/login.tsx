import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, pw);
    nav({ to: "/admin-choice" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-zinc-100 text-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <Link to="/landing" className="relative flex items-center">
          <span className="font-display text-xl">LOGO</span>
        </Link>
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Chapitre 01   Connexion</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] text-balance">
            Chaque <em className="not-italic text-zinc-600">enfant</em>
            <br />
            est unique.
          </h1>
          <p className="mt-6 text-zinc-600 max-w-md">
            Un espace pédagogique inclusif où chaque parcours d'apprentissage trouve sa voie.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"].map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full border border-zinc-300 bg-white text-zinc-700">
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-zinc-500">Apprendre · Grandir · S'épanouir.</p>
      </div>

      <div className="flex flex-col justify-center p-8 sm:p-16 bg-white border-l border-zinc-200">
        <div className="max-w-sm w-full mx-auto">
          <div className="flex items-center gap-3">
            <span className="font-display text-5xl text-zinc-400">01</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Espace administrateur</p>
              <h2 className="font-display text-2xl text-zinc-900">Connectez-vous</h2>
            </div>
          </div>
          <form onSubmit={submit} className="mt-10 space-y-7">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">01   Identifiant</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-zinc-300 focus:border-zinc-900 outline-none py-2 text-sm text-zinc-900"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">02   Mot de passe</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="mt-2 w-full bg-transparent border-b border-zinc-300 focus:border-zinc-900 outline-none py-2 text-sm pr-8 text-zinc-900"
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button className="w-full flex items-center justify-between rounded-full bg-zinc-900 text-white px-6 py-4 text-sm font-medium hover:bg-zinc-800 transition">
              Entrer dans l'espace
              <span className="grid place-items-center h-7 w-7 rounded-full bg-white text-zinc-900">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </form>
          <div className="mt-8 flex items-center justify-between text-xs text-zinc-500">
            <span>Apprendre. Grandir. S'épanouir.</span>
            <span className="uppercase tracking-widest">Accès restreint</span>
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            Démo   n'importe quel email/mot de passe fonctionne.
          </p>
        </div>
      </div>
    </div>
  );
}
