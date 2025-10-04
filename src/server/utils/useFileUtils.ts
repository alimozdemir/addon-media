import os from 'node:os';

export function useFileUtils() {
    const allowedRoots: Record<string, string> = {
        media: '/media',
        share: '/share',
        home: os.homedir(),
    };

    return {
        allowedRoots,
    };
}