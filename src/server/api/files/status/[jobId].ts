import { jobStatuses } from "~~/server/plugins/job";

export default defineEventHandler(async (event) => {
    const { jobId } = getRouterParams(event);
    if (!jobId) {
        return { error: 'Missing jobId' };
    }
    const status = jobStatuses.get(jobId);
    return status;
});