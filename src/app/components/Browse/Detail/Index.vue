<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'
import type { Progress } from '~~/types/progress'
import Header from './Header.vue'
import SeasonTabs from './SeasonTabs.vue'
import EpisodeList from './EpisodeList.vue'
import ActionBar from './ActionBar.vue'

const props = defineProps<{ item: PlaylistEntry }>()

const isSeries = computed(() => props.item?.movieType === 'tv-series' && Array.isArray(props.item?.seasons) && props.item.seasons!.length > 0)
const seasonNumbers = computed(() => isSeries.value ? props.item.seasons!.map(s => s.number) : [])
const selectedSeason = ref<string | null>(null)

watchEffect(() => {
    if (!isSeries.value) {
        selectedSeason.value = null
        return
    }
    if (!selectedSeason.value) selectedSeason.value = seasonNumbers.value[0] || null
})

const currentEpisodes = computed(() => {
    if (!isSeries.value || !selectedSeason.value) return [] as PlaylistEntry[]
    const season = props.item.seasons!.find(s => s.number === selectedSeason.value)
    return season?.episodes || []
})

const selectedKeys = ref<string[]>([])

const selectedEpisodes = computed(() => {
    const keys = new Set(selectedKeys.value)
    return currentEpisodes.value.filter(ep => keys.has(`${ep.title}|${ep.url}`))
})

// Download tracking for movies (non-series)
const jobId = ref<string | null>(null)
const progress = ref<Progress | null>(null)
let statusInterval: ReturnType<typeof setInterval> | null = null

// Download tracking for series (per-episode)
const jobIdsByEpisode = ref<Record<string, string>>({})
const episodeProgressMap = ref<Record<string, Progress>>({})
let seriesInterval: ReturnType<typeof setInterval> | null = null

function storageKeyForItem() {
    return `downloadJob:${props.item?.url || props.item?.title}`
}

function clearStatusInterval() {
    if (statusInterval) {
        clearInterval(statusInterval)
        statusInterval = null
    }
}

function startPolling(id: string) {
    clearStatusInterval()
    jobId.value = id
    if (typeof window !== 'undefined') {
        try { sessionStorage.setItem(storageKeyForItem(), id) } catch {}
    }
    statusInterval = setInterval(async () => {
        try {
            const res = await $fetch.raw(`/api/files/status/${id}`)
            // If server returns 204 or an empty body, treat as no status and clear session key
            if ((res && res.status === 204) || !(res && (res as any)._data)) {
                if (typeof window !== 'undefined') {
                    try { sessionStorage.removeItem(storageKeyForItem()) } catch {}
                }
                jobId.value = null
                progress.value = null
                clearStatusInterval()
                return
            }

            const status = (res as any)._data as Progress
            progress.value = status
            if (status.state === 'completed' || status.state === 'failed') {
                clearStatusInterval()
                if (typeof window !== 'undefined') {
                    try { sessionStorage.removeItem(storageKeyForItem()) } catch {}
                }
            }
        } catch (err) {
            // Stop polling on failures (keep session key; may retry on next mount)
            clearStatusInterval()
        }
    }, 1000)
}

onMounted(() => {
    if (typeof window === 'undefined') return
    if (!isSeries.value) {
        try {
            const stored = sessionStorage.getItem(storageKeyForItem())
            if (stored) {
                startPolling(stored)
            }
        } catch {}
        return
    }
    // For series: resume any stored episode job mappings
    try {
        const raw = sessionStorage.getItem(seriesStorageKey())
        if (raw) {
            const parsed = JSON.parse(raw || '{}') as Record<string, string>
            jobIdsByEpisode.value = parsed || {}
            if (Object.keys(jobIdsByEpisode.value).length > 0) startSeriesPolling()
        }
    } catch {}
})

onBeforeUnmount(() => {
    clearStatusInterval()
    clearSeriesInterval()
})

function clearSelections() {
    selectedKeys.value = []
}

async function handleDownload() {
    try {
        if (!isSeries.value) {
            const payload: PlaylistEntry = {
                title: props.item.title,
                url: props.item.url,
                groupTitle: props.item.groupTitle,
                groupTitleRaw: props.item.groupTitleRaw,
                logo: props.item.logo,
                movieType: props.item.movieType || 'film',
            }
            const { jobId: id } = await $fetch<{ jobId: string }>('/api/files/download', { method: 'POST', body: payload })
            if (id) startPolling(id)
            return
        }

        const season = selectedSeason.value
        if (!season) return

        const episodesToDownload = (selectedEpisodes.value.length > 0 ? selectedEpisodes.value : currentEpisodes.value)
            .filter(ep => !!ep.url)
            .map(ep => ({
                title: ep.title,
                url: ep.url,
                groupTitle: ep.groupTitle,
                groupTitleRaw: ep.groupTitleRaw,
                logo: ep.logo,
            })) as PlaylistEntry[]

        if (episodesToDownload.length === 0) return

        const payload = {
            title: props.item.title,
            groupTitle: props.item.groupTitle,
            groupTitleRaw: props.item.groupTitleRaw,
            logo: props.item.logo,
            movieType: 'tv-series' as const,
            seasons: [
                { number: season, episodes: episodesToDownload },
            ],
        }
        const resp = await $fetch<{ jobIds?: string[]; queued?: number }>('/api/files/download', { method: 'POST', body: payload })
        const returned = Array.isArray(resp?.jobIds) ? resp.jobIds : []
        if (returned && returned.length > 0) {
            // Map jobIds to episodes by order (truncate to shortest length to be safe)
            const limit = Math.min(episodesToDownload.length, returned.length)
            for (let i = 0; i < limit; i++) {
                const ep = episodesToDownload[i]
                const id = returned[i]
                if (!ep || !id) continue
                const key = `${ep.title}|${ep.url}`
                jobIdsByEpisode.value[key] = id
            }
            // Persist and start polling
            persistSeriesJobs()
            startSeriesPolling()
        }
    } catch (e) {
        // swallow for now; optionally surface a toast
        console.error(e)
    }
}

function seriesStorageKey() {
    return `downloadJobs:${props.item?.url || props.item?.title}`
}

function persistSeriesJobs() {
    if (typeof window === 'undefined') return
    try { sessionStorage.setItem(seriesStorageKey(), JSON.stringify(jobIdsByEpisode.value || {})) } catch {}
}

function clearSeriesInterval() {
    if (seriesInterval) {
        clearInterval(seriesInterval)
        seriesInterval = null
    }
}

function maybeCleanupSeriesStorage() {
    if (typeof window === 'undefined') return
    if (Object.keys(jobIdsByEpisode.value || {}).length === 0) {
        try { sessionStorage.removeItem(seriesStorageKey()) } catch {}
    } else {
        persistSeriesJobs()
    }
}

function startSeriesPolling() {
    if (seriesInterval) return
    seriesInterval = setInterval(async () => {
        const entries = Object.entries(jobIdsByEpisode.value || {})
        if (entries.length === 0) {
            clearSeriesInterval()
            maybeCleanupSeriesStorage()
            return
        }
        await Promise.all(entries.map(async ([epKey, id]) => {
            try {
                const res = await $fetch.raw(`/api/files/status/${id}`)
                if ((res && res.status === 204) || !(res && (res as any)._data)) {
                    // No status -> remove mapping
                    delete jobIdsByEpisode.value[epKey]
                    delete episodeProgressMap.value[epKey]
                    return
                }
                const status = (res as any)._data as Progress
                episodeProgressMap.value[epKey] = status
                if (status.state === 'completed' || status.state === 'failed') {
                    // Stop tracking this job id but keep final progress in map
                    delete jobIdsByEpisode.value[epKey]
                }
            } catch {
                // transient failure; stop tracking this id for now
                delete jobIdsByEpisode.value[epKey]
            }
        }))
        maybeCleanupSeriesStorage()
    }, 1000)
}

const seriesProgressPercent = computed(() => {
    const values = Object.values(episodeProgressMap.value || {})
    if (values.length === 0) return null
    const sum = values.reduce((acc, p) => acc + (p.progress || 0), 0)
    return Math.round(sum / values.length)
})

const seriesState = computed(() => {
    const values = Object.values(episodeProgressMap.value || {})
    if (values.length === 0) return null
    if (values.every(v => v.state === 'completed')) return 'completed' as const
    if (values.some(v => v.state === 'downloading' || v.state === 'pending')) return 'downloading' as const
    if (values.some(v => v.state === 'failed')) return 'failed' as const
    return 'downloading' as const
})
</script>

<template>
    <Header :item="item">
        <div v-if="isSeries" class="space-y-3">
            <SeasonTabs :seasons="seasonNumbers" v-model:selected="selectedSeason" />
            <EpisodeList :episodes="currentEpisodes" v-model:selected-keys="selectedKeys" :progress-map="episodeProgressMap" />
        </div>
    </Header>

    <ActionBar
        :is-series="isSeries"
        :selected-episodes="selectedEpisodes"
        :selected-season="selectedSeason"
        :progress="progress"
        :series-percent="seriesProgressPercent"
        :series-state="seriesState"
        @download="handleDownload"
        @clear="clearSelections"
    />
</template>


