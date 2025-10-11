<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

defineProps<{ items: PlaylistEntry[]; loading?: boolean }>()
</script>

<template>
    <div class="mt-4">
        <div v-if="loading" class="text-sm text-muted-foreground">Searching...</div>
        <div v-else-if="!items?.length" class="text-sm text-muted-foreground">No results</div>
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <article v-for="it in items" :key="it.title + it.url" class="rounded-[--radius] border border-border bg-card overflow-hidden">
                <div class="aspect-video bg-muted/50">
                    <img v-if="it.logo" :src="it.logo" alt="" class="w-full h-full object-cover" />
                </div>
                <div class="p-3 space-y-1">
                    <div class="text-sm font-medium line-clamp-2">{{ it.title }}</div>
                    <div class="text-xs text-muted-foreground">{{ it.groupTitle }}</div>
                    <div class="text-xs text-muted-foreground" v-if="it.movieType">{{ it.movieType }}</div>
                </div>
            </article>
        </div>
    </div>
</template>


