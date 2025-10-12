import os from 'node:os';
import { join } from 'node:path';

export function useFileUtils() {
    const runtimeConfig = useRuntimeConfig();
    const isDevelopment = runtimeConfig.public.env !== 'production';
    const allowedRoots: Record<string, string> = {
        media: isDevelopment ? join(os.homedir(), 'Movies') : '/media',
        share: '/share',
        home: os.homedir(),
    };

    return {
        allowedRoots,
    };
}