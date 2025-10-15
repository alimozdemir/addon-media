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
            const { jobId } = await $fetch<{ jobId: string }>('/api/files/download', { method: 'POST', body: payload })
            if (jobId) {
                const  interval = setInterval(async () => {
                    const status = await $fetch<{ state: 'pending' | 'downloading' | 'completed' | 'failed'; progress?: number; error?: string }>(`/api/files/status/${jobId}`)
                    if (status.state === 'completed') {
                        clearInterval(interval)
                    }
                }, 1000)
            }
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

    <ActionBar :is-series="isSeries" :selected-episodes="selectedEpisodes" :selected-season="selectedSeason" @download="handleDownload" @clear="clearSelections" />
</template>


