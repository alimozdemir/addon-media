<script setup lang="ts">
import type { PlaylistEntry } from '~/composables/usePlaylist'

defineProps<{ item: PlaylistEntry }>()
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
            <slot />
        </div>
    </div>
</template>


