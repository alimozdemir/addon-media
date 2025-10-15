<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'
import type { Progress } from '~~/types/progress'

const props = defineProps<{
    isSeries: boolean;
    selectedEpisodes: PlaylistEntry[];
    selectedSeason: string | null;
    progress?: Progress | null;
    seriesPercent?: number | null;
    seriesState?: 'pending' | 'downloading' | 'completed' | 'failed' | null;
}>()
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
                <button type="button" class="ml-auto px-4 h-10 rounded bg-primary text-primary-foreground text-sm active:scale-95 transition cursor-pointer" @click="emit('download')">{{ actionLabel }}</button>
            </div>
            <!-- Movie download progress/state (mobile) -->
            <div v-if="!isSeries && props.progress" class="px-3 pb-2">
                <div class="h-2 w-full bg-muted rounded overflow-hidden">
                    <div class="h-full bg-primary" :style="{ width: `${Math.max(0, Math.min(100, props.progress?.progress || 0))}%` }"></div>
                </div>
                <div class="mt-1 text-xs text-muted-foreground capitalize">
                    {{ props.progress?.state }}<span v-if="props.progress && props.progress.state !== 'completed'"> • {{ Math.round(props.progress?.progress || 0) }}%</span>
                </div>
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
            <div class="text-sm text-muted-foreground">
                <template v-if="isSeries">
                    <template v-if="props.seriesPercent != null">
                        <span class="capitalize">{{ props.seriesState || 'downloading' }}</span>
                        <span v-if="props.seriesState !== 'completed'"> • {{ props.seriesPercent }}%</span>
                    </template>
                    <template v-else>
                        <span v-if="selectedEpisodes.length === 0">Season {{ selectedSeason || '' }}</span>
                        <span v-else>{{ selectedEpisodes.length }} episode(s) selected</span>
                    </template>
                </template>
                <template v-else-if="props.progress">
                    <span class="capitalize">{{ props.progress.state }}</span>
                    <span v-if="props.progress.state !== 'completed'"> • {{ Math.round(props.progress.progress || 0) }}%</span>
                </template>
            </div>
            <div v-if="!isSeries && props.progress" class="w-40 h-2 bg-muted rounded overflow-hidden">
                <div class="h-full bg-primary" :style="{ width: `${Math.max(0, Math.min(100, props.progress?.progress || 0))}%` }"></div>
            </div>
            <div v-else-if="isSeries && props.seriesPercent != null" class="w-40 h-2 bg-muted rounded overflow-hidden">
                <div class="h-full bg-primary" :style="{ width: `${Math.max(0, Math.min(100, props.seriesPercent || 0))}%` }"></div>
            </div>
            <div class="ml-auto flex items-center gap-2">
                <button type="button" v-if="isSeries && selectedEpisodes.length > 0" class="px-3 h-9 rounded text-sm border border-border hover:bg-muted" @click="emit('clear')">Clear</button>
                <button type="button" class="px-4 h-9 rounded bg-primary text-primary-foreground text-sm active:scale-95 transition cursor-pointer" @click="emit('download')">{{ actionLabel }}</button>
            </div>
        </div>
    </div>
</template>


