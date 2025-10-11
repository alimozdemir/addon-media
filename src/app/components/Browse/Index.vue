<script setup lang="ts">
import SearchInput from './SearchInput.vue'
import Results from './Results.vue'
import { useSearch } from '~/composables/useSearch'
import { usePlaylist, type PlaylistEntry } from '~/composables/usePlaylist'

const search = useSearch()
const playlist = usePlaylist()

const query = ref('')
const loading = ref(false)
const results = ref<PlaylistEntry[]>([])

watchThrottled(query, async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
        results.value = []
        return
    }
    loading.value = true
    try {
        results.value = await search.searchByTitle(trimmed, 100)
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
})
</script>
<template>
    <section>
        <SearchInput v-model="query" />
        <Results :items="results" :loading="loading" />
    </section>
</template>
