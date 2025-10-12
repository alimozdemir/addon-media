<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

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
</script>

<template>
    <div class="flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-auto md:min-w-[360px] md:max-w-[420px]">
            <div class="bg-muted/50 rounded-[--radius] overflow-hidden flex items-center justify-center">
                <img v-if="item.logo" :src="item.logo" alt="" class="w-full h-auto md:w-auto md:max-w-full object-contain" />
            </div>
        </div>
        <div class="flex-1 space-y-4">
            <div class="space-y-2">
                <h1 class="text-2xl font-semibold leading-tight">{{ item.title }}</h1>
                <div class="text-sm text-muted-foreground">{{ item.groupTitle }}</div>
                <div class="text-sm" v-if="item.movieType">Type: {{ item.movieType }}</div>
            </div>

            <div v-if="isSeries" class="space-y-3">
                <div class="border-b border-border">
                    <div class="flex gap-2 overflow-x-auto py-1">
                        <button
                            v-for="num in seasonNumbers"
                            :key="num"
                            type="button"
                            class="px-3 py-1.5 rounded text-sm whitespace-nowrap"
                            :class="selectedSeason === num ? 'bg-muted text-foreground border border-border' : 'text-muted-foreground hover:bg-muted'"
                            @click="selectedSeason = num"
                        >
                            Season {{ num }}
                        </button>
                    </div>
                </div>
                <div class="space-y-2">
                    <h2 class="text-sm font-medium text-muted-foreground">Episodes</h2>
                    <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <li v-for="ep in currentEpisodes" :key="ep.title + ep.url" class="rounded-[--radius] border border-border bg-card p-3">
                            <div class="text-sm font-medium line-clamp-2">{{ ep.title }}</div>
                            <div class="text-xs text-muted-foreground">{{ ep.groupTitle }}</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>


