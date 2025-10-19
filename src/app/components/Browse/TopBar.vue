<script setup lang="ts">
import SearchInput from './SearchInput.vue'

const query = defineModel<string>('query', { default: '' })
const filter = defineModel<'all' | 'film' | 'tv-series'>('filter', { default: 'all' })
const emit = defineEmits<{ (e: 'submit', value: string): void }>()

function handleSubmit(val: string) {
    emit('submit', val)
}
</script>

<template>
    <div class="sticky top-0 z-10 py-4 bg-card border-b border-border">
        <div class="py-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div class="inline-flex items-center gap-1 p-1 rounded-[--radius] border border-border bg-background overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-2">
                <button type="button"
                    class="px-2 h-8 rounded text-sm whitespace-nowrap"
                    :class="filter === 'all' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
                    @click="filter = 'all'">All</button>
                <button type="button"
                    class="px-2 h-8 rounded text-sm whitespace-nowrap"
                    :class="filter === 'film' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
                    @click="filter = 'film'">Film</button>
                <button type="button"
                    class="px-2 h-8 rounded text-sm whitespace-nowrap"
                    :class="filter === 'tv-series' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'"
                    @click="filter = 'tv-series'">TV Series</button>
            </div>
            <div class="w-full sm:ml-auto sm:max-w-md">
                <SearchInput v-model="query" @submit="handleSubmit" />
            </div>
        </div>
    </div>
</template>


