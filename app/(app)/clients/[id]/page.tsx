"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText,
  Info as InfoIcon,
  Award,
  Bell,
  MessageCircle,
  RefreshCw,
  HelpCircle,
  ChevronUp,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { toLocaleDate } from "@/lib/utils";
import { generateClientReport } from "@/lib/clientReport";
import { Accordion } from "@/components/Accordion";
import { Badge } from "@/components/Badge";

import type { Client } from "@/payload-types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientPage() {
  const { id } = useParams();
  const { user } = useUser();

  const {
    data: client,
    error,
    isLoading,
  } = useSWR<Client>(
    id ? `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/client/${id}` : null,
    fetcher
  );

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<NonNullable<Client["comments"]>>([]);

  const [status, setStatus] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (client?.status) {
      setStatus(client.status);
    }
    if (client?.comments) {
      setComments(client.comments);
    }
  }, [client]);

  // Raccourcis clavier Alt+R / Alt+A / Alt+V
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.shiftKey) return;
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        saveComment("Abandon");
      }
      if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        saveComment("Déclaration de soupçon");
      }
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        saveComment("Blocage");
      }
      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        saveComment();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [comment, comments, status]);

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement du client</p>;
  if (!client) return <p>Client introuvable</p>;

  const saveComment = async (newStatus?: string) => {
    const txt = newStatus ?? comment.trim();
    if (!txt || !id || !user?.email) return;

    const now = new Date();
    const newComment = {
      commentDate: now.toISOString(),
      user: user.id,
      value: txt,
    };

    const updatedComments = [newComment, ...(comments || [])];
    const updatedStatus = newStatus ?? status;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/client/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comments: updatedComments,
            status: updatedStatus,
          }),
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedClient = await res.json();
      setComments(updatedClient.comments ?? []);
      setStatus(updatedClient.status ?? "");
      setComment("");

      await mutate(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/client/${id}`);

      toast.success("Commentaire enregistré");
    } catch (err) {
      console.error(err);
      toast.error("Échec de la mise à jour du client");
    }
  };

  const exportPDF = () => {
    const pdf = generateClientReport(client, comments, status, auditTrail);
    pdf.save(`fiche-client-${client.id}.pdf`);
  };

  // À l’intérieur de ClientPage, avec les autres useState
  const auditTrail = JSON.parse(localStorage.getItem("audit_trail") || "[]");

  const scoreHistory = client.scoreHistory ?? [];
  const scoringDetails = client.scoringDetails ?? [];

  const opScore =
    scoreHistory.length === 0
      ? 0
      : Math.round(
          scoreHistory.reduce((s, a) => s + (a.score ?? 0), 0) /
            scoreHistory.length
        );

  const chartData = scoreHistory.map(({ scoreDate, score }) => ({
    date: toLocaleDate(scoreDate),
    score,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-auto">
      <Toaster position="bottom-right" />

      <main
        className="p-6 w-full grid gap-8"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {/* Col 1 */}
        <div className="space-y-8">
          <Card>
            <div className="flex items-center gap-1">
              <InfoIcon
                className="h-5 w-5 text-zinc-400"
                role="img"
                aria-label="Info"
              />
              <p className="text-zinc-400 text-sm">
                ID : {client.id}
                <HelpCircle
                  className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                  role="img"
                  aria-label="Identifiant unique du client"
                />
              </p>
            </div>
            <p className="text-lg font-semibold">
              {client.firstName} {client.lastName} –{" "}
              {toLocaleDate(client.birthDate)}
            </p>

            <Badge
              variant={
                status === "Abandon"
                  ? "Abandon"
                  : status === "Déclaration de soupçon"
                  ? "Déclaration de soupçon"
                  : status === "Blocage"
                  ? "Blocage"
                  : "default"
              }
            >
              {status}
            </Badge>
          </Card>

          <Accordion
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award
                    className="h-5 w-5 text-green-400"
                    role="img"
                    aria-label="Scoring Client"
                  />
                  <span className="text-sm font-semibold uppercase text-zinc-400">
                    Scoring Client
                  </span>
                  <HelpCircle
                    className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                    role="img"
                    aria-label="Note AML calculée automatiquement"
                  />
                </div>
                <span className="text-lg font-bold text-green-400">
                  {client.riskScore}/100
                </span>
              </div>
            }
            defaultOpen={true}
          >
            <List
              items={scoringDetails.map((d) => ({
                label: d.label ?? "",
                value: `${(d.value ?? 0) >= 0 ? "+" : ""}${d.value}`,
              }))}
            />
          </Accordion>

          <Accordion
            defaultOpen={false}
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <InfoIcon
                    className="h-5 w-5 text-cyan-400"
                    role="img"
                    aria-label="Informations"
                  />
                  <span className="text-sm font-semibold uppercase text-zinc-400">
                    Informations
                  </span>
                  <HelpCircle
                    className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                    role="img"
                    aria-label="Détails KYC & fonds"
                  />
                </div>
                {/* Ici pas de valeur à afficher à droite, donc on peut laisser vide ou ajouter un chevron */}
              </div>
            }
          >
            <InfoRow label="Pays" value={client.country ?? ""} />
            <InfoRow label="Profession" value={client.profession ?? ""} />
            <InfoRow label="Fonds" value={client.fundsSource ?? ""} />
            <InfoRow label="Paiement" value={client.paymentMethod ?? ""} />
            <InfoRow
              label="KYC validé"
              value={client.kycValidated ? "Oui" : "Non"}
            />
            <InfoRow label="PEP" value={client.pep ? "Oui" : "Non détecté"} />
          </Accordion>
        </div>

        {/* Col 2 */}
        <div className="space-y-8">
          <div ref={chartRef}>
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase text-zinc-400">
                  Score Opérationnel
                  <HelpCircle
                    className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                    role="img"
                    aria-label="Moyenne opérationnelle"
                  />
                </h2>
                <span className="text-lg font-bold text-cyan-400">
                  {opScore}/100
                </span>
              </div>
              <div className="h-40 bg-zinc-800 p-2 rounded">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" stroke="#ccc" fontSize={12} />
                    <YAxis domain={[60, 100]} stroke="#ccc" fontSize={12} />
                    <Tooltip />
                    <Line
                      dataKey="score"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Accordion
            defaultOpen={false}
            title={
              <div className="flex items-center gap-2">
                <Bell
                  className="h-5 w-5 text-yellow-400"
                  role="img"
                  aria-label="Alertes comportementales"
                />
                <span className="text-sm font-semibold uppercase text-zinc-400">
                  Scoring Alerting
                </span>
                <HelpCircle
                  className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                  role="img"
                  aria-label="Indicateurs d’activité"
                />
              </div>
            }
          >
            <List
              items={[
                {
                  label: "Jeux à risque",
                  value: client.behaviorIndicators?.riskyGames ?? 0,
                },
                {
                  label: "Vitesse",
                  value: client.behaviorIndicators?.gameSpeed ?? 0,
                },
                {
                  label: "Dernière IP",
                  value: client.behaviorIndicators?.lastIPChange ?? 0,
                },
                {
                  label: "Device",
                  value: client.behaviorIndicators?.unusualDevice ?? 0,
                },
                {
                  label: "Tiers payant",
                  value: client.behaviorIndicators?.thirdPartyPayer
                    ? "Oui"
                    : "Non",
                },
              ]}
            />
          </Accordion>
        </div>

        {/* Col 3 */}
        <div className="space-y-8 relative">
          <Card>
            <div className="flex items-center gap-2">
              <Bell
                className="h-5 w-5 text-red-400"
                role="img"
                aria-label="Alertes"
              />
              <h2 className="text-sm font-semibold uppercase text-zinc-400">
                Historique Alertes
                <HelpCircle
                  className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                  role="img"
                  aria-label="Toutes les alertes précédentes"
                />
              </h2>
            </div>
            <ul className="text-sm text-zinc-300 space-y-1">
              {client.alerts && client.alerts.length > 0 ? (
                client.alerts.map((msg, i) => <li key={i}>⚠️ {msg.message}</li>)
              ) : (
                <li>Aucune alerte</li>
              )}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <MessageCircle
                className="h-5 w-5 text-blue-300"
                role="img"
                aria-label="Commentaires"
              />
              <h2 className="text-sm font-semibold uppercase text-zinc-400">
                Commentaires Analystes
                <HelpCircle
                  className="inline-block h-4 w-4 ml-1 text-zinc-500 hover:text-zinc-300"
                  role="img"
                  aria-label="Ajoutez votre retour"
                />
              </h2>
            </div>

            {/* zone de saisie */}
            <textarea
              className="w-full bg-zinc-800 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
              rows={3}
              maxLength={250}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Votre commentaire…"
              aria-label="Saisissez votre commentaire"
            />
            <div className="text-xs text-zinc-400">{comment.length}/250</div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => saveComment("Abandon")}
                className="bg-green-600 px-3 py-1 rounded focus:ring-2 focus:ring-green-400 transition-colors"
              >
                Abandon
              </button>
              <button
                onClick={() => saveComment("Déclaration de soupçon")}
                className="bg-orange-600 px-3 py-1 rounded focus:ring-2 focus:ring-orange-400 transition-colors"
              >
                Déclaration de soupçon
              </button>
              <button
                onClick={() => saveComment("Blocage")}
                className="bg-red-600 px-3 py-1 rounded focus:ring-2 focus:ring-red-400 transition-colors"
              >
                Blocage
              </button>
              <button
                onClick={() => saveComment()}
                className="bg-blue-600 px-3 py-1 rounded flex items-center gap-1 focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                <RefreshCw
                  className="h-4 w-4"
                  role="img"
                  aria-label="Valider"
                />
                Valider
              </button>
              <button
                onClick={exportPDF}
                className="bg-zinc-700 px-3 py-1 rounded flex items-center gap-1 focus:ring-2 focus:ring-zinc-500 transition-colors"
              >
                <FileText
                  className="h-4 w-4"
                  role="img"
                  aria-label="Export PDF"
                />
                Export PDF
              </button>
            </div>

            <ul
              className="text-sm text-zinc-300 mt-2 space-y-1"
              aria-live="polite"
            >
              {comments?.map((c, i) => (
                <li key={i}>
                  📝 {toLocaleDate(c.commentDate, true)} — (
                  {typeof c.user === "object" &&
                  c.user !== null &&
                  "email" in c.user
                    ? c.user.email
                    : `Utilisateur #${c.user}`}
                  ) {c.value}
                </li>
              ))}
            </ul>
          </Card>

          {/* bouton remonter */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-indigo-600 p-2 rounded-full shadow-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 transition-colors"
            aria-label="Remonter en haut"
          >
            <ChevronUp
              className="h-5 w-5 text-white"
              role="img"
              aria-label="Haut"
            />
          </button>
        </div>
      </main>
    </div>
  );
}

// Utilitaires

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-zinc-900 p-4 rounded-lg space-y-2">{children}</div>;
}

function List({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <ul className="text-sm text-zinc-300 space-y-1">
      {items.map((it, i) => (
        <li key={i} className="flex justify-between">
          <span>{it.label}</span>
          <span>{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
