import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/parametres")({
  head: () => ({ meta: [{ title: "Paramètres   CRM" }] }),
  component: CrmParametresPage,
});

const inputClass =
  "rounded-none border-zinc-300 bg-white shadow-none focus-visible:border-zinc-950 focus-visible:ring-0";

const selectTriggerClass =
  "h-10 rounded-none border-zinc-300 bg-white shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-zinc-400";

const sectionTitle = "text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500";

const dialogSurface = cn(
  "gap-0 overflow-hidden border border-zinc-200 bg-white p-0 shadow-none sm:rounded-none rounded-none",
  "max-h-[min(90vh,640px)] w-[min(100vw-1.5rem,480px)] max-w-[min(100vw-1.5rem,480px)]",
  "[&>button]:right-5 [&>button]:top-5 [&>button]:rounded-none [&>button]:border [&>button]:border-zinc-300 [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-zinc-100 [&>button]:focus:ring-0",
);

function Req({ children }: { children: ReactNode }) {
  return (
    <>
      {children} <span className="text-zinc-950">*</span>
    </>
  );
}

type UserRow = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
};

const initialUsers: UserRow[] = [
  {
    id: "1",
    email: "admin@educazenkids.com",
    username: "admin",
    displayName: "Admin",
    role: "ADMIN",
  },
];

function CrmParametresPage() {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [userModalOpen, setUserModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— CRM — Paramètres</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-zinc-950 md:text-4xl">Configuration générale</h1>
        <p className="mt-2 max-w-2xl text-sm italic text-zinc-600">
          Configurez les permissions et les comptes utilisateurs.
        </p>
      </header>

      <section className="border border-zinc-200 bg-white p-6">
        <p className={sectionTitle}>— Permissions des rôles</p>
        <p className="mt-4 text-sm text-zinc-600">
          Cette fonctionnalité sera disponible dans une prochaine mise à jour.
        </p>
      </section>

      <section className="border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={sectionTitle}>— Gestion des utilisateurs</p>
            <p className="mt-2 text-sm text-zinc-600">Créez et gérez les comptes utilisateurs.</p>
          </div>
          <button
            type="button"
            onClick={() => setUserModalOpen(true)}
            className="inline-flex items-center gap-2 border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </button>
        </div>

        <div className="mt-6 overflow-x-auto border border-zinc-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nom d&apos;utilisateur</th>
                <th className="px-4 py-3">Nom d&apos;affichage</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 text-zinc-800">{u.email}</td>
                  <td className="px-4 py-3 font-medium text-zinc-950">{u.username}</td>
                  <td className="px-4 py-3 text-zinc-800">{u.displayName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-800">
                      <span className="h-1 w-1 shrink-0 bg-zinc-900" aria-hidden />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setUsers((list) => list.filter((x) => x.id !== u.id))}
                      className="grid h-9 w-9 place-items-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                      aria-label={`Supprimer ${u.username}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CreateUserDialog open={userModalOpen} onOpenChange={setUserModalOpen} onCreated={(u) => setUsers((p) => [...p, u])} />
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (u: UserRow) => void;
}) {
  const [role, setRole] = useState("ventes");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const username = String(fd.get("username") || "").trim();
    const displayName = String(fd.get("displayName") || "").trim();
    const password = String(fd.get("password") || "");
    if (email.length < 3 || password.length < 8 || username.length < 2) return;
    const roleLabel = role === "ventes" ? "VENTES" : role === "admin" ? "ADMIN" : "SUPPORT";
    onCreated({
      id: `u-${Date.now()}`,
      email,
      username,
      displayName: displayName || username,
      role: roleLabel,
    });
    e.currentTarget.reset();
    setRole("ventes");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogSurface}>
        <DialogDescription className="sr-only">Formulaire pour créer un utilisateur</DialogDescription>
        <div className="border-t-4 border-t-zinc-900">
          <div className="border-b border-zinc-200 px-6 pb-4 pt-6 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">— Nouvel utilisateur</p>
            <DialogTitle className="mt-2 text-left font-display text-xl font-semibold text-zinc-950">
              Créer un utilisateur
            </DialogTitle>
          </div>
          <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="cu-email" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <Req>Email</Req>
              </Label>
              <Input id="cu-email" name="email" type="email" required className={inputClass} placeholder="admin@exemple.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-pass" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <Req>Mot de passe</Req>
              </Label>
              <Input id="cu-pass" name="password" type="password" required minLength={8} className={inputClass} />
              <p className="text-xs italic text-zinc-500">Minimum 8 caractères</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-user" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <Req>Nom d&apos;utilisateur</Req>
              </Label>
              <Input id="cu-user" name="username" required className={inputClass} placeholder="johndoe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-display" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Nom d&apos;affichage
              </Label>
              <Input id="cu-display" name="displayName" className={inputClass} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <Req>Rôle</Req>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-zinc-200">
                  <SelectItem value="ventes">Ventes</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
