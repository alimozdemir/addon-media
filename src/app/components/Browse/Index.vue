<script setup lang="ts">
import TopBar from './TopBar.vue'
import Results from './Results.vue'
import { useSearch } from '~/composables/useSearch'
import { usePlaylist, type PlaylistEntry } from '~/composables/usePlaylist'

const search = useSearch()
const playlist = usePlaylist()

const query = ref('')
const loading = ref(false)
const rawResults = ref<PlaylistEntry[]>([])
const filter = ref<'all' | 'film' | 'tv-series'>('all')

const results = computed(() => {
    if (!rawResults.value?.length) return []
    if (filter.value === 'all') return rawResults.value
    return rawResults.value.filter(it => it.movieType === filter.value)
})

watchThrottled(query, async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
        // when clearing query, fall back to all
        rawResults.value = await search.getAll()
        return
    }
    loading.value = true
    try {
        rawResults.value = await search.searchByTitle(trimmed, 100)
    } finally {
        loading.value = false
    }
}, { throttle: 300, trailing: true })

onMounted(async () => {
    // Ensure we have data in the index at least once
    if (!playlist.lastRefreshedAt.value) {
        await playlist.refresh()
    } else {
        // optionally seed index again if empty
        await search.upsertAll([...playlist.movies.value, ...playlist.liveStreams.value])
    }
    rawResults.value = await search.getAll()
})
</script>
<template>
    <section>
        <TopBar v-model:query="query" v-model:filter="filter" />

        <Results :items="results" :loading="loading" />
    </section>
</template>
