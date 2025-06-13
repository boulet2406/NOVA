"use client";

import React, { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { stringify } from "qs-esm";
import type { Where } from "payload";

import type { Client } from "@/payload-types";

const ITEMS_PER_PAGE = 10;

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export default function ClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [search]);

  const isNumeric = /^\d+$/.test(debouncedSearch);

  const stringifiedQuery = useMemo(() => {
    const where: Where = {
      or: [
        ...(isNumeric
          ? [{ id: { equals: parseInt(debouncedSearch, 10) } }]
          : []),
        { firstName: { contains: debouncedSearch } },
        { lastName: { contains: debouncedSearch } },
      ],
    };

    return stringify(
      {
        where,
        limit: ITEMS_PER_PAGE,
        page,
      },
      { addQueryPrefix: true }
    );
  }, [debouncedSearch, page]);

  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/client${stringifiedQuery}`,
    fetcher
  );

  const clientsData = useMemo(() => {
    if (error || !data || !("docs" in data))
      return { docs: [], totalPages: 0, totalDocs: 0 };
    return data;
  }, [debouncedSearch, page, data, error]);

  // Export CSV
  const exportClients = () => {
    const headers = [
      "ID",
      "Prénom",
      "Nom",
      "Risk Score",
      "Behavioral Score",
      "Birth Date",
    ];
    const rows = clientsData.docs.map((c: Client) => [
      c.id,
      c.firstName,
      c.lastName,
      c.riskScore.toString(),
      c.behavioralScore.toString(),
      new Date(c.birthDate ?? "").toLocaleDateString(),
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r: string[]) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-white">Liste des clients</h1>
        <button
          onClick={exportClients}
          className="mt-4 sm:mt-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
        >
          Export CSV
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 w-full border rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {["ID", "Prénom", "Nom", "Risk", "Behavioral", "Naissance"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientsData.docs.map((c: Client) => (
              <tr
                key={c.id}
                tabIndex={0}
                onClick={() => router.push(`/clients/${c.id}`)}
                onKeyDown={(e) =>
                  e.key === "Enter" && router.push(`/clients/${c.id}`)
                }
                className="hover:bg-gray-100 cursor-pointer focus:outline-none focus:bg-gray-200"
              >
                <td className="px-4 py-2 text-sm text-gray-700">{c.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {c.firstName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {c.lastName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {c.riskScore}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {c.behavioralScore}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {new Date(c.birthDate ?? "").toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-300">
          Page {page} sur {clientsData.totalPages} ({clientsData.totalDocs}{" "}
          résultats)
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50 text-gray-700"
          >
            Précédent
          </button>
          <button
            onClick={() =>
              setPage((p) => Math.min(p + 1, clientsData.totalPages))
            }
            disabled={page === clientsData.totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50 text-gray-700"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
