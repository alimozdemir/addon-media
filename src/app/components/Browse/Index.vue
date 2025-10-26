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
const filter = ref<'all' | 'film' | 'tv-series'>('all')
const groups = ref<string[]>([])
const groupOptions = ref<string[]>([])

const results = ref<PlaylistEntry[]>([])

const { height } = useWindowSize();
const { y } = useWindowScroll();

const pageSize = computed(() => height.value < 900 ? 20 : 40);
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
            results.value = await search.getAllPaged(offset.value, pageSize.value, filter.value, groups.value)
        } else {
            results.value = await search.searchByTitlePaged(trimmed, offset.value, pageSize.value, filter.value, groups.value)
        }
        if (results.value.length < pageSize.value) noMore.value = true
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    // Ensure we have data in the index at least once
    if (!playlist.lastRefreshedAt.value) {
        await playlist.refresh()
    } else {
        // seed only movies
        await search.upsertAll([...playlist.movies.value])
    }
    results.value = await search.getAllPaged(0, pageSize.value, filter.value, groups.value)
    if (results.value.length < pageSize.value) noMore.value = true
    groupOptions.value = await search.getGroups(filter.value)
})

watch(() => playlist.lastRefreshedAt.value, async () => {
    offset.value = 0
    noMore.value = false
    loading.value = true
    try {
        // refresh results and groups after playlist sync completes
        const q = query.value.trim()
        if (!q) results.value = await search.getAllPaged(0, pageSize.value, filter.value, groups.value)
        else results.value = await search.searchByTitlePaged(q, 0, pageSize.value, filter.value, groups.value)
        if (results.value.length < pageSize.value) noMore.value = true
        groupOptions.value = await search.getGroups(filter.value)
        // drop any selected groups that no longer exist
        if (groups.value.length > 0) groups.value = groups.value.filter(g => groupOptions.value.includes(g))
    } finally {
        loading.value = false
    }
})

watch(filter, async (val) => {
    offset.value = 0
    noMore.value = false
    loading.value = true
    try {
        const q = query.value.trim()
        if (!q) results.value = await search.getAllPaged(0, pageSize.value, val, groups.value)
        else results.value = await search.searchByTitlePaged(q, 0, pageSize.value, val, groups.value)
        if (results.value.length < pageSize.value) noMore.value = true
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
        if (!q) results.value = await search.getAllPaged(0, pageSize.value, filter.value, val)
        else results.value = await search.searchByTitlePaged(q, 0, pageSize.value, filter.value, val)
        if (results.value.length < pageSize.value) noMore.value = true
    } finally {
        loading.value = false
    }
}, { deep: true })

const sentinel = ref<HTMLElement | null>(null)
const { stop: stopObserver } = useIntersectionObserver(
    sentinel,
    (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        if (loading.value || loadingMore.value || noMore.value) return
        loadingMore.value = true
        const currentQuery = query.value.trim()
        const nextOffset = results.value.length
        ;(async () => {
            try {
                let batch: PlaylistEntry[] = []
                if (!currentQuery) batch = await search.getAllPaged(nextOffset, pageSize.value, filter.value, groups.value)
                else batch = await search.searchByTitlePaged(currentQuery, nextOffset, pageSize.value, filter.value, groups.value)
                if (batch.length > 0) {
                    offset.value = results.value.length + batch.length
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

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

</script>
<template>
    <section>
        <TopBar v-model:query="query" v-model:filter="filter" @submit="performSearch" class="hidden sm:block" />
        <div class="mt-2">
            <GroupFilter v-model="groups" v-model:query="query" v-model:filter="filter" :options="groupOptions" @submit="performSearch" />
        </div>

        <Results :items="pagedResults" :loading="loading" :loading-more="loadingMore" />
        <div ref="sentinel" class="h-6"></div>
        <button
            v-if="y > 100"
            type="button"
            class="fixed bottom-4 sm:bottom-10 left-4 z-40 w-12 h-12 rounded-full shadow-lg bg-accent border border-border text-foreground flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="scrollToTop"
            aria-label="Clear filters"
        >
            <i-arrow-up class="w-5 h-5" />
            <span class="sr-only">Clear filters</span>
        </button>
    </section>
</template>
