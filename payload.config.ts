// storage-adapter-import-placeholder
import { postgresAdapter } from "@payloadcms/db-postgres";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { en } from "@payloadcms/translations/languages/en";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import Header from "@/components/Header";
import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { ActionPlan } from "@/collections/action-plan/config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
        // components: {
        //     beforeDashboard: ["/components/Header.tsx#Header"],
        // },
    },
    i18n: {
        supportedLanguages: { fr, en },
        fallbackLanguage: "en",
    },
    collections: [ActionPlan, Users, Media],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || "",
    typescript: {
        outputFile: path.resolve(dirname, "payload-types.ts"),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URI || "",
        },
    }),
    sharp,
    plugins: [
        payloadCloudPlugin(),
        // storage-adapter-placeholder
    ],
});
