import type { CollectionConfig } from "payload";

export const Client: CollectionConfig = {
  slug: "client",
  labels: { singular: "Client", plural: "Clients" },
  admin: {
    useAsTitle: "id",
    description: "Clients",
    group: "Data",
    defaultColumns: [
      "id",
      "firstName",
      "lastName",
      "riskScore",
      "behavioralScore",
      "birthDate",
    ],
  },
  fields: [
    {
      name: "firstName",
      label: "Prénom",
      type: "text",
    },
    {
      name: "lastName",
      label: "Nom",
      type: "text",
    },
    {
      name: "birthDate",
      label: "Date de naissance",
      type: "date",
    },
    {
      name: "riskScore",
      label: "Score de risque",
      type: "number",
      defaultValue: 0,
      required: true,
    },
    {
      name: "behavioralScore",
      label: "Score comportemental",
      type: "number",
      defaultValue: 0,
      required: true,
    },
    {
      name: "country",
      label: "Pays",
      type: "text",
    },
    {
      name: "profession",
      label: "Profession",
      type: "text",
    },
    {
      name: "fundsSource",
      label: "Source des fonds",
      type: "select",
      options: ["Salaire", "Épargne", "Héritage", "Vente bien"],
    },
    {
      name: "paymentMethod",
      label: "Moyen de paiement",
      type: "select",
      options: ["Carte bancaire", "Virement bancaire", "PayPal", "Paysafecard"],
    },
    {
      name: "lastIP",
      label: "Dernière IP",
      type: "text",
    },
    {
      name: "kycValidated",
      label: "KYC Validé",
      type: "checkbox",
      defaultValue: false,
      required: true,
    },
    {
      name: "pep",
      label: "PeP",
      type: "checkbox",
      defaultValue: false,
      required: true,
    },
    {
      name: "scoringDetails",
      label: "Détails du scoring",
      type: "array",
      fields: [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Valeur", type: "number" },
      ],
    },
    {
      name: "behavioralDetails",
      label: "Détails comportementaux",
      type: "array",
      fields: [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Valeur", type: "number" },
      ],
    },
    {
      name: "scoreHistory",
      label: "Historique du score",
      type: "array",
      fields: [
        {
          name: "scoreDate",
          label: "Date",
          type: "date",
        },
        { name: "score", label: "Score", type: "number" },
      ],
    },
    {
      name: "behaviorIndicators",
      label: "Indicateurs comportementaux",
      type: "group",
      fields: [
        {
          name: "riskyGames",
          label: "Jeux à risque",
          type: "number",
          required: true,
          defaultValue: 0,
        },
        {
          name: "gameSpeed",
          label: "Vitesse de jeu",
          type: "number",
          required: true,
          defaultValue: 0,
        },
        {
          name: "lastIPChange",
          label: "Dernier changement d'IP",
          type: "number",
          required: true,
          defaultValue: 0,
        },
        {
          name: "unusualDevice",
          label: "Appareil inhabituel",
          type: "number",
          required: true,
          defaultValue: 0,
        },
        {
          name: "thirdPartyPayer",
          label: "Tiers payant",
          type: "number",
          required: true,
          defaultValue: 0,
        },
      ],
      required: true,
    },
    {
      name: "alerts",
      label: "Alertes",
      type: "array",
      fields: [
        { name: "alertDate", label: "Date", type: "date" },
        { name: "message", label: "Message", type: "text" },
        {
          name: "status",
          label: "Statut",
          type: "select",
          options: ["open", "closed"],
        },
      ],
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      options: ["Abandon", "Déclaration de soupçon", "Blocage", "default"],
      defaultValue: "default",
      required: true,
    },
    {
      name: "comments",
      label: "Commentaires",
      type: "array",
      fields: [
        {
          name: "commentDate",
          label: "Date",
          type: "date",
          admin: {
            date: {
              pickerAppearance: "dayAndTime",
            },
          },
          required: true,
        },
        {
          name: "user",
          label: "Auteur",
          type: "relationship",
          relationTo: "users",
          hasMany: false,
          required: true,
        },
        {
          name: "value",
          label: "Commentaire",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};
