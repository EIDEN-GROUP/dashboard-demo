import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Phone } from "lucide-react";

const items: { i: typeof Mail; titre: string; detail: string }[] = [
  {
    i: Mail,
    titre: "Newsletter de mars envoyée",
    detail: "62 destinataires · taux d'ouverture 71 %",
  },
  {
    i: MessageSquare,
    titre: "SMS de rappel de rendez-vous",
    detail: "Envoyé à 8 familles",
  },
  {
    i: Phone,
    titre: "Appels de suivi prospects",
    detail: "12 appels passés cette semaine",
  },
  {
    i: Mail,
    titre: "Campagne inscriptions 2026",
    detail: "Programmée pour le 5 avril",
  },
];

export const Route = createFileRoute("/crm/communications")({
  head: () => ({ meta: [{ title: "Communications — CRM" }] }),
  component: () => (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Messagerie — CRM</p>
        <div>
          <h1 className="font-display text-3xl md:text-[2.35rem] leading-tight tracking-tight text-zinc-950">
            <span className="font-semibold">Communications</span>{" "}
            <span className="font-normal italic text-zinc-500">récentes</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Historique des envois et actions de communication (données de démonstration).
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((x) => {
          const Icon = x.i;
          return (
            <div
              key={x.titre}
              className="flex gap-4 border border-zinc-200 bg-white p-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-zinc-200 bg-zinc-100 text-zinc-800">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-medium text-zinc-950">{x.titre}</h3>
                <p className="mt-1 text-sm text-zinc-600">{x.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
});
