<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

const props = defineProps<{ episodes: PlaylistEntry[] }>()
const selectedKeys = defineModel<string[]>('selectedKeys', { default: [] })

function episodeKey(ep: PlaylistEntry): string {
    return `${ep.title}|${ep.url}`
}

function isSelected(ep: PlaylistEntry): boolean {
    return selectedKeys.value.includes(episodeKey(ep))
}

function toggle(ep: PlaylistEntry) {
    const key = episodeKey(ep)
    const idx = selectedKeys.value.indexOf(key)
    if (idx === -1) selectedKeys.value = [...selectedKeys.value, key]
    else selectedKeys.value = selectedKeys.value.filter(k => k !== key)
}
</script>

<template>
    <div class="space-y-2">
        <h2 class="text-sm font-medium text-muted-foreground">Episodes</h2>
        <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="ep in props.episodes" :key="ep.title + ep.url" class="rounded-[--radius] border border-border bg-card p-3">
                <label class="flex items-start gap-3 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        class="mt-1 h-4 w-4"
                        :checked="isSelected(ep)"
                        @change="toggle(ep)"
                    />
                    <span class="space-y-0.5">
                        <div class="text-sm font-medium leading-snug line-clamp-2">{{ ep.title }}</div>
                        <div class="text-xs text-muted-foreground">{{ ep.groupTitle }}</div>
                    </span>
                </label>
            </li>
        </ul>
    </div>
</template>


