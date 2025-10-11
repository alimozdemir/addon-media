<script setup lang="ts">
import SearchInput from './SearchInput.vue'

const query = defineModel<string>('query', { default: '' })
const filter = defineModel<'all' | 'film' | 'tv-series'>('filter', { default: 'all' })
</script>

<template>
    <div class="sticky top-0 z-10 py-4 bg-card border-b border-border">
        <div class="py-2 flex items-center gap-2">
            <div class="inline-flex items-center gap-1 p-1 rounded-[--radius] border border-border bg-background">
                <button type="button"
                    class="px-2 h-8 rounded text-sm"
                    :class="filter === 'all' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
                    @click="filter = 'all'">All</button>
                <button type="button"
                    class="px-2 h-8 rounded text-sm"
                    :class="filter === 'film' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
                    @click="filter = 'film'">Film</button>
                <button type="button"
                    class="px-2 h-8 rounded text-sm"
                    :class="filter === 'tv-series' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
                    @click="filter = 'tv-series'">TV Series</button>
            </div>
            <div class="ml-auto w-full max-w-md">
                <SearchInput v-model="query" />
            </div>
        </div>
    </div>
</template>


