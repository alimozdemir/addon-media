import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { FileEntry } from '~~/types/files';

type SimpleDirent = {
    name: string;
    isDirectory: () => boolean;
    isFile: () => boolean;
    isSymbolicLink: () => boolean;
};

async function listDirEntries(baseDir: string, visibleRootLabel: string): Promise<FileEntry[]> {
    const dirents = (await readdir(baseDir, { withFileTypes: true })) as unknown as SimpleDirent[];

    const entries = dirents.map((dirent: SimpleDirent) => {
        let type: FileEntry['type'] = 'other';
        if (dirent.isDirectory()) type = 'directory';
        else if (dirent.isFile()) type = 'file';
        else if (dirent.isSymbolicLink()) type = 'symlink';

        const absolutePath = join(baseDir, dirent.name);
        const apiPath = join(visibleRootLabel, dirent.name).replace(/\\/g, '/');

        return {
            name: dirent.name,
            path: apiPath,
            absolutePath,
            type,
        };
    });

    entries.sort((a: FileEntry, b: FileEntry) => a.name.localeCompare(b.name));
    return entries;
}

export default defineEventHandler(async (event) => {
    const utils = useFileUtils();
    try {
        const query = getQuery(event) as { path?: string };

        // Require a single "path" param that includes root and optional subpath. e.g. "media/Tv" or "home/Media"
        const pathParamRaw = (query.path || '').replace(/\\/g, '/');
        if (!pathParamRaw) {
            return {
                root: '',
                paths: [],
                error: `Missing 'path' query parameter. Use one of roots: ${Object.keys(utils.allowedRoots).join(', ')} (e.g., path=media or path=home/Documents)`,
            };
        }
        const [rawRootKey, ...rootRemainderParts] = pathParamRaw.split('/').filter(Boolean);
        const rootKey = (rawRootKey || 'media').toLowerCase();

        if (!Object.prototype.hasOwnProperty.call(utils.allowedRoots, rootKey)) {
            return {
                root: rootKey,
                paths: [],
                error: `Invalid root. Use one of: ${Object.keys(utils.allowedRoots).join(', ')}`,
            };
        }

        const baseDir = utils.allowedRoots[rootKey];

        const remainderFromRoot = rootRemainderParts.join('/');
        const combinedSubpath = remainderFromRoot;

        const requestedDir = resolve(join(baseDir, combinedSubpath));

        // Prevent path traversal outside the baseDir
        if (!requestedDir.startsWith(resolve(baseDir))) {
            return { root: rootKey, paths: [], error: 'Path traversal is not allowed' };
        }

        const displaySubpath = combinedSubpath ? combinedSubpath.replace(/\\/g, '/') : '';
        const visibleRootLabel = displaySubpath
            ? (rootKey === 'home' ? `~/${displaySubpath}` : `/${rootKey}/${displaySubpath}`)
            : (rootKey === 'home' ? '~' : `/${rootKey}`);

        const paths = await listDirEntries(requestedDir, visibleRootLabel);
        return { root: visibleRootLabel, current: requestedDir, paths };
    } catch (error) {
        return {
            root: '',
            paths: [],
            error: (error as Error).message,
        };
    }
});