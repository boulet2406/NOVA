import type { CollectionConfig } from "payload";

export const ActionPlan: CollectionConfig = {
  slug: "action-plan",
  labels: { singular: "Plan d'action", plural: "Plans d'action" },
  admin: {
    useAsTitle: "reference",
    description: "Plans d'action",
    group: "Data",
    defaultColumns: [
      "reference",
      "title",
      "owner",
      "dueDate",
      "priority",
      "status",
      "progress",
    ],
  },
  fields: [
    {
      name: "reference",
      label: "Référence",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "title",
      label: "Nom",
      type: "text",
      required: true,
    },
    {
      name: "owner",
      label: "Responsable",
      type: "text",
      required: true,
    },
    {
      name: "dueDate",
      label: "Date d'échéance",
      type: "date",
      required: true,
    },
    {
      name: "priority",
      label: "Priorité",
      type: "select",
      options: ["Low", "Medium", "High", "Urgent"],
      required: true,
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      options: ["Not started", "In progress", "Completed", "Blocked"],
      defaultValue: "Not started",
      required: true,
    },
    {
      name: "progress",
      label: "Progression",
      type: "number",
      min: 0,
      max: 100,
      defaultValue: 0,
      required: true,
    },
    {
      name: "comments",
      label: "Commentaires",
      type: "number",
      min: 0,
      defaultValue: 0,
      required: true,
    },
  ],
};
