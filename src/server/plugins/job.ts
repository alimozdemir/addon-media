import PQueue from 'p-queue'
import got from 'got';
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import type { Progress } from '../../types/progress'

export const downloadQueue = new PQueue({
    concurrency: 1, // number of parallel downloads
    autoStart: true
})

// This will hold job statuses in memory
export const jobStatuses = new Map<string, Progress>()

export function startDownload(url: string, path: string) {
    const jobId = crypto.randomUUID();

    jobStatuses.set(jobId, { state: 'pending' });

    downloadQueue.add(async () => {
        jobStatuses.set(jobId, { state: 'downloading', progress: 0 })

        const stream = got.stream(url)
        let downloaded = 0
        let total = 0

        stream.on('downloadProgress', (progress) => {
            if (progress.total) total = progress.total
            downloaded = progress.transferred
            const percent = total ? Math.round((downloaded / total) * 100) : 0
            jobStatuses.set(jobId, { state: 'downloading', progress: percent, total, downloaded })
        })

        await pipeline(stream, createWriteStream(path))
        jobStatuses.set(jobId, { state: 'completed', progress: 100, total, downloaded: total || downloaded })
    })

    return jobId;
}

export default defineNitroPlugin(() => {
    // Nothing else needed — queue is a singleton for the server
})