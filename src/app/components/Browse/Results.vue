<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

defineProps<{ items: PlaylistEntry[]; loading?: boolean }>()
</script>

<template>
    <div class="mt-4">
        <div v-if="loading" class="text-sm text-muted-foreground">Searching...</div>
        <div v-else-if="!items?.length" class="text-sm text-muted-foreground">No results</div>
        <ul v-else class="grid gap-2">
            <li v-for="it in items" :key="it.title + it.url" class="p-3 rounded-[--radius] border border-border bg-card flex items-center gap-3">
                <img v-if="it.logo" :src="it.logo" alt="" class="w-10 h-10 rounded object-cover bg-muted" />
                <div class="min-w-0">
                    <div class="text-sm font-medium truncate">{{ it.title }}</div>
                    <div class="text-xs text-muted-foreground truncate">{{ it.groupTitle }}</div>
                </div>
                <div class="ml-auto text-xs text-muted-foreground">
                    <span v-if="it.movieType">{{ it.movieType }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>


