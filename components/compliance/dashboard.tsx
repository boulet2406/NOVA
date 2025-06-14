"use client";

import Link from "next/link";
import { useEffect, useState, ReactNode, useRef, useCallback } from "react";
import useSWR from "swr";
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  BellRing,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";

import type { Client } from "@/payload-types";

// Seuils AML configurables
const AML_THRESHOLDS = {
  LOW: 33,
  HIGH: 66,
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export const ComplianceDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const prevMetrics = useRef<{ aml: number; op: number }>({ aml: 0, op: 0 });
  const [metrics, setMetrics] = useState({
    total: 0,
    lowAML: 0,
    medAML: 0,
    highAML: 0,
    avgOp: 0,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/client?pagination=false`,
    fetcher
  );

  const compute = useCallback(() => {
    const clientsData = data.docs;
    if (!Array.isArray(clientsData)) return;

    setLoading(true);
    const total = clientsData.length;
    const lowAML = clientsData.filter(
      (c: Client) => c.riskScore < AML_THRESHOLDS.LOW
    ).length;
    const medAML = clientsData.filter(
      (c: Client) =>
        c.riskScore >= AML_THRESHOLDS.LOW && c.riskScore < AML_THRESHOLDS.HIGH
    ).length;
    const highAML = clientsData.filter(
      (c: Client) => c.riskScore >= AML_THRESHOLDS.HIGH
    ).length;
    const avgOp = Math.round(
      clientsData.reduce(
        (sum: number, c: Client) => sum + c.behavioralScore,
        0
      ) / total
    );

    setMetrics((old) => {
      prevMetrics.current = {
        aml: old.highAML,
        op: old.avgOp,
      };
      return { total, lowAML, medAML, highAML, avgOp };
    });

    setClients(clientsData);
    setLastUpdate(new Date());
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (!data || !Array.isArray(data.docs)) return;
    compute();
    const id = setInterval(compute, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [data, compute]);

  // calcul des deltas
  const delta = (current: number, previous: number) => {
    if (previous === 0) return null;
    const diff = current - previous;
    const pct = Math.round((diff / previous) * 100);
    return { diff, pct };
  };
  const trendAML = delta(metrics.highAML, prevMetrics.current.aml);
  const trendOp = delta(metrics.avgOp, prevMetrics.current.op);

  // données camembert AML
  const dataAML = [
    { name: "Faible", value: metrics.lowAML, color: "#22c55e" },
    { name: "Moyen", value: metrics.medAML, color: "#eab308" },
    { name: "Élevé", value: metrics.highAML, color: "#ef4444" },
  ];

  // Top 5 listes
  const topAML = [...clients]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);
  const topOp = [...clients]
    .sort((a, b) => b.behavioralScore - a.behavioralScore)
    .slice(0, 5);

  if (!data || !Array.isArray(data.docs)) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-500" size={48} />{" "}
        <span className="ml-4 text-lg text-zinc-300">
          Chargement des données...
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Contrôle de rafraîchissement */}
      <section className="px-6 flex items-center justify-end mb-6 gap-4">
        <button
          onClick={compute}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Rafraîchir
        </button>
        {lastUpdate && (
          <span className="text-zinc-400 text-sm">
            Dernière mise à jour : {lastUpdate.toLocaleTimeString("fr-FR")}
          </span>
        )}
      </section>

      {/* KPI + Tendances */}
      <section className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Users size={32} />}
          label="Total Clients"
          value={metrics.total.toLocaleString("fr-FR")}
          gradient="from-indigo-500 to-purple-600"
        />
        <StatCard
          icon={<ShieldAlert size={32} />}
          label="Faible AML"
          value={metrics.lowAML}
          gradient="from-green-400 to-green-600"
        />
        <StatCard
          icon={<AlertTriangle size={32} />}
          label="Moyen AML"
          value={metrics.medAML}
          gradient="from-yellow-400 to-yellow-600"
        />
        <StatCard
          icon={<TrendingUp size={32} />}
          label="Élevé AML"
          value={metrics.highAML}
          gradient="from-red-400 to-red-600"
          highlight
          trend={trendAML}
        />
      </section>

      {/* Charts + Opé trend */}
      <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Camembert AML */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Répartition AML</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataAML}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    `${name} ${(percent! * 100).toFixed(0)}%`
                  }
                >
                  {dataAML.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <ReTooltip
                  formatter={(v) => `${v}`}
                  contentStyle={{
                    background: "#222",
                    border: "none",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Opérationnel */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <h2 className="text-2xl font-semibold mb-4">
            Score Opérationnel Moy.
          </h2>
          <div className="text-6xl font-bold text-cyan-400 flex items-center justify-center h-full gap-2">
            {metrics.avgOp}/100
            {trendOp &&
              (trendOp.pct > 0 ? (
                <TrendingUp className="text-green-400" />
              ) : (
                <TrendingDown className="text-red-400" />
              ))}
          </div>
          {trendOp && (
            <div className="mt-2 text-sm text-zinc-400 text-center">
              {trendOp.pct > 0 ? "+" : ""}
              {trendOp.pct}% vs précédent
            </div>
          )}
        </div>
      </section>

      {/* Top 5 */}
      <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
        <TopList
          title="Top 5 AML"
          icon={<AlertTriangle size={24} />}
          items={topAML.map((c) => ({
            id: c.id.toString(),
            label: `${c.firstName} ${c.lastName}`,
            score: c.riskScore,
          }))}
        />
        <TopList
          title="Top 5 Opérationnel"
          icon={<BellRing size={24} />}
          items={topOp.map((c) => ({
            id: c.id.toString(),
            label: `${c.firstName} ${c.lastName}`,
            score: c.behavioralScore,
          }))}
        />
      </section>
    </>
  );
};

// — UI Helpers —

function StatCard({
  icon,
  label,
  value,
  gradient,
  highlight,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  highlight?: boolean;
  trend?: { diff: number; pct: number } | null;
}) {
  const arrow = trend ? (
    trend.pct > 0 ? (
      <TrendingUp className="text-green-300 inline-block ml-2" />
    ) : (
      <TrendingDown className="text-red-300 inline-block ml-2" />
    )
  ) : null;

  return (
    <div
      className={`
      bg-gradient-to-r ${gradient}
      p-6 rounded-xl shadow-lg transform-gpu hover:scale-105 transition
      ${highlight ? "ring-4 ring-yellow-400" : ""}
    `}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm opacity-80">{label}</span>
        <span className="text-3xl font-bold flex items-center">
          {value}
          {arrow}
        </span>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
  );
}

function TopList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: { id: string; label: string; score: number }[];
}) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={it.id}
            className="flex justify-between hover:bg-zinc-800 p-2 rounded transition"
          >
            <Link
              href={`/clients/${it.id}`}
              className="text-blue-400 hover:underline focus:outline focus:ring-2 focus:ring-blue-400 rounded"
            >
              {i + 1}. {it.label}
            </Link>
            <span className="font-medium">{it.score}/100</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
