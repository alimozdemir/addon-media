import { createError, readBody } from 'h3';
import { useFileUtils } from '../../utils/useFileUtils';
import { PlaylistEntry } from '~~/app/composables/usePlaylist';
import { startDownload } from '~~/server/plugins/job';
import { dirname, extname, join } from 'node:path';
import { mkdir } from 'node:fs/promises'

function sanitizeName(input: string): string {
    const trimmed = (input || '').trim();
    const replaced = trimmed
        .replace(/[\\/:*?"<>|]/g, ' ') // illegal filename chars
        .replace(/\s+/g, ' ')
        .replace(/\.+$/g, '')
        .trim();
    return replaced || 'untitled';
}


function getUrlExtension(inputUrl: string): string | null {
    const withoutQuery = (inputUrl || '').split('?')[0];
    const dotIdx = withoutQuery.lastIndexOf('.');
    if (dotIdx === -1) return null;
    const ext = withoutQuery.slice(dotIdx + 1).toLowerCase();
    if (!ext || /[\\/]/.test(ext)) return null;
    return ext;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<PlaylistEntry>(event);


    if (!body)
        return { error: 'Invalid body' }


    const { allowedRoots } = useFileUtils();
    const mediaRoot = allowedRoots.media;

    if (body.movieType === 'film') {
        const ext = getUrlExtension(body.url) || 'mp4';
        const fileName = `${sanitizeName(body.title)}.${ext}`;

        const targetPath = join(mediaRoot, fileName);

        const jobId = startDownload(body.url, targetPath);

        return { jobId };
    }

    // Simple tv-series support: queue each provided episode to download into the root folder
    if (body.movieType === 'tv-series') {
        const seasons = (body as any).seasons;
        if (!Array.isArray(seasons)) return { jobIds: [], queued: 0 };

        const jobIds: string[] = [];
        for (const season of seasons) {
            const episodes = Array.isArray(season?.episodes) ? season.episodes : [];
            for (const ep of episodes) {
                if (!ep?.url) continue;
                const title = ep.title || body.title;
                const ext = getUrlExtension(ep.url) || 'mp4';
                const fileName = `${sanitizeName(title)}.${ext}`;
                const seriesDir = sanitizeName(body.title);
                const seasonRaw = `${season?.number ?? ''}`;
                const seasonLabel = `Season ${seasonRaw.padStart(2, '0')}`;
                const targetPath = join(mediaRoot, seriesDir, seasonLabel, fileName);
                await mkdir(dirname(targetPath), { recursive: true });
                const id = startDownload(ep.url, targetPath);
                jobIds.push(id);
            }
        }

        return { jobIds, queued: jobIds.length };
    }



    return { };
})