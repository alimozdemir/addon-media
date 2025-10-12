<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

defineProps<{ item: PlaylistEntry }>()
</script>

<template>
    <div class="grid gap-4 md:grid-cols-[320px_1fr]">
        <div class="aspect-video bg-muted/50 rounded-[--radius] overflow-hidden">
            <img v-if="item.logo" :src="item.logo" alt="" class="w-full h-full object-cover" />
        </div>
        <div class="space-y-2">
            <h1 class="text-xl font-semibold">{{ item.title }}</h1>
            <div class="text-sm text-muted-foreground">{{ item.groupTitle }}</div>
            <div class="text-sm" v-if="item.movieType">Type: {{ item.movieType }}</div>
        </div>
    </div>
</template>


