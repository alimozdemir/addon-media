<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'
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
const downloadState = ref<'pending' | 'downloading' | 'completed' | 'failed' | null>(null)
const downloadProgress = ref<number>(0)
let statusInterval: ReturnType<typeof setInterval> | null = null

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
                downloadState.value = null
                downloadProgress.value = 0
                clearStatusInterval()
                return
            }

            const status = (res as any)._data as { state: 'pending' | 'downloading' | 'completed' | 'failed'; progress?: number; error?: string }
            downloadState.value = status.state
            downloadProgress.value = typeof status.progress === 'number' ? status.progress : downloadProgress.value
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
    if (isSeries.value) return
    if (typeof window === 'undefined') return
    try {
        const stored = sessionStorage.getItem(storageKeyForItem())
        if (stored) {
            startPolling(stored)
        }
    } catch {}
})

onBeforeUnmount(() => {
    clearStatusInterval()
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
        await $fetch('/api/files/download', { method: 'POST', body: payload })
    } catch (e) {
        // swallow for now; optionally surface a toast
        console.error(e)
    }
}
</script>

<template>
    <Header :item="item">
        <div v-if="isSeries" class="space-y-3">
            <SeasonTabs :seasons="seasonNumbers" v-model:selected="selectedSeason" />
            <EpisodeList :episodes="currentEpisodes" v-model:selected-keys="selectedKeys" />
        </div>
    </Header>

    <ActionBar
        :is-series="isSeries"
        :selected-episodes="selectedEpisodes"
        :selected-season="selectedSeason"
        :download-state="downloadState"
        :download-progress="downloadProgress"
        @download="handleDownload"
        @clear="clearSelections"
    />
</template>


