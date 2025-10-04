<script setup lang="ts">
import type { FileEntry } from '~~/types/files';

const props = defineProps<{ entries: FileEntry[] }>();
const emit = defineEmits<{ (e: 'open', entry: FileEntry): void }>();
</script>

<template>
    <ul>
        <li v-for="e in props.entries" :key="e.absolutePath">
            <button type="button" @click="emit('open', e)">
                <span v-if="e.type === 'directory'">📁</span>
                <span v-else-if="e.type === 'file'">📄</span>
                <span v-else-if="e.type === 'symlink'">🔗</span>
                <span v-else>❔</span>
                {{ e.name }}
            </button>
        </li>
    </ul>
</template>


