"use client";

// pages/action.tsx
import React, { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  MessageCircle,
} from "lucide-react";

import type { ActionPlan } from "@/payload-types";

const statuses = [
  "All",
  "Not started",
  "In progress",
  "Completed",
  "Blocked",
] as const;

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export default function ActionPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<(typeof statuses)[number]>("All");

  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/action-plan`,
    fetcher
  );

  const actionPlans = useMemo(() => {
    if (error || !data || !("docs" in data)) return [];
    return data.docs as ActionPlan[];
  }, [data, error]);

  const filtered = useMemo(() => {
    return actionPlans.filter((plan) => {
      const text =
        `${plan.reference} ${plan.title} ${plan.owner}`.toLowerCase();
      const matchText = text.includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "All" || plan.status === filterStatus;
      return matchText && matchStatus;
    });
  }, [search, filterStatus, actionPlans]);

  if (!actionPlans || actionPlans.length === 0) return <></>;

  return (
    <main className="mx-auto px-6 py-8 space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          Suivi des plans d&apos;action
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative flex items-center">
            <Filter className="absolute left-3 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilterStatus(e.target.value as (typeof statuses)[number])
              }
              className="pl-10 pr-4 py-2 w-full sm:w-48 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 dark:bg-zinc-700">
            <tr>
              {[
                "ID",
                "Titre",
                "Responsable",
                "Créé le",
                "Échéance",
                "Dernière MAJ",
                "Priorité",
                "Statut",
                "Avancement",
                "Commentaires",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filtered.map((plan) => (
              <tr
                key={plan.reference}
                className="hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <td className="px-4 py-3 text-sm font-mono">
                  {plan.reference}
                </td>
                <td className="px-4 py-3 text-sm">{plan.title}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} /> {plan.owner}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />{" "}
                    {new Date(plan.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />{" "}
                    {new Date(plan.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} />{" "}
                    {new Date(plan.updatedAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{plan.priority}</td>
                <td className="px-4 py-3 text-sm">
                  {plan.status === "Completed" ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} /> {plan.status}
                    </span>
                  ) : plan.status === "Blocked" ? (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle size={16} /> {plan.status}
                    </span>
                  ) : (
                    <span className="text-yellow-500">{plan.status}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        plan.progress === 100
                          ? "bg-green-500"
                          : plan.progress >= 50
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${plan.progress}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {plan.progress}%
                  </p>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} /> {plan.comments}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucune action trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
