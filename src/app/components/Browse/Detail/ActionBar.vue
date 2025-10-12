<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

const props = defineProps<{ isSeries: boolean; selectedEpisodes: PlaylistEntry[]; selectedSeason: string | null }>()
const emit = defineEmits<{ (e: 'download'): void; (e: 'clear'): void }>()

function extractEpisodeNumber(title: string): string | null {
    const t = (title || '').trim()
    const patterns: RegExp[] = [
        /S(\d{1,2})\s*E(\d{1,3})/i,
        /(\d{1,2})x(\d{1,3})/i,
        /Season\s*(\d{1,2})\s*Episode\s*(\d{1,3})/i,
        /S(\d{1,2})\s*Ep?(\d{1,3})/i,
    ]
    for (const rx of patterns) {
        const m = t.match(rx)
        if (m) return `S${m[1]}E${m[2]}`
    }
    return null
}

const actionLabel = computed(() => {
    if (!props.isSeries) return 'Download'
    const count = props.selectedEpisodes.length
    if (count === 0) return props.selectedSeason ? `Download Season ${props.selectedSeason}` : 'Download Season'
    if (count === 1) {
        const ep = props.selectedEpisodes[0]
        const epNum = ep ? extractEpisodeNumber(ep.title) : null
        return epNum ? `Download ${epNum}` : 'Download episode'
    }
    return `Download ${count} episodes`
})
</script>

<template>
    <!-- Mobile floating action bar -->
    <div class="fixed inset-x-0 bottom-0 z-20 p-3 md:hidden">
        <div class="mx-auto max-w-screen-sm rounded-[--radius] border border-border bg-card shadow-lg">
            <div class="p-3 flex items-center gap-2">
                <button type="button" class="ml-auto px-4 h-10 rounded bg-primary text-primary-foreground text-sm" @click="emit('download')">{{ actionLabel }}</button>
            </div>
            <div v-if="isSeries" class="px-3 pb-3 text-xs text-muted-foreground flex items-center gap-2">
                <button type="button" class="underline" v-if="selectedEpisodes.length > 0" @click="emit('clear')">Clear selections</button>
                <span v-if="selectedEpisodes.length > 0">• {{ selectedEpisodes.length }} selected</span>
            </div>
        </div>
    </div>

    <!-- Desktop sticky action panel -->
    <div class="hidden md:block mt-6">
        <div class="rounded-[--radius] border border-border bg-card p-3 flex items-center gap-3">
            <div class="text-sm text-muted-foreground" v-if="isSeries">
                <span v-if="selectedEpisodes.length === 0">Season {{ selectedSeason || '' }}</span>
                <span v-else>{{ selectedEpisodes.length }} episode(s) selected</span>
            </div>
            <div class="ml-auto flex items-center gap-2">
                <button type="button" v-if="isSeries && selectedEpisodes.length > 0" class="px-3 h-9 rounded text-sm border border-border hover:bg-muted" @click="emit('clear')">Clear</button>
                <button type="button" class="px-4 h-9 rounded bg-primary text-primary-foreground text-sm" @click="emit('download')">{{ actionLabel }}</button>
            </div>
        </div>
    </div>
</template>


