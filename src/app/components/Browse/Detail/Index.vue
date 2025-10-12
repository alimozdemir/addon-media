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

function triggerDownload(url: string, filename?: string) {
    try {
        const a = document.createElement('a')
        a.href = url
        if (filename) a.download = filename
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        a.remove()
    } catch {
        window.open(url, '_blank')
    }
}

function handleDownload() {
    if (!isSeries.value) {
        if (props.item?.url) triggerDownload(props.item.url)
        return
    }
    if (selectedEpisodes.value.length > 0) {
        for (const ep of selectedEpisodes.value) {
            if (ep.url) triggerDownload(ep.url)
        }
        return
    }
    for (const ep of currentEpisodes.value) {
        if (ep.url) triggerDownload(ep.url)
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


