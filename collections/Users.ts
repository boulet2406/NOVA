import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
    slug: "users",
    admin: {
        useAsTitle: "email",
    },
    auth: true,
    fields: [
        {
            name: "firstName",
            label: "Prénom",
            type: "text",
            required: true,
        },
    ],
};
