import { getPayload } from "payload";
import config from "@payload-config";

export async function getActionPlans() {
    const payload = await getPayload({ config });
    const actionPlans = await payload.find({
        collection: "action-plan",
        depth: 1,
        page: 1,
        limit: 10,
        pagination: false,
        sort: "createdAt",
    });

    return actionPlans;
}
