<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

const props = defineProps<{ item: PlaylistEntry }>()

const slug = computed(() => (props.item.title || '').toLowerCase())
</script>

<template>
    <NuxtLink :to="`/browse/${slug}`" class="block rounded-[--radius] border border-border bg-card overflow-hidden hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <div class="aspect-video bg-muted/50">
            <img v-if="item.logo" :src="item.logo" alt="" class="w-full h-full object-cover" />
        </div>
        <div class="p-3 space-y-1">
            <div class="text-sm font-medium line-clamp-2">{{ item.title }}</div>
            <div class="text-xs text-muted-foreground truncate">{{ item.groupTitle }}</div>
            <div class="text-xs text-muted-foreground truncate" v-if="item.movieType">{{ item.movieType }}</div>
        </div>
    </NuxtLink>
</template>


