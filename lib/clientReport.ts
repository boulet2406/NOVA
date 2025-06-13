// lib/clientReport.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Client } from "@/payload-types";

export interface AuditEntry {
  date: string;
  time: string;
  user: string;
  action: string;
  details?: string;
}

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Génère un PDF-report pour un client donné.
 * @param client Les données du client
 * @param comments Les commentaires enregistrés
 * @param statusstatuses Les statuts par client
 * @param auditTrail La liste des événements audit
 */
export function generateClientReport(
  client: Client,
  comments: Client["comments"],
  status: string,
  auditTrail: AuditEntry[]
): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" }) as jsPDFWithAutoTable;
  const pageWidth = pdf.internal.pageSize.getWidth();

  // --- Header ---
  pdf.setFontSize(18);
  pdf.text(`Fiche Client ${client.id}`, pageWidth / 2, 15, {
    align: "center",
  });
  pdf.setFontSize(11);
  pdf.text(`Généré le ${new Date().toLocaleString()}`, pageWidth - 20, 20, {
    align: "right",
  });

  // --- Section Identité ---
  pdf.setFontSize(14);
  pdf.text("1. Identité & statut", 14, 30);
  pdf.setFontSize(11);
  pdf.text(`Nom      : ${client.firstName} ${client.lastName}`, 14, 36);
  pdf.text(`Naissance: ${client.birthDate}`, 14, 42);
  pdf.text(`Statut   : ${status ?? "En cours d’analyse"}`, 14, 48);

  // --- Section Scoring AML ---
  pdf.setFontSize(14);
  pdf.text("2. Scoring AML", 14, 58);
  // transform scoringDetails en tableau
  autoTable(pdf, {
    startY: 62,
    head: [["Critère", "Valeur"]],
    body: (client.scoringDetails ?? []).map((d) => [
      d.label ?? "",
      (d.value ?? "").toString(),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 30, 30] },
    margin: { left: 14, right: 14 },
  });

  // --- Section Comportement Opérationnel ---
  let y = (pdf.lastAutoTable?.finalY ?? 0) + 10;
  pdf.setFontSize(14);
  pdf.text("3. Comportement Opérationnel", 14, y);
  y += 4;
  autoTable(pdf, {
    startY: y,
    head: [["Indicateur", "Valeur"]],
    body: [
      ...(client.behaviorIndicators
        ? Object.entries(client.behaviorIndicators).map(([k, v]) => [
            k ?? "",
            v?.toString() ?? "",
          ])
        : []),
      ...(client.behavioralDetails?.map((d) => [
        d.label ?? "",
        (d.value ?? "").toString(),
      ]) || []),
    ],
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // --- Section Alertes ---
  y = (pdf.lastAutoTable?.finalY ?? 0) + 10;
  pdf.setFontSize(14);
  pdf.text("4. Alertes", 14, y);
  y += 4;
  autoTable(pdf, {
    startY: y,
    head: [["Date", "Message", "Statut"]],
    body: client.alerts?.map((a) => [
      a.alertDate ?? "",
      a.message ?? "",
      a.status ?? "",
    ]),
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // --- Section Commentaires Analystes ---
  y = (pdf.lastAutoTable?.finalY ?? 0) + 10;
  pdf.setFontSize(14);
  pdf.text("5. Commentaires Analystes (dernier·es)", 14, y);
  y += 4;
  autoTable(pdf, {
    startY: y,
    head: [["Date", "Utilisateur", "Commentaire"]],
    body: (comments || []).map((c) => [
      c.commentDate,
      typeof c.user === "object" && c.user !== null
        ? `${c.user.email ?? ""}`.trim()
        : c.user?.toString() ?? "",
      c.value,
    ]),

    styles: { fontSize: 10, cellWidth: "wrap" },
    columnStyles: { 3: { cellWidth: 80 } },
    margin: { left: 14, right: 14 },
  });

  // --- Section Audit Trail ---
  y = (pdf.lastAutoTable?.finalY ?? 0) + 10;
  pdf.setFontSize(14);
  pdf.text("6. Audit Trail", 14, y);
  y += 4;
  autoTable(pdf, {
    startY: y,
    head: [["Date", "Heure", "User", "Action", "Détails"]],
    body: auditTrail.map((a) => [
      a.date,
      a.time,
      a.user,
      a.action,
      a.details || "",
    ]),
    styles: { fontSize: 9, cellWidth: "wrap" },
    columnStyles: { 4: { cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  return pdf;
}
