<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'
import ResultCard from './ResultCard.vue'

defineProps<{ items: PlaylistEntry[]; loading?: boolean }>()
</script>

<template>
    <div class="mt-4">
        <div v-if="loading" class="text-sm text-muted-foreground">Searching...</div>
        <div v-else-if="!items?.length" class="text-sm text-muted-foreground">No results</div>
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ResultCard v-for="it in items" :key="it.title + it.url" :item="it" />
        </div>
    </div>
</template>


