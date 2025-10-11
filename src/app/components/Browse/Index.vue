<script setup lang="ts">
import TopBar from './TopBar.vue'
import GroupFilter from './GroupFilter.vue'
import Results from './Results.vue'
import { useSearch } from '~/composables/useSearch'
import { usePlaylist, type PlaylistEntry } from '~/composables/usePlaylist'

const search = useSearch()
const playlist = usePlaylist()

const query = ref('')
const loading = ref(false)
const rawResults = ref<PlaylistEntry[]>([])
const filter = ref<'all' | 'film' | 'tv-series'>('all')
const groups = ref<string[]>([])
const groupOptions = ref<string[]>([])

const results = ref<PlaylistEntry[]>([])

const pageSize = 20
const offset = ref(0)
const pagedResults = computed(() => results.value)
const loadingMore = ref(false)
const noMore = ref(false)

async function performSearch() {
    const trimmed = query.value.trim()
    offset.value = 0
    noMore.value = false
    loading.value = true
    try {
        if (!trimmed) {
            results.value = await search.getAllPaged(offset.value, pageSize, filter.value, groups.value)
        } else {
            results.value = await search.searchByTitlePaged(trimmed, offset.value, pageSize, filter.value, groups.value)
        }
        if (results.value.length < pageSize) noMore.value = true
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    // Ensure we have data in the index at least once
    if (!playlist.lastRefreshedAt.value) {
        await playlist.refresh()
    } else {
        // optionally seed index again if empty
        await search.upsertAll([...playlist.movies.value, ...playlist.liveStreams.value])
    }
    results.value = await search.getAllPaged(0, pageSize, filter.value, groups.value)
    if (results.value.length < pageSize) noMore.value = true
    groupOptions.value = await search.getGroups(filter.value)
})

watch(filter, async (val) => {
    offset.value = 0
    noMore.value = false
    loading.value = true
    try {
        const q = query.value.trim()
        if (!q) results.value = await search.getAllPaged(0, pageSize, val, groups.value)
        else results.value = await search.searchByTitlePaged(q, 0, pageSize, val, groups.value)
        if (results.value.length < pageSize) noMore.value = true
        groupOptions.value = await search.getGroups(val)
        groups.value = []
    } finally {
        loading.value = false
    }
})

watch(groups, async (val) => {
    offset.value = 0
    noMore.value = false
    loading.value = true
    try {
        const q = query.value.trim()
        if (!q) results.value = await search.getAllPaged(0, pageSize, filter.value, val)
        else results.value = await search.searchByTitlePaged(q, 0, pageSize, filter.value, val)
        if (results.value.length < pageSize) noMore.value = true
    } finally {
        loading.value = false
    }
})

const sentinel = ref<HTMLElement | null>(null)
const { stop: stopObserver } = useIntersectionObserver(
    sentinel,
    (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        if (loading.value || loadingMore.value || noMore.value) return
        loadingMore.value = true
        const currentQuery = query.value.trim()
        const nextOffset = offset.value + pageSize
        ;(async () => {
            try {
                let batch: PlaylistEntry[] = []
                if (!currentQuery) batch = await search.getAllPaged(nextOffset, pageSize, filter.value, groups.value)
                else batch = await search.searchByTitlePaged(currentQuery, nextOffset, pageSize, filter.value, groups.value)
                if (batch.length > 0) {
                    offset.value = nextOffset
                    results.value = results.value.concat(batch)
                } else {
                    noMore.value = true
                }
            } finally {
                loadingMore.value = false
            }
        })()
    },
    { threshold: 1, rootMargin: '0px' }
)
</script>
<template>
    <section>
        <TopBar v-model:query="query" v-model:filter="filter" @submit="performSearch" />
        <div class="mt-2">
            <GroupFilter v-model="groups" :options="groupOptions" />
        </div>

        <Results :items="pagedResults" :loading="loading" />
        <div ref="sentinel" class="h-6"></div>
    </section>
</template>
