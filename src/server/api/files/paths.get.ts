// @ts-nocheck
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import os from 'node:os';

type FileEntry = {
    name: string;
    path: string;
    absolutePath: string;
    type: 'file' | 'directory' | 'symlink' | 'other';
};

type SimpleDirent = {
    name: string;
    isDirectory: () => boolean;
    isFile: () => boolean;
    isSymbolicLink: () => boolean;
};

async function getHomeRootPaths(): Promise<FileEntry[]> {
    const homeDir = os.homedir();
    const dirents = (await readdir(homeDir, { withFileTypes: true })) as unknown as SimpleDirent[];

    const entries = dirents.map((dirent: SimpleDirent) => {
        let type: FileEntry['type'] = 'other';
        if (dirent.isDirectory()) type = 'directory';
        else if (dirent.isFile()) type = 'file';
        else if (dirent.isSymbolicLink()) type = 'symlink';

        const absolutePath = join(homeDir, dirent.name);
        const tildePath = join('~', dirent.name).replace(/\\/g, '/');

        return {
            name: dirent.name,
            path: tildePath,
            absolutePath,
            type,
        };
    });

    entries.sort((a: FileEntry, b: FileEntry) => a.name.localeCompare(b.name));
    return entries;
}

export default defineEventHandler(async (event) => {
    try {
        const paths = await getHomeRootPaths();
        return { root: '~', paths };
    } catch (error) {
        return {
            root: '~',
            paths: [],
            error: (error as Error).message,
        };
    }
});