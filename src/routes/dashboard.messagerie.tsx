import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, Send, MessageSquare, Phone, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardI18n } from "@/lib/landing-i18n";
import { getMessageHistory, deleteMessage, sendBroadcast } from "@/lib/server-whatsapp";
import { listClients } from "@/lib/server-clients";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/messagerie")({
  head: () => ({ meta: [{ title: "Messagerie — WhatsApp" }] }),
  component: MessageriePage,
});

const statusIcon: Record<string, any> = {
  pending: Clock,
  sent: CheckCircle,
  delivered: CheckCircle,
  read: CheckCircle,
  failed: XCircle,
};

const statusColor: Record<string, string> = {
  pending: "text-amber-500",
  sent: "text-blue-500",
  delivered: "text-emerald-500",
  read: "text-emerald-600",
  failed: "text-red-500",
};

function MessageriePage() {
  const { t } = useDashboardI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterDir, setFilterDir] = useState<string>("tous");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [content, setContent] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["whatsapp-messages"],
    queryFn: getMessageHistory,
    refetchInterval: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      toast.success("Message supprimé");
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: sendBroadcast,
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(`Message envoyé à ${res.success}/${res.total} clients`);
        queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      } else {
        toast.error(res.error || "Échec");
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m: any) => {
      if (filterDir !== "tous" && m.direction !== filterDir) return false;
      if (!q) return true;
      return m.phone.includes(q) || m.content.toLowerCase().includes(q) || (m.clients?.parent_name || "").toLowerCase().includes(q);
    });
  }, [messages, search, filterDir]);

  const handleBroadcast = () => {
    if (!content.trim()) return;
    broadcastMutation.mutate({ content: content.trim() });
    setContent("");
    setBroadcastOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">WhatsApp</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-foreground md:text-4xl">
            Messagerie <span className="italic text-muted-foreground">WhatsApp</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Historique des messages envoyés et reçus via WhatsApp.
          </p>
        </div>
        <button type="button" onClick={() => setBroadcastOpen(true)} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Send className="h-4 w-4" />Message à tous
        </button>
      </header>

      {broadcastOpen ? (
        <div className="border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Nouveau message à tous les clients</p>
          <div className="mt-4 space-y-4">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre message..." rows={3}
              className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-input" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setContent(""); setBroadcastOpen(false); }} className="border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Annuler</button>
              <button type="button" onClick={handleBroadcast} disabled={broadcastMutation.isPending || !content.trim()} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {broadcastMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {broadcastMutation.isPending ? "Envoi..." : "Envoyer à tous"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="border border-border bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">— {t.common.filtersSearch}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par téléphone, contenu ou client..."
              className="w-full border border-border bg-muted py-2.5 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-input" />
          </div>
          <select value={filterDir} onChange={(e) => setFilterDir(e.target.value)} className="h-10 border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-input">
            <option value="tous">Tous les messages</option>
            <option value="sent">Envoyés</option>
            <option value="received">Reçus</option>
          </select>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isLoading ? "Chargement..." : `${filtered.length} message${filtered.length > 1 ? "s" : ""}`}
        </p>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Historique</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {isLoading ? "Chargement..." : "Aucun message trouvé"}
                </td></tr>
              ) : (
                filtered.map((m: any) => {
                  const StatusIcon = statusIcon[m.status] || Clock;
                  return (
                    <tr key={m.id} className="hover:bg-muted/80">
                      <td className="px-4 py-3 font-medium text-foreground">{m.clients?.parent_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          m.direction === "sent" ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30 bg-muted text-muted-foreground")}>
                          {m.direction === "sent" ? <Send className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                          {m.direction === "sent" ? "Envoyé" : "Reçu"}
                        </span>
                      </td>
                      <td className="max-w-[250px] px-4 py-3 text-muted-foreground truncate">{m.content}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", statusColor[m.status] || "text-muted-foreground")}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => { if (confirm("Supprimer ce message ?")) deleteMutation.mutate({ data: m.id }); }} className="grid h-9 w-9 place-items-center border border-border bg-card text-red-500 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
