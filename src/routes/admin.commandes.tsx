import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Download, Eye, X, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/commandes")({
  head: () => ({ meta: [{ title: "Commandes   Administration" }] }),
  component: AdminCommandes,
});

type OrderStatus = "en_attente" | "en_cours" | "livre";

type Order = {
  id: string;
  client: string;
  email: string;
  totalLabel: string;
  status: OrderStatus;
  dateTable: string;
  dateDetail: string;
  phone: string;
  address: string;
  lines: { name: string; qty: number; lineTotal: string }[];
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  livre: "Livré",
};

const DEMO_ORDERS: Order[] = [
  {
    id: "093F5AD0",
    client: "basma essafar",
    email: "basmaess11@gmail.com",
    totalLabel: "2060 MAD",
    status: "en_cours",
    dateTable: "04/05/2026",
    dateDetail: "4 mai 2026",
    phone: "0629954787",
    address: "HAY TILILA , Agadir",
    lines: [
      { name: "Blocs de construction en bois", qty: 2, lineTotal: "360 MAD" },
      { name: "Lettres & chiffres en bois", qty: 2, lineTotal: "440 MAD" },
      { name: "Puzzle carte du monde", qty: 3, lineTotal: "960 MAD" },
      { name: "Balles sensorielles texturées", qty: 4, lineTotal: "300 MAD" },
    ],
  },
];

type StatusFilter = "tous" | OrderStatus;

function AdminCommandes() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous");
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [detail, setDetail] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQ =
        !q ||
        o.client.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q);
      const matchS = statusFilter === "tous" || o.status === statusFilter;
      return matchQ && matchS;
    });
  }, [orders, query, statusFilter]);

  const exportCsv = useCallback(() => {
    const header = ["Client", "Email", "Total", "Statut", "Date"];
    const lines = filtered.map((o) =>
      [o.client, o.email, o.totalLabel, STATUS_LABEL[o.status], o.dateTable].map(csvEscape).join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commandes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [detail]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            — Chapitre 04 — Commandes
          </p>
          <h1 className="mt-2 font-display text-3xl text-zinc-900 md:text-4xl">
            <span className="font-semibold">Gestion des </span>
            <span className="font-medium italic text-zinc-600">commandes</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{afficheLabel(filtered.length)}</p>
        </header>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex shrink-0 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 border border-zinc-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="relative min-w-0 flex-1 max-w-2xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "tous" as const, label: "Tous" },
              { key: "en_attente" as const, label: "En attente" },
              { key: "en_cours" as const, label: "En cours" },
              { key: "livre" as const, label: "Livré" },
            ] as const
          ).map(({ key, label }) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={
                  "border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors " +
                  (active
                    ? "border-zinc-400 bg-zinc-200 text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                {["Client", "Email", "Total", "Statut", "Date", ""].map((h) => (
                  <th
                    key={h || "actions"}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                    Aucune commande ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-4 font-semibold text-zinc-900">{o.client}</td>
                    <td className="px-4 py-4 text-zinc-600">{o.email}</td>
                    <td className="px-4 py-4 font-semibold text-zinc-900">{o.totalLabel}</td>
                    <td className="px-4 py-4">
                      <StatusSelect
                        value={o.status}
                        onChange={(next) => {
                          setOrders((prev) => prev.map((row) => (row.id === o.id ? { ...row, status: next } : row)));
                          setDetail((d) => (d && d.id === o.id ? { ...d, status: next } : d));
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-zinc-600">{o.dateTable}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setDetail(o)}
                        className="grid h-9 w-9 place-items-center border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                        aria-label="Voir le détail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {filtered.length} résultat{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-1.5" aria-hidden>
            {[0.4, 0.55, 0.7, 0.85].map((op, i) => (
              <span key={i} className="h-1 w-6 bg-zinc-300" style={{ opacity: op }} />
            ))}
          </div>
        </div>
      </div>

      {detail ? <OrderDetailModal order={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}

function csvEscape(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function afficheLabel(n: number) {
  if (n === 0) return "Aucune commande affichée";
  if (n === 1) return "1 commande affichée";
  return `${n} commandes affichées`;
}

function StatusSelect({
  value,
  onChange,
}: {
  value: OrderStatus;
  onChange: (v: OrderStatus) => void;
}) {
  return (
    <label className="inline-flex min-w-[10rem] cursor-pointer items-center gap-2 border border-zinc-200 bg-zinc-100 px-2 py-1.5">
      <span className="h-1.5 w-1.5 shrink-0 bg-zinc-600" aria-hidden />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className="min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0.5 pr-1 text-sm text-zinc-800 outline-none"
      >
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((k) => (
          <option key={k} value={k}>
            {STATUS_LABEL[k]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
    </label>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-commande-title"
        className="relative z-10 flex max-h-[min(90vh,44rem)] w-full max-w-lg flex-col border border-zinc-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              — Détail commande
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 id="detail-commande-title" className="font-mono text-xl font-bold tracking-tight text-zinc-900">
                #{order.id}
              </h2>
              <span className="border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                {STATUS_LABEL[order.status]}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-1 border border-zinc-200 sm:grid-cols-2">
            {(
              [
                { label: "Client", value: order.client, emphasize: false },
                { label: "Email", value: order.email, emphasize: false },
                { label: "Téléphone", value: order.phone, emphasize: false },
                { label: "Adresse", value: order.address, emphasize: false },
                { label: "Montant total", value: order.totalLabel, emphasize: true },
                { label: "Date", value: order.dateDetail, emphasize: false },
              ] as const
            ).map((f, i) => (
              <div
                key={f.label}
                className={
                  "border-zinc-200 px-4 py-3 " +
                  (i < 5 ? "border-b " : "") +
                  (i < 4 ? "sm:border-b " : "sm:border-b-0 ") +
                  (i % 2 === 0 ? "sm:border-r " : "")
                }
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{f.label}</p>
                <p className={"mt-1 text-sm text-zinc-900 " + (f.emphasize ? "font-bold" : "")}>{f.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              — Articles commandés
            </p>
            <ul className="mt-3 divide-y divide-zinc-200 border border-zinc-200">
              {order.lines.map((line) => (
                <li key={line.name} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-semibold text-zinc-900">{line.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Qté : {line.qty}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-zinc-900">{line.lineTotal}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
