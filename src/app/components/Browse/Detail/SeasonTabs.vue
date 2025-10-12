<script setup lang="ts">
const props = defineProps<{ seasons: string[] }>()
const selected = defineModel<string | null>('selected', { default: null })
</script>

<template>
    <div class="border-b border-border">
        <div class="flex gap-2 overflow-x-auto py-1">
            <button
                v-for="num in props.seasons"
                :key="num"
                type="button"
                class="px-3 py-1.5 rounded text-sm whitespace-nowrap"
                :class="selected === num ? 'bg-muted text-foreground border border-border' : 'text-muted-foreground hover:bg-muted'"
                @click="selected = num"
            >
                Season {{ num }}
            </button>
        </div>
    </div>
</template>


