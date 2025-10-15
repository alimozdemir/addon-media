import { createError, readBody } from 'h3';
import { useFileUtils } from '../../utils/useFileUtils';
import { PlaylistEntry } from '~~/app/composables/usePlaylist';
import { startDownload } from '~~/server/plugins/job';
import { dirname, extname, join } from 'node:path';

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



    return { };
})