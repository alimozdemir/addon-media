import { createError } from "h3";
import getConfig from "../config.get";

export default defineEventHandler(async (event) => {
    const config = await getConfig(event) as { playlist_url?: string };
    const playlistUrl = config.playlist_url;

    if (!playlistUrl) {
        throw createError({
            statusCode: 400,
            statusMessage: "playlist_url is not configured",
        });
    }

    const content = await $fetch<string>(playlistUrl);

    setResponseHeader(event, "cache-control", "public, max-age=360");
    // Optional: set content type to common playlist MIME type
    //event.node.res.setHeader("Content-Type", "application/x-mpegURL; charset=utf-8");

    return content;
});


