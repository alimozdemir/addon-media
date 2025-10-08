import { existsSync, readFileSync } from "node:fs";

export default defineEventHandler(async (event) => {

    const path = "/data/options.json";

    if (!existsSync(path)) {

        const config = useRuntimeConfig();
        return {
            playlist_url: config.public.playlistUrl,
        };
    }

    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);

    return parsed;
});
