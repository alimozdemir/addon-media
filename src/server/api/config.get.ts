import { existsSync, readFileSync } from "node:fs";

export default defineEventHandler(async (event) => {

    const path = "data/options.json";

    if (!existsSync(path)) {
        return {
            error: "Options file not found",
        };
    }

    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);

    return parsed;
});
