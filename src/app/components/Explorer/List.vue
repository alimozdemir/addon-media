<script setup lang="ts">
import type { FileEntry } from '~~/types/files';

const props = defineProps<{ entries: FileEntry[] }>();
const emit = defineEmits<{ (e: 'open', entry: FileEntry): void }>();
</script>

<template>
    <ul class="rounded-[--radius] border border-border bg-card divide-y divide-border">
        <li v-for="e in props.entries" :key="e.absolutePath">
            <button
                type="button"
                class="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-muted transition"
                @click="emit('open', e)"
            >
                <i-folder v-if="e.type === 'directory'" class="text-primary" />
                <i-file v-else-if="e.type === 'file'" class="text-muted-foreground" />
                <i-link-simple v-else-if="e.type === 'symlink'" class="text-muted-foreground" />
                <i-question v-else class="text-muted-foreground" />
                <span class="truncate">{{ e.name }}</span>
            </button>
        </li>
    </ul>
</template>


